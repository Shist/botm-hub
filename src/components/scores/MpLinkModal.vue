<template>
  <AppModal
    :isOpened="isOpened"
    title="Анализ лобби"
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
      <div v-if="hasSearched" class="mp-modal__results">
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
            <h3 class="mp-modal__groups-title">Найденные скоры:</h3>
            <div class="mp-modal__groups-list">
              <div
                v-for="group in groupedScores"
                :key="group.id"
                class="mp-modal__group-card"
              >
                <v-img
                  :src="
                    group.mapInfo?.coverUrl ||
                    `https://assets.ppy.sh/beatmaps/${group.mapId}/covers/cover.jpg`
                  "
                  cover
                  class="mp-modal__group-bg"
                />
                <div class="mp-modal__group-overlay">
                  <div class="mp-modal__group-header">
                    <div class="mp-modal__map-title-wrapper">
                      <span
                        class="mp-modal__map-title"
                        :title="group.mapInfo?.fullName"
                      >
                        {{
                          group.mapInfo?.fullName ||
                          `Неизвестная карта (ID: ${group.mapId})`
                        }}
                      </span>
                      <span class="mp-modal__map-star-rate">
                        ({{ group.stars.toFixed(2) }}★)
                      </span>
                    </div>
                    <v-chip
                      size="small"
                      :color="getModsChipColor(group.mods)"
                      variant="elevated"
                      class="mp-modal__mods-chip"
                    >
                      {{ group.mods.join("") || "NM" }}
                    </v-chip>
                  </div>
                  <div class="mp-modal__scores-wrapper">
                    <div
                      v-for="score in group.scores"
                      :key="score.gameId"
                      class="mp-modal__score-row"
                      :class="{
                        'mp-modal__score-row_disabled': score.isInsufficient,
                        'mp-modal__score-row_db': score.isDbScore,
                        'mp-modal__score-row_selected': score.isSelected,
                      }"
                      @click="toggleScoreSelection(group, score)"
                    >
                      <div class="mp-modal__score-content">
                        <div class="mp-modal__score-left">
                          <span
                            class="mp-modal__score-rank"
                            :class="`rank-${score.rank}`"
                          >
                            {{ formatMapRank(score.rank) }}
                          </span>
                          <span class="mp-modal__score-stats-text">
                            | {{ (score.accuracy * 100).toFixed(2) }}% |
                            {{ score.combo }}x
                          </span>
                        </div>
                        <div class="mp-modal__score-right">
                          <span
                            v-if="score.isDbScore"
                            class="mp-modal__score-db-label"
                          >
                            Текущий скор в BOTM
                          </span>
                          <span
                            class="mp-modal__score-value"
                            :class="{
                              'mp-modal__score-value_error':
                                (!score.passed || score.isInsufficient) &&
                                !score.isDbScore,
                              'mp-modal__score-value_db': score.isDbScore,
                            }"
                          >
                            {{ score.score.toLocaleString("ru-RU") }}
                          </span>
                          <div class="mp-modal__score-subtext">
                            <span
                              v-if="score.isInsufficient"
                              class="mp-modal__score-subtext-error"
                            >
                              ({{
                                !score.passed ? "Скор зафейлен" : "<70% скора"
                              }}, 0 очков)
                            </span>
                            <span
                              v-else
                              class="mp-modal__score-subtext-points"
                              :class="{
                                'mp-modal__score-subtext-points_db':
                                  score.isDbScore,
                              }"
                            >
                              ({{ score.percentage.toFixed(2) }}% скора,
                              {{ score.points.toFixed(2) }} очков)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
import AppModal from "@/components/ui/AppModal.vue";
import useToast from "@/composables/useToast";
import { useAuthStore } from "@/stores/auth";
import { useOsumapsStore } from "@/stores/osumaps";
import { useScoresStore } from "@/stores/scores";
import { formatMapRank } from "@/utils";
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

const { setErrorToast, setSuccessToast } = useToast();

const authStore = useAuthStore();
const mapsStore = useOsumapsStore();
const scoresStore = useScoresStore();

const currentOsuId = computed(() => authStore.userAdditionalInfo?.osuId);
const currentUserUid = computed(() => authStore.user?.uid);

const chosenMpLinkId = ref<number | null>(null);
const isFetching = ref(false);
const isUploading = ref(false);
const hasSearched = ref(false);
const isLoadingDependencies = ref(false);
const groupedScores = ref<IMpModalGroup[]>([]);

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

const selectedScoresCount = computed(() => {
  let count = 0;
  groupedScores.value.forEach((group) => {
    count += group.scores.filter((s) => s.isSelected).length;
  });
  return count;
});

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
    setErrorToast("Введи корректный MP Link ID.");
    return;
  }

  hasSearched.value = true;
  isFetching.value = true;

  try {
    const response = await fetch(
      `https://botm-hub-api.vercel.app/api/match?id=${chosenMpLinkId.value}`
    );
    if (!response.ok) throw new Error(`Ошибка сервера: ${response.status}`);
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
          artist: bms?.artist || "Unknown Artist",
          title: bms?.title || "Unknown Title",
          version: bm.version || "Unknown",
          coverUrl: bms?.covers?.cover || null,
          fullName: `${bms?.artist} - ${bms?.title} [${bm.version}]`,
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

const getMaxScoreForMods = (mods: string[]) => {
  let multiplier = 1.0;
  if (mods.includes("EZ")) multiplier *= 0.5;
  if (mods.includes("DT")) multiplier *= 1.2;
  if (mods.includes("HR")) multiplier *= 1.1;
  if (mods.includes("HD")) multiplier *= 1.06;
  if (mods.includes("FL")) multiplier *= 1.12;

  return 1000000 * multiplier;
};

const getModsChipColor = (mods: string[]): string => {
  if (mods.includes("DT")) return "var(--color-mod-combination-dt)";
  if (mods.includes("FL")) return "var(--color-mod-combination-fl)";
  if (mods.includes("HR")) return "var(--color-mod-combination-hr)";
  if (mods.includes("HD")) return "var(--color-mod-combination-hd)";
  if (mods.includes("EZ")) return "var(--color-mod-combination-ez)";
  return "var(--color-mod-combination-nm)";
};

const groupAndFormatScores = (rawScores: IOsuApiScore[]): IMpModalGroup[] => {
  const groupsMap = new Map<string, IMpModalGroup>();
  const allMaps = mapsStore.getMapsOfGivenCategories(
    Object.values(OsuMapCategory)
  );

  rawScores.forEach((score) => {
    const dbMap = allMaps.find((m) => m.id === score.mapId);
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

    const maxScore = getMaxScoreForMods(score.mods);
    const percentage = (score.score / maxScore) * 100;
    const isInsufficient = percentage < 70;

    let calculatedPoints = 0;
    if (!isInsufficient) {
      const multiplier = 1 + Math.pow((percentage - 70) / 30, 2) * 2;
      calculatedPoints = Math.pow(stars, 2) * multiplier;
    }

    groupsMap.get(groupKey)!.scores.push({
      gameId: score.gameId,
      score: score.score,
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

    setSuccessToast(`Успешно загружено скоров: ${selectedToUpload.length} 🥳`);
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
  }
  &__groups-title {
    @include default-headline(24px, 24px, var(--color-text));
  }
  &__groups-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
    max-height: 50vh;
    overflow-y: auto;
    padding-right: 8px;
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--color-scrollbar-thumb);
      border-radius: 4px;
    }
  }
  &__group-card {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid var(--color-scores-group-card-border);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
  }
  &__group-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
  &__group-overlay {
    position: relative;
    z-index: 1;
    background: linear-gradient(
      to right,
      var(--color-group-overlay-bg-gradient-left) 0%,
      var(--color-group-overlay-bg-gradient-right) 100%
    );
    flex-grow: 1;
    width: 100%;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__group-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  &__map-title-wrapper {
    display: flex;
    align-items: center;
    min-width: 0;
    flex: 1;
  }
  &__map-title {
    @include default-text(18px, 22px, var(--color-text-white));
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 20px;
    }
  }
  &__map-star-rate {
    margin-left: 6px;
    color: var(--color-map-star-rate);
    font-weight: bold;
    flex-shrink: 0;
    @media (max-width: $phone-l) {
      font-size: 14px;
    }
  }
  &__mods-chip {
    font-weight: bold;
    color: var(--color-text-white);
  }
  &__scores-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  &__score-row {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 6px 12px;
    background-color: var(--color-score-row-bg);
    border-radius: 8px;
    border: 2px solid transparent;
    transition: 0.2s ease-in-out;
    cursor: pointer;
    &:hover:not(&_disabled):not(&_db) {
      background-color: var(--color-score-hover);
    }
    &_db {
      background-color: var(--color-db-score-bg);
      border: 1px dashed var(--color-db-score-border);
      cursor: default;
    }
    &_selected {
      background-color: var(--color-selected-score-bg);
      border: 2px solid var(--color-selected-score-border);
    }
    &_disabled {
      background-color: var(--color-disabled-score-bg);
      opacity: 0.5;
      cursor: not-allowed;
    }
    @media (max-width: $phone-l) {
      gap: 10px;
      padding: 6px 8px;
    }
  }
  &__score-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  &__score-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  &__score-stats-text {
    @include default-text(16px, 16px, var(--color-text-gray));
    font-weight: 600;
    @media (max-width: $phone-l) {
      font-size: 13px;
      line-height: 13px;
    }
  }
  &__score-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    flex-shrink: 0;
  }
  &__score-db-label {
    color: var(--color-db-score-label);
    font-size: 10px;
    line-height: 10px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 2px;
    letter-spacing: 0.5px;
  }
  &__score-value {
    @include default-text(20px, 20px, var(--color-text-white));
    font-weight: bold;
    &_db {
      color: var(--color-db-score-label);
    }
    &_error {
      color: var(--color-error);
    }
    @media (max-width: $phone-l) {
      font-size: 18px;
      line-height: 18px;
    }
  }
  &__score-subtext {
    @include default-text(12px, 14px, var(--color-text-gray));
    margin-top: 2px;
    text-align: right;
    @media (max-width: $phone-l) {
      font-size: 10px;
      line-height: 12px;
    }
  }
  &__score-subtext-error {
    color: var(--color-error);
    font-weight: bold;
  }
  &__score-subtext-points {
    color: var(--color-club-points);
    font-weight: bold;
    &_db {
      color: var(--color-db-score-label);
    }
  }
  &__score-rank {
    @include default-text(18px, 18px, var(--color-text-white));
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
    &.rank-X,
    &.rank-SS,
    &.rank-S {
      color: var(--color-rank-s-or-ss);
    }
    &.rank-XH,
    &.rank-SSH,
    &.rank-SH {
      color: var(--color-rank-silver-s-or-ss);
    }
    &.rank-A {
      color: var(--color-rank-a);
    }
    &.rank-B {
      color: var(--color-rank-b);
    }
    &.rank-C {
      color: var(--color-rank-c);
    }
    &.rank-D {
      color: var(--color-rank-d);
    }
    &.rank-F {
      color: var(--color-rank-f);
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
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
      var(--color-btn-text),
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
