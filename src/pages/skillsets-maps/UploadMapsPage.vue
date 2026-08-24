<template>
  <div class="upload-page">
    <h1 class="upload-page__title">📥 Загрузка и обновление маппулов</h1>
    <div class="upload-page__content">
      <div class="upload-page__input-section">
        <label class="upload-page__label">Вставьте JSON массив карт:</label>
        <textarea
          v-model="jsonInput"
          class="upload-page__textarea"
          :placeholder="JSON_PLACEHOLDER"
          @input="validateJson"
        ></textarea>
        <div v-if="jsonError" class="upload-page__json-error">
          ⚠️ {{ jsonError }}
        </div>
        <div v-else-if="parsedCount > 0" class="upload-page__json-success">
          ✅ Валидный JSON и структура: обнаружено карт:
          <strong>{{ parsedCount }}</strong>
        </div>
        <button
          class="upload-page__btn"
          :disabled="!isValidJson || isLoading"
          @click="handleUpload"
        >
          <AppSpinner v-if="isLoading" />
          <span v-else>Загрузить карты в БД</span>
        </button>
      </div>
      <div v-if="logs.length > 0" class="upload-page__logs-section">
        <h2 class="upload-page__logs-title">📋 Логи операции:</h2>
        <div class="upload-page__logs-list">
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="upload-page__log-item"
            :class="`upload-page__log-item_${log.type}`"
          >
            <div class="upload-page__log-header">
              <span class="upload-page__log-icon">
                {{
                  log.type === "added"
                    ? "➕"
                    : log.type === "updated"
                      ? "🔄"
                      : "❌"
                }}
              </span>
              <strong class="upload-page__log-map-name">{{
                log.mapName
              }}</strong>
            </div>
            <p class="upload-page__log-msg">{{ log.message }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { uploadMapsToFirebase } from "@/services/firebase/osumaps";
import AppSpinner from "@/components/ui/AppSpinner.vue";
import useToast from "@/composables/useToast";
import {
  isOsuMapCategory,
  type IUploadMapLog,
  type IOsuMap,
} from "@/types/osumaps";

const JSON_PLACEHOLDER = `[
  {
    "id": 2957016,
    "mapsetId": 1437192,
    "hashMd5": "d4f88a77cf132f58563ed8233552d65c",
    "ar": 7,
    "bpm": 128,
    "category": "fm2",
    "comment": "O!WC25 Groups as NM3",
    "cs": 5,
    "duration": "03:41",
    "hp": 5,
    "mapper": "newton-",
    "name": "VESPERBELL – Chocolate Disco [Bittersweet]",
    "od": 8,
    "starRate": 4.84
  },
  ...
]`;

const jsonInput = ref("");
const jsonError = ref<string | null>(null);
const parsedCount = ref(0);
const isLoading = ref(false);
const logs = ref<IUploadMapLog[]>([]);

const { setSuccessToast, setErrorToast } = useToast();

const REQUIRED_FIELDS: (keyof Omit<IOsuMap, "link">)[] = [
  "id",
  "mapsetId",
  "hashMd5",
  "category",
  "name",
  "mapper",
  "starRate",
  "duration",
  "bpm",
  "cs",
  "ar",
  "od",
  "hp",
  "comment",
];

const validateMapItem = (item: unknown, index: number): string | null => {
  if (typeof item !== "object" || item === null) {
    return `Элемент #${index + 1} не является объектом`;
  }

  const mapObj = item as Record<string, unknown>;

  for (const field of REQUIRED_FIELDS) {
    if (
      !(field in mapObj) ||
      mapObj[field] === undefined ||
      mapObj[field] === null
    ) {
      const mapName =
        typeof mapObj.name === "string" ? mapObj.name : "без названия";
      return `В элементе #${index + 1} (${mapName}) отсутствует поле "${field}"`;
    }
  }

  if (
    typeof mapObj.category !== "string" ||
    !isOsuMapCategory(mapObj.category)
  ) {
    return `В элементе #${index + 1} некорректная категория: "${String(mapObj.category)}"`;
  }

  if (typeof mapObj.id !== "number" || typeof mapObj.mapsetId !== "number") {
    return `В элементе #${index + 1} поля "id" и "mapsetId" должны быть числами`;
  }

  return null;
};

const isValidJson = computed(() => {
  return (
    jsonInput.value.trim().length > 0 &&
    !jsonError.value &&
    parsedCount.value > 0
  );
});

const validateJson = () => {
  if (!jsonInput.value.trim()) {
    jsonError.value = null;
    parsedCount.value = 0;
    return;
  }

  try {
    const parsed = JSON.parse(jsonInput.value);
    if (!Array.isArray(parsed)) {
      jsonError.value =
        "Ошибка синтаксиса: JSON должен быть массивом карт [ ... ]";
      parsedCount.value = 0;
      return;
    }

    for (let i = 0; i < parsed.length; i++) {
      const err = validateMapItem(parsed[i], i);
      if (err) {
        jsonError.value = err;
        parsedCount.value = 0;
        return;
      }
    }

    jsonError.value = null;
    parsedCount.value = parsed.length;
  } catch (err: unknown) {
    jsonError.value =
      err instanceof Error ? err.message : "Ошибка парсинга JSON";
    parsedCount.value = 0;
  }
};

const handleUpload = async () => {
  if (!isValidJson.value) return;

  isLoading.value = true;
  logs.value = [];

  try {
    const mapsArray = JSON.parse(jsonInput.value);
    const resultLogs = await uploadMapsToFirebase(mapsArray);
    logs.value = resultLogs;

    setSuccessToast("Операция завершена! Проверьте логи ниже.");
  } catch (err: unknown) {
    setErrorToast(`Не удалось отправить данные в БД: ${err}`);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.upload-page {
  padding: 30px;
  width: 100%;
  margin: 0 auto;
  &__title {
    @include default-headline(32px, 36px, var(--color-text));
    margin-bottom: 25px;
  }
  &__content {
    display: flex;
    flex-direction: column;
    row-gap: 30px;
    width: 100%;
  }
  &__input-section {
    display: flex;
    flex-direction: column;
    row-gap: 15px;
    width: 100%;
  }
  &__label {
    @include default-text(20px, 22px, var(--color-text));
  }
  &__textarea {
    width: 100%;
    min-height: 400px;
    padding: 15px;
    font-family: monospace;
    font-size: 14px;
    background-color: var(--color-card-bg, var(--color-text-area-bg));
    color: var(--color-text);
    border: 2px solid var(--color-btn-bg);
    border-radius: 8px;
    resize: none;
    &:focus {
      outline: none;
      border-color: var(--color-burger-menu-link);
    }
  }
  &__json-error {
    color: var(--color-error);
    font-size: 16px;
    font-weight: bold;
  }
  &__json-success {
    color: var(--color-success);
    font-size: 16px;
  }
  &__btn {
    @include default-btn(100%, var(--color-btn-text), var(--color-btn-bg));
    max-width: 320px;
    height: 50px;
    font-size: 18px;
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  &__logs-section {
    display: flex;
    flex-direction: column;
    row-gap: 15px;
    width: 100%;
  }
  &__logs-title {
    @include default-headline(24px, 28px, var(--color-text));
  }
  &__logs-list {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    max-height: 500px;
    overflow-y: auto;
    padding-right: 5px;
  }
  &__log-item {
    padding: 12px 16px;
    border-radius: 6px;
    border-left: 5px solid;
    &_added {
      background-color: rgba(82, 196, 26, 0.12);
      border-color: var(--color-success);
    }
    &_updated {
      background-color: rgba(250, 173, 20, 0.12);
      border-color: var(--color-warning);
    }
    &_error {
      background-color: rgba(255, 64, 64, 0.12);
      border-color: var(--color-error);
    }
  }
  &__log-header {
    display: flex;
    align-items: center;
    column-gap: 8px;
    margin-bottom: 4px;
  }
  &__log-map-name {
    @include default-text(16px, 18px, var(--color-text));
    font-weight: bold;
  }
  &__log-msg {
    @include default-text(14px, 16px, var(--color-text));
    opacity: 0.9;
  }
}
</style>
