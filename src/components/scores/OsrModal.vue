<template>
  <AppModal
    :isOpened="isOpened"
    title="Анализ .osr Файлов"
    :isClosableByClickOutside="false"
    maxWidth="1100px"
    @closeModal="closeModal"
  >
    <div class="osr-modal">
      <input
        ref="fileInputRef"
        type="file"
        accept=".osr"
        multiple
        class="osr-modal__hidden-input"
        @change="onFilesSelected"
      />
      <div
        v-if="!hasProcessed"
        class="osr-modal__dropzone"
        :class="{ 'osr-modal__dropzone_active': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="triggerFileInput"
      >
        <v-icon size="64" color="var(--color-btn-osr)">
          mdi-file-upload-outline
        </v-icon>
        <span class="osr-modal__dropzone-text">
          Перетащи файлы .osr сюда<br />
          или нажми для выбора
        </span>
      </div>
      <template v-else>
        <div class="osr-modal__actions-row">
          <v-btn
            :loading="isProcessing"
            height="56"
            prepend-icon="mdi-folder-open"
            class="osr-modal__browse-btn"
            @click="triggerFileInput"
          >
            Выбрать другие файлы .osr
          </v-btn>
        </div>
        <v-divider class="border-opacity-100" />
        <div v-if="isProcessing" class="osr-modal__loader">
          <v-progress-circular
            indeterminate
            color="var(--color-btn-osr)"
            size="40"
          />
          <span>
            {{
              isLoadingDependencies
                ? "Подгружаем базу карт и старые скоры..."
                : "Анализируем реплеи..."
            }}
          </span>
        </div>
        <div v-else class="osr-modal__content-layout">
          <div class="osr-modal__groups-wrapper">
            <h3 class="osr-modal__groups-title">
              Подходящие скоры ({{ validScoresCount }}):
            </h3>
            <ParsedScoresList
              v-if="groupedScores.length > 0"
              :groupedScores="groupedScores"
              @toggle-score="toggleScoreSelection"
            />
            <div v-else class="osr-modal__no-data-wrapper">
              <span class="osr-modal__no-data-text">
                Из выбранных файлов не удалось извлечь ни одного подходящего
                турнирного скора.
              </span>
              <span class="osr-modal__no-data-subtext">
                (Ищутся только скоры на картах из базы BOTM, в ScoreV2, в режиме
                osu! std)
              </span>
            </div>
          </div>
          <div
            class="osr-modal__errors-wrapper"
            :class="{
              'osr-modal__errors-wrapper_empty': errorsList.length === 0,
            }"
          >
            <h4
              class="osr-modal__errors-title"
              :class="{
                'osr-modal__errors-title_empty': errorsList.length === 0,
              }"
            >
              Ошибки ({{ errorsList.length }}):
            </h4>
            <ul v-if="errorsList.length > 0" class="osr-modal__errors-list">
              <li
                v-for="err in errorsList"
                :key="err.id"
                class="osr-modal__error-item"
              >
                {{ err.text }}
              </li>
            </ul>
            <div v-else class="osr-modal__no-errors">
              Среди загруженных скоров не было найдено никаких проблем
            </div>
          </div>
        </div>
      </template>
    </div>
    <template #actions>
      <div class="osr-modal__actions">
        <v-btn class="osr-modal__cancel-btn" height="50" @click="closeModal">
          Отмена
        </v-btn>
        <v-btn
          :disabled="selectedScoresCount === 0 || isLoadingDependencies"
          :loading="isUploading"
          class="osr-modal__confirm-btn"
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
import ParsedScoresList from "@/components/scores/ParsedScoresList.vue";
import useToast from "@/composables/useToast";
import { useAuthStore } from "@/stores/auth";
import { useOsumapsStore } from "@/stores/osumaps";
import { useScoresStore } from "@/stores/scores";
import { OsrParser } from "@/utils/osr-parser";
import { OsuMapCategory, type IOsuMap } from "@/types/osumaps";
import {
  type IMpModalScore,
  type IMpModalGroup,
  isOsuScoreMod,
  type IParsedOsr,
} from "@/types/scores";

const props = defineProps<{ isOpened: boolean }>();

const emit = defineEmits<{ (e: "closeModal"): void }>();

const authStore = useAuthStore();
const mapsStore = useOsumapsStore();
const scoresStore = useScoresStore();

const { setErrorToast, setSuccessToast } = useToast();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isProcessing = ref(false);
const isUploading = ref(false);
const hasProcessed = ref(false);
const isLoadingDependencies = ref(false);
const isDragging = ref(false);

const groupedScores = ref<IMpModalGroup[]>([]);
const errorsList = ref<{ id: string; text: string }[]>([]);

const currentUserUid = computed(() => authStore.user?.uid);
const currentNick = computed(() => authStore.userAdditionalInfo?.nick);

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
      hasProcessed.value = false;
      isDragging.value = false;
      groupedScores.value = [];
      errorsList.value = [];
      if (fileInputRef.value) fileInputRef.value.value = "";
    }
  }
);

const closeModal = () => emit("closeModal");

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const onDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    processFiles(event.dataTransfer.files);
  }
};

const onFilesSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    processFiles(target.files);
  }
};

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

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () =>
      reject(new Error(`Не удалось прочитать файл ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
};

const getRankFromStats = (parsed: IParsedOsr): string => {
  const total =
    parsed.count300 + parsed.count100 + parsed.count50 + parsed.countMiss;
  if (total === 0) return "D";

  const r300 = parsed.count300 / total;
  const r50 = parsed.count50 / total;
  const isHidden =
    parsed.parsedMods.includes("HD") || parsed.parsedMods.includes("FL");

  if (parsed.accuracy === 1) return isHidden ? "XH" : "X";
  if (r300 > 0.9 && r50 <= 0.01 && parsed.countMiss === 0)
    return isHidden ? "SH" : "S";
  if ((r300 > 0.8 && parsed.countMiss === 0) || r300 > 0.9) return "A";
  if ((r300 > 0.7 && parsed.countMiss === 0) || r300 > 0.8) return "B";
  if (r300 > 0.6) return "C";
  return "D";
};

const processFiles = async (files: FileList) => {
  if (!files || files.length === 0) return;

  hasProcessed.value = true;
  isProcessing.value = true;
  errorsList.value = [];
  groupedScores.value = [];

  try {
    await loadDependencies();

    const allMaps = mapsStore.getMapsOfGivenCategories(
      Object.values(OsuMapCategory)
    );
    const validRawScores: (IParsedOsr & { dbMap: (typeof allMaps)[0] })[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;

      try {
        const buffer = await readFileAsArrayBuffer(file);
        const parser = new OsrParser(buffer);
        const parsedData = parser.parse();

        const expectedNick = currentNick.value?.trim().toLowerCase();
        const replayNick = parsedData.playerName.trim().toLowerCase();

        if (!expectedNick) {
          errorsList.value.push({
            id: crypto.randomUUID(),
            text: `${file.name}: Твой ник почему-то не прогрузился или вообще пустой`,
          });
          continue;
        }

        if (replayNick !== expectedNick) {
          errorsList.value.push({
            id: crypto.randomUUID(),
            text: `${file.name}: Реплей принадлежит другому игроку (${parsedData.playerName})`,
          });
          continue;
        }

        if (parsedData.mode !== 0) {
          errorsList.value.push({
            id: crypto.randomUUID(),
            text: `${file.name}: Неподдерживаемый режим игры (не osu! std)`,
          });
          continue;
        }

        if (!parsedData.isScoreV2) {
          errorsList.value.push({
            id: crypto.randomUUID(),
            text: `${file.name}: Скор поставлен в ScoreV1 (требуется ScoreV2)`,
          });
          continue;
        }

        const dbMap = allMaps.find((m) => m.hashMd5 === parsedData.beatmapMD5);
        if (!dbMap) {
          errorsList.value.push({
            id: crypto.randomUUID(),
            text: `${file.name}: Карта не найдена в пулах BOTM`,
          });
          continue;
        }

        validRawScores.push({ ...parsedData, dbMap });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errorsList.value.push({
          id: crypto.randomUUID(),
          text: `${file.name}: ${msg}`,
        });
      }
    }

    groupedScores.value = groupAndFormatScores(validRawScores);

    if (groupedScores.value.length > 0) {
      setSuccessToast(
        `⚙️⚙️⚙️ Успешно обработано скоров: ${validRawScores.length} ⚙️⚙️⚙️`
      );
    } else if (errorsList.value.length > 0) {
      setErrorToast(
        "Файлы обработаны, но валидных скоров не найдено. Проверь список ошибок"
      );
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    setErrorToast(`Критическая ошибка: ${msg}`);
  } finally {
    isProcessing.value = false;
    if (fileInputRef.value) fileInputRef.value.value = "";
  }
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

const groupAndFormatScores = (
  rawScores: (IParsedOsr & { dbMap: IOsuMap })[]
): IMpModalGroup[] => {
  const groupsMap = new Map<string, IMpModalGroup>();

  rawScores.forEach((parsed) => {
    const dbMap = parsed.dbMap;
    const stars = dbMap.starRate;
    const groupKey = `${dbMap.id}_${parsed.parsedMods.join("")}`;

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        id: groupKey,
        mapId: dbMap.id,
        mods: parsed.parsedMods,
        mapInfo: {
          title: dbMap.name,
          version: "",
          coverUrl: `https://assets.ppy.sh/beatmaps/${dbMap.mapsetId}/covers/cover.jpg`,
          fullName: dbMap.name,
          stars: stars,
        },
        dbMapInfo: dbMap,
        stars: stars,
        scores: [],
      });
    }

    const maxScore = getMaxScoreForMods(parsed.parsedMods);
    const percentage = (parsed.totalScore / maxScore) * 100;
    const isInsufficient = percentage < 70;

    let calculatedPoints = 0;
    if (!isInsufficient && parsed.totalScore > 0) {
      const multiplier = 1 + Math.pow((percentage - 70) / 30, 2) * 2;
      calculatedPoints = Math.pow(stars, 2) * multiplier;
    }

    groupsMap.get(groupKey)!.scores.push({
      gameId: parsed.replayMD5 || crypto.randomUUID(),
      score: parsed.totalScore,
      accuracy: parsed.accuracy,
      combo: parsed.maxCombo,
      rank: getRankFromStats(parsed),
      passed: parsed.totalScore > 0,
      percentage,
      isInsufficient,
      points: calculatedPoints,
      isSelected: false,
      isDbScore: false,
      mapId: dbMap.id,
      mods: parsed.parsedMods,
      date: parsed.date,
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
.osr-modal {
  display: flex;
  flex-direction: column;
  gap: 10px;
  &__dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    border: 2px dashed var(--color-btn-osr);
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.03);
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    gap: 15px;
    &:hover,
    &_active {
      background-color: rgba(255, 105, 180, 0.1);
      border-color: #ff69b4;
    }
  }
  &__dropzone-text {
    @include default-text(18px, 24px, var(--color-text));
    text-align: center;
    pointer-events: none;
  }
  &__actions-row {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &__hidden-input {
    display: none;
  }
  &__browse-btn {
    @include default-btn(
      100%,
      var(--color-text-white),
      var(--color-btn-osr),
      0
    );
    @media (max-width: $phone-l) {
      font-size: 14px;
      line-height: 14px;
    }
    @media (max-width: $phone-m) {
      font-size: 12px;
      line-height: 12px;
    }
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
  &__content-layout {
    display: grid;
    grid-template-columns: 3fr 2fr;
    gap: 10px;
    @media (max-width: $laptop-l) {
      grid-template-columns: 1fr;
    }
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
  &__no-data-wrapper {
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    gap: 10px;
    background-color: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    border: 1px dashed rgba(255, 255, 255, 0.2);
  }
  &__no-data-text {
    @include default-text(20px, 20px, var(--color-text-gray));
    text-align: center;
  }
  &__no-data-subtext {
    @include default-text(14px, 14px, var(--color-text-gray));
    text-align: center;
    font-size: 14px;
    opacity: 0.8;
  }
  &__errors-wrapper {
    padding: 15px;
    background-color: rgba(255, 64, 64, 0.1);
    border: 1px solid var(--color-error);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
    &_empty {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }
  }
  &__errors-title {
    @include default-headline(18px, 18px, var(--color-error));
    flex-shrink: 0;
    &_empty {
      color: var(--color-text-white);
    }
  }
  &__no-errors {
    @include default-text(14px, 20px, var(--color-text-white));
    opacity: 0.8;
    text-align: center;
    margin: auto 0;
  }
  &__errors-list {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
    max-height: calc(50vh - 24px);
    overflow-y: auto;
    @include default-text(13px, 18px, var(--color-text));
    @media (max-width: $laptop-l) {
      max-height: none;
      overflow-y: visible;
    }
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background-color: var(--color-error);
      border-radius: 4px;
    }
  }
  &__error-item {
    margin-bottom: 4px;
    padding-inline: 4px;
    word-break: break-word;
    &:before {
      content: "•";
      color: var(--color-error);
      margin-right: 8px;
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
    @include default-btn(
      100%,
      var(--color-text-white),
      var(--color-btn-osr),
      0
    );
    &:disabled {
      opacity: 0.5;
    }
    @media (max-width: $tablet-s) {
      flex: none;
    }
  }
}
</style>
