<template>
  <AppModal
    :isOpened="isOpened"
    title="Анализ Лобби"
    :isClosableByClickOutside="false"
    maxWidth="800px"
    @closeModal="closeModal"
  >
    <div class="mp-modal">
      <div class="mp-modal__search-row">
        <v-number-input
          v-model="chosenMpLinkId"
          :min="0"
          :max="1000000000"
          variant="solo"
          control-variant="hidden"
          prepend-inner-icon="mdi-identifier"
          label="MP Link ID"
          placeholder="Введи MP Link ID ('https://osu.ppy.sh/community/matches/<ID>')"
          clearable
          hide-details
          class="mp-modal__input"
        />
        <v-btn
          :loading="isFetching"
          :disabled="!chosenMpLinkId"
          height="56"
          class="mp-modal__search-btn"
          @click="fetchAndProcessLobby"
        >
          Найти лобби
        </v-btn>
      </div>
      <div v-if="hasSearched">
        <v-divider class="border-opacity-100 mp-modal__divider" />
        <div v-if="isFetching" class="mp-modal__loader">
          <v-progress-circular
            indeterminate
            color="var(--color-btn-mp)"
            size="40"
          />
          <span>
            {{
              isLoadingDependencies
                ? "Подгружаем базу карт и старые скоры..."
                : "Скачиваем данные лобби..."
            }}
          </span>
        </div>
        <template v-else>
          <div v-if="groupedScores.length === 0" class="mp-modal__no-data">
            В этом лобби не найдено твоих турнирных скоров (ищутся только твои
            скоры и только на картах из базы BOTM, в ScoreV2, в режиме osu! std)
          </div>
          <div v-else class="mp-modal__groups-wrapper">
            <h3 class="mp-modal__groups-title">
              Подходящие скоры ({{ validScoresCount }}):
            </h3>
            <ParsedScoresList
              :groupedScores="groupedScores"
              @toggle-score="toggleScoreSelection"
            />
          </div>
        </template>
      </div>
    </div>
    <template #actions>
      <div class="mp-modal__actions">
        <v-btn class="mp-modal__cancel-btn" height="50" @click="closeModal">
          Отмена
        </v-btn>
        <v-btn
          :disabled="selectedScoresCount === 0 || isLoadingDependencies"
          :loading="isUploading"
          class="mp-modal__confirm-btn"
          height="50"
          @click="confirmAndUpload"
        >
          Загрузить скоры ({{ selectedScoresCount }})
        </v-btn>
      </div>
    </template>
  </AppModal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from "vue";
import ParsedScoresList from "@/components/scores/ParsedScoresList.vue";
import useToast from "@/composables/useToast";
import { useAuthStore } from "@/stores/auth";
import { useOsumapsStore } from "@/stores/osumaps";
import { useScoresStore } from "@/stores/scores";
import { isValidModCombinationForCategory } from "@/utils";
import {
  getAdjustedScore,
  getMaxScoreForMods,
  calculateBasePoints,
} from "@/utils/scores-calcs";
import { OsuMapCategory } from "@/types/osumaps";
import {
  type IOsuApiEvent,
  type IOsuApiScore,
  type IMpModalScore,
  type IMpModalGroup,
  isOsuScoreMod,
} from "@/types/scores";

const props = defineProps<{ isOpened: boolean }>();

const emit = defineEmits<{ (e: "closeModal"): void }>();

const authStore = useAuthStore();
const mapsStore = useOsumapsStore();
const scoresStore = useScoresStore();

const { setErrorToast, setSuccessToast } = useToast();

const chosenMpLinkId = ref<number | null>(null);
const isFetching = ref(false);
const isUploading = ref(false);
const hasSearched = ref(false);
const isLoadingDependencies = ref(false);
const groupedScores = ref<IMpModalGroup[]>([]);

const currentOsuId = computed(() => authStore.userAdditionalInfo?.osuId);
const currentUserUid = computed(() => authStore.user?.uid);

const validScoresCount = computed(() => {
  let count = 0;
  groupedScores.value.forEach((group) => {
    count += group.scores.filter((s) => !s.isDbScore).length;
  });
  return count;
});

const selectedScoresCount = computed(() => {
  let count = 0;
  groupedScores.value.forEach((group) => {
    count += group.scores.filter((s) => s.isSelected).length;
  });
  return count;
});

watch(
  () => props.isOpened,
  (newVal) => {
    if (newVal) {
      chosenMpLinkId.value = null;
      hasSearched.value = false;
      groupedScores.value = [];
    }
  }
);

const closeModal = () => emit("closeModal");

const loadDependencies = async () => {
  isLoadingDependencies.value = true;
  try {
    await Promise.all([mapsStore.loadAllMaps(), scoresStore.loadAllScores()]);
  } catch (error) {
    console.error("Failed to load map dependencies:", error);
  } finally {
    isLoadingDependencies.value = false;
  }
};

const fetchAndProcessLobby = async () => {
  if (!currentOsuId.value) {
    setErrorToast("Твой osu! ID не привязан к профилю!");
    return;
  }

  if (!chosenMpLinkId.value) {
    setErrorToast("Введи корректный MP Link ID");
    return;
  }

  hasSearched.value = true;
  isFetching.value = true;

  try {
    const response = await fetch(
      `https://botm-hub-api.vercel.app/api/match?id=${chosenMpLinkId.value}`
    );

    if (!response.ok) {
      let errorText = `Ошибка сервера: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) errorText = errorData.error;
      } catch (error) {
        console.error("For some reason both-hub-api returned not JSON:", error);
      }
      if (response.status === 404 || errorText.includes("404")) {
        throw new Error("Лобби с таким ID не существует!");
      }
      if (response.status === 401 || errorText.includes("401")) {
        throw new Error("Это приватное лобби! API osu! не даёт к нему доступ!");
      }
      throw new Error(errorText);
    }

    const data = await response.json();

    await loadDependencies();

    const rawScores = extractMyScores(data.events ?? []);
    groupedScores.value = groupAndFormatScores(rawScores);

    if (groupedScores.value.length > 0) {
      setSuccessToast("Лобби проанализировано 📋");
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    setErrorToast(`Ошибка: ${msg}`);
    hasSearched.value = false;
  } finally {
    isFetching.value = false;
  }
};

const extractMyScores = (events: IOsuApiEvent[]): IOsuApiScore[] => {
  const extracted: IOsuApiScore[] = [];

  for (const event of events) {
    const game = event.game;
    if (
      !game ||
      game.mode !== "osu" ||
      game.scoring_type !== "scorev2" ||
      !game.scores
    )
      continue;

    const myScore = game.scores.find(
      (s) => String(s.user_id) === String(currentOsuId.value)
    );

    if (myScore) {
      const gameMods: string[] = game.mods ?? [];
      const scoreMods: string[] = myScore.mods ?? [];

      const allMods = Array.from(new Set([...gameMods, ...scoreMods]))
        .filter((mod) => mod !== "NF")
        .sort();

      let mapInfo = null;
      if (game.beatmap) {
        const bm = game.beatmap;
        const bms = bm.beatmapset;
        mapInfo = {
          title: bms?.title || "Unknown Title",
          version: bm.version || "Unknown",
          coverUrl: bms?.covers?.cover || null,
          fullName: `${bms?.artist || "Unknown"} - ${bms?.title || "Unknown"} [${bm.version || "Unknown"}]`,
          stars: bm.difficulty_rating || 0,
        };
      }

      extracted.push({
        gameId: game.id,
        mapId: game.beatmap_id,
        mapInfo: mapInfo,
        mods: allMods,
        score: myScore.score,
        combo: myScore.max_combo,
        accuracy: myScore.accuracy,
        passed: myScore.passed,
        rank: myScore.rank,
        date: new Date(myScore.created_at),
      });
    }
  }
  return extracted;
};

const groupAndFormatScores = (rawScores: IOsuApiScore[]): IMpModalGroup[] => {
  const groupsMap = new Map<string, IMpModalGroup>();
  const allMaps = mapsStore.getMapsOfGivenCategories(
    Object.values(OsuMapCategory)
  );

  rawScores.forEach((score) => {
    const dbMap = allMaps.find(
      (m) =>
        m.id === score.mapId &&
        isValidModCombinationForCategory(score.mods, m.category)
    );
    if (!dbMap) return;

    const stars = dbMap.starRate;
    const groupKey = `${score.mapId}_${score.mods.join("")}`;

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        id: groupKey,
        mapId: score.mapId,
        mods: score.mods,
        mapInfo: score.mapInfo,
        dbMapInfo: dbMap,
        stars: stars,
        scores: [],
      });
    }

    const adjustedScore = getAdjustedScore(score.score, score.mods);
    const maxScore = getMaxScoreForMods(score.mods);
    const percentage = (adjustedScore / maxScore) * 100;
    const isInsufficient = percentage < 60;

    let calculatedPoints = 0;
    if (!isInsufficient && adjustedScore > 0) {
      calculatedPoints = calculateBasePoints(percentage, stars);
    }

    groupsMap.get(groupKey)!.scores.push({
      gameId: score.gameId,
      score: adjustedScore,
      accuracy: score.accuracy,
      combo: score.combo,
      rank: score.rank,
      passed: score.passed,
      percentage,
      isInsufficient,
      points: calculatedPoints,
      isSelected: false,
      isDbScore: false,
      mapId: score.mapId,
      mods: score.mods,
      date: score.date,
    });
  });

  const finalGroups = Array.from(groupsMap.values());

  finalGroups.forEach((group) => {
    if (currentUserUid.value) {
      const rawModKey = (
        group.mods.length ? group.mods.join("") : "nm"
      ).toLowerCase();

      if (isOsuScoreMod(rawModKey)) {
        const dbScore =
          scoresStore.allScores[currentUserUid.value]?.[group.mapId]?.[
            rawModKey
          ];

        if (dbScore) {
          const maxScore = getMaxScoreForMods(group.mods);
          const percentage = (dbScore.score / maxScore) * 100;

          group.scores.push({
            gameId: `db_${group.mapId}_${rawModKey}`,
            score: dbScore.score,
            accuracy: dbScore.accuracy / 100,
            combo: dbScore.combo,
            rank: dbScore.rank,
            passed: true,
            percentage,
            isInsufficient: false,
            points: dbScore.points,
            isSelected: false,
            isDbScore: true,
            date: dbScore.date,
          });
        }
      }
    }

    group.scores.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.isDbScore) return -1;
      if (b.isDbScore) return 1;
      return 0;
    });

    const dbScoreObj = group.scores.find((s) => s.isDbScore);
    const bestNewScore = group.scores.find(
      (s) => !s.isDbScore && !s.isInsufficient
    );

    if (bestNewScore) {
      if (!dbScoreObj || bestNewScore.score > dbScoreObj.score) {
        bestNewScore.isSelected = true;
      }
    }
  });

  return finalGroups;
};

const toggleScoreSelection = (
  group: IMpModalGroup,
  toggledScore: IMpModalScore
) => {
  if (toggledScore.isDbScore || toggledScore.isInsufficient) return;

  const wasSelected = toggledScore.isSelected;

  group.scores.forEach((s) => {
    s.isSelected = false;
  });

  if (!wasSelected) {
    toggledScore.isSelected = true;
  }
};

const confirmAndUpload = async () => {
  if (!currentUserUid.value) return;

  const selectedToUpload: IMpModalScore[] = [];
  groupedScores.value.forEach((group) => {
    const selected = group.scores.filter((s) => s.isSelected);
    selectedToUpload.push(...selected);
  });

  if (selectedToUpload.length === 0) return;

  try {
    isUploading.value = true;
    await scoresStore.uploadScores(currentUserUid.value, selectedToUpload);
    setSuccessToast(
      `🥳🥳🥳 Успешно загружено скоров: ${selectedToUpload.length} 🥳🥳🥳`
    );
    closeModal();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    setErrorToast(`Не удалось загрузить скоры: ${msg}`);
  } finally {
    isUploading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.mp-modal {
  display: flex;
  flex-direction: column;
  gap: 10px;
  &__search-row {
    display: flex;
    gap: 10px;
    align-items: center;
    @media (max-width: $phone-l) {
      flex-direction: column;
    }
  }
  &__input {
    flex-grow: 1;
    @media (max-width: $tablet-m) {
      width: 100%;
    }
  }
  &__search-btn {
    @include default-btn(
      180px,
      var(--color-text-white),
      var(--color-btn-mp),
      0
    );
    @media (max-width: $phone-l) {
      max-width: none;
    }
  }
  &__divider {
    margin-bottom: 10px;
  }
  &__loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 15px;
    padding: 30px;
    @include default-text(16px, 16px, var(--color-text));
  }
  &__no-data {
    @include default-text(16px, 16px, var(--color-text));
    padding: 20px;
    text-align: center;
  }
  &__groups-wrapper {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }
  &__groups-title {
    @include default-headline(24px, 24px, var(--color-text));
  }
  &__actions {
    display: flex;
    gap: 10px;
    width: 100%;
    @media (max-width: $tablet-s) {
      flex-direction: column-reverse;
      align-items: stretch;
    }
  }
  &__cancel-btn {
    flex: 1;
    @include default-btn(
      100%,
      var(--color-text-white),
      var(--color-btn-cancel-bg),
      0
    );
    @media (max-width: $tablet-s) {
      flex: none;
    }
  }
  &__confirm-btn {
    flex: 1;
    @include default-btn(100%, var(--color-text-white), var(--color-btn-mp), 0);
    &:disabled {
      opacity: 0.5;
    }
    @media (max-width: $tablet-s) {
      flex: none;
    }
  }
}
</style>
