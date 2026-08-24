<template>
  <div class="radar-page">
    <h1 class="radar-page__title">🕵️‍♂️ Секретный Радар Лобби</h1>
    <p class="radar-page__subtitle">
      Инструмент для массового поиска игроков в истории osu! лобби.
    </p>
    <div class="radar-page__content">
      <div class="radar-page__section">
        <h3 class="radar-page__section-title">Настройки сканирования</h3>
        <div class="radar-page__id-inputs">
          <v-text-field
            v-model.number="startId"
            type="number"
            label="Начальный ID лобби"
            variant="solo"
            hide-details
            density="compact"
          />
          <v-text-field
            v-model.number="endId"
            type="number"
            label="Конечный ID лобби"
            variant="solo"
            hide-details
            density="compact"
          />
        </div>
        <v-textarea
          v-model="targetsInput"
          label="Ники целей (строго каждый с новой строки)"
          variant="solo"
          rows="8"
          placeholder="Например:&#10;Vaxei&#10;WhiteCat&#10;Shist"
          no-resize
          hide-details
        />
      </div>
      <div class="radar-page__controls">
        <div class="d-flex flex-wrap align-center gap-4">
          <v-btn
            v-if="!isScanning"
            color="var(--color-btn-mp)"
            height="40"
            prepend-icon="mdi-radar"
            :disabled="!isValidSettings"
            @click="startScan"
          >
            Начать сканирование
          </v-btn>
          <v-btn
            v-else
            color="var(--color-error)"
            height="40"
            prepend-icon="mdi-stop"
            @click="stopScan"
          >
            Остановить
          </v-btn>
          <div
            v-if="scannedCount > 0 || isScanning"
            class="radar-page__stats ml-auto"
          >
            Проверено: {{ scannedCount }} / {{ totalLobbies }}
            <span class="text-error ml-2">
              (Приватных лобби / Ошибок: {{ errorsCount }})
            </span>
          </div>
        </div>
        <v-progress-linear
          v-if="isScanning"
          :model-value="progressPercent"
          color="var(--color-btn-mp)"
          height="10"
          striped
          class="mt-4 rounded"
        />
      </div>
      <v-divider class="border-opacity-100" />
      <div class="radar-page__section">
        <h4 class="radar-page__section-title d-flex align-center">
          Найденные лобби ({{ foundLobbies.length }})
          <v-btn
            v-if="foundLobbies.length > 0"
            variant="text"
            icon="mdi-content-copy"
            size="small"
            class="ml-2"
            @click="copyResults"
          ></v-btn>
        </h4>
        <v-textarea
          :model-value="foundLobbiesText"
          readonly
          variant="solo"
          rows="4"
          auto-grow
          placeholder="Здесь будут появляться ссылки на найденные лобби..."
          hide-details
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { fetchOsuMatch } from "@/services/botm-hub-api";
import useToast from "@/composables/useToast";

const { setSuccessToast } = useToast();

const startId = ref<number | null>(null);
const endId = ref<number | null>(null);
const targetsInput = ref("");

const isScanning = ref(false);
const scannedCount = ref(0);
const errorsCount = ref(0);
const foundLobbies = ref<number[]>([]);

const totalLobbies = computed(() => {
  if (startId.value && endId.value && endId.value >= startId.value) {
    return endId.value - startId.value + 1;
  }
  return 0;
});

const progressPercent = computed(() => {
  if (totalLobbies.value === 0) return 0;
  return (scannedCount.value / totalLobbies.value) * 100;
});

const isValidSettings = computed(() => {
  return (
    startId.value &&
    endId.value &&
    endId.value >= startId.value &&
    targetsInput.value.trim().length > 0
  );
});

const targetPlayersList = computed(() => {
  return targetsInput.value
    .split("\n")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
});

const foundLobbiesText = computed(() => {
  return foundLobbies.value
    .map((id) => `https://osu.ppy.sh/community/matches/${id}`)
    .join("\n");
});

const stopScan = () => {
  isScanning.value = false;
  setSuccessToast("Сканирование остановлено.");
};

const checkMatch = async (matchId: number) => {
  try {
    const data = await fetchOsuMatch(matchId);

    if (data && data.users && Array.isArray(data.users)) {
      const usersInMatch = data.users.map((u) =>
        String(u.username).toLowerCase()
      );

      const hasTarget = usersInMatch.some((username) =>
        targetPlayersList.value.includes(username)
      );

      if (hasTarget) {
        foundLobbies.value.push(matchId);
      }
    }
  } catch (error: unknown) {
    errorsCount.value++;
    console.error(error instanceof Error ? error.message : error);
  } finally {
    scannedCount.value++;
  }
};

const startScan = async () => {
  if (!startId.value || !endId.value) return;

  isScanning.value = true;
  scannedCount.value = 0;
  errorsCount.value = 0;
  foundLobbies.value = [];

  const CHUNK_SIZE = 5;
  const DELAY_MS = 1000;

  for (let id = startId.value; id <= endId.value; id += CHUNK_SIZE) {
    if (!isScanning.value) break;

    const chunkPromises = [];
    for (let i = 0; i < CHUNK_SIZE && id + i <= endId.value; i++) {
      chunkPromises.push(checkMatch(id + i));
    }

    await Promise.all(chunkPromises);

    if (isScanning.value) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  if (isScanning.value) {
    isScanning.value = false;
    setSuccessToast("🎉 Сканирование успешно завершено!");
  }
};

const copyResults = async () => {
  if (!foundLobbiesText.value) return;
  try {
    await navigator.clipboard.writeText(foundLobbiesText.value);
    setSuccessToast("Ссылки скопированы в буфер обмена!");
  } catch (e) {
    console.error("Failed to copy:", e);
  }
};
</script>

<style lang="scss" scoped>
.radar-page {
  padding: 20px;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  &__title {
    @include default-headline(32px, 36px, var(--color-text));
    margin-bottom: 5px;
  }
  &__subtitle {
    @include default-text(16px, 20px, var(--color-text));
    opacity: 0.8;
    margin-bottom: 20px;
  }
  &__content {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    width: 100%;
  }
  &__section {
    display: flex;
    flex-direction: column;
    row-gap: 8px;
  }
  &__section-title {
    @include default-headline(22px, 26px, var(--color-text));
  }
  &__id-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    @media (max-width: $phone-l) {
      grid-template-columns: 1fr;
    }
  }
  &__controls {
    display: flex;
    flex-direction: column;
  }
  &__stats {
    @include default-text(16px, 20px, var(--color-text));
    font-weight: bold;
    @media (max-width: $phone-l) {
      margin-left: 0;
      margin-top: 10px;
    }
  }
}
</style>
