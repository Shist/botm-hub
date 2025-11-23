<template>
  <div class="workout-constructor-page">
    <h2 class="workout-constructor-page__headline">
      Конструктор Тренировочной Сессии
    </h2>
    <v-skeleton-loader type="paragraph" :loading="isUserDataLoading">
      <div class="workout-constructor-page__inputs-wrapper">
        <SkillsetsSelect v-model="chosenCategories" />
        <v-number-input
          v-model="chosenStarRate"
          :min="3"
          :max="10"
          :precision="2"
          :step="0.01"
          decimal-separator="."
          variant="solo"
          control-variant="stacked"
          label="Сложность (★)"
          placeholder="Укажи среднюю сложность карт (в звездах)"
          clearable
          hide-details
        />
        <v-number-input
          v-model="chosenDuration"
          :min="30"
          :max="960"
          variant="solo"
          control-variant="stacked"
          label="Длительность (мин.)"
          placeholder="Укажи длительность тренировки (в минутах)"
          clearable
          hide-details
        />
        <v-number-input
          v-model="chosenBreak"
          :min="0"
          :max="5"
          variant="solo"
          control-variant="stacked"
          label="Перерыв (мин.)"
          placeholder="Укажи время перерывов между картами (в минутах)"
          clearable
          hide-details
        />
      </div>
    </v-skeleton-loader>
    <v-btn
      :disabled="!isInfoSpecified"
      :loading="isPreparingMaps"
      height="50"
      class="workout-constructor-page__confirm-btn"
      @click="onConfirm"
    >
      Подобрать карты
    </v-btn>
    <div
      v-if="isMapsSectionVisible"
      class="workout-constructor-page__maps-section-wrapper"
    >
      <v-skeleton-loader type="paragraph" :loading="isPreparingMaps">
        <div class="workout-constructor-page__session-info-wrapper">
          <div class="workout-constructor-page__session-block">
            <span>Всего карт:</span>
            <span>{{ suggestedMapsList.length }}</span>
            <span>Длительность карт:</span>
            <span>{{ totalMapsDurationLabel }}</span>
          </div>
          <div class="workout-constructor-page__session-block">
            <span>Всего перерывов:</span>
            <span>{{ suggestedMapsList.length - 1 }}</span>
            <span>Длительность перерывов:</span>
            <span>{{ totalBreaksDurationLabel }}</span>
          </div>
          <div class="workout-constructor-page__session-block">
            <span>Минимальный старрейт:</span>
            <span>{{ suggestedMapsList[0]?.starRate }}</span>
            <span>Максимальный старрейт:</span>
            <span>
              {{ suggestedMapsList[suggestedMapsList.length - 1]?.starRate }}
            </span>
          </div>
        </div>
      </v-skeleton-loader>
      <SkillsetMapsTable
        v-if="isMapsSectionVisible"
        :mapsList="suggestedMapsList"
        :isLoading="isPreparingMaps"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { useMapsStore } from "@/stores/maps";
import { useAuthStore } from "@/stores/auth";
import SkillsetMapsTable from "@/components/SkillsetMapsTable.vue";
import SkillsetsSelect from "@/components/SkillsetsSelect.vue";
import useToast from "@/composables/useToast";
import { LoadingState, OsuMapCategory, type IOsuMap } from "@/types";
import { fromDurationToSeconds, fromTotalSecondsToLabel } from "@/utils";

const mapsStore = useMapsStore();
const authStore = useAuthStore();

const { setErrorToast, setSuccessToast } = useToast();

const chosenCategories = ref<OsuMapCategory[]>([]);
const chosenStarRate = ref(5.0);
const chosenDuration = ref(120);
const chosenBreak = ref(2);
const isPreparingMaps = ref(false);
const suggestedMapsList = reactive<IOsuMap[]>([]);

const isUserDataLoading = computed(
  () => authStore.user?.additionalInfo === "loading"
);
const userMainCategories = computed(() => {
  const user = authStore.user;
  if (
    !user ||
    user.additionalInfo === "loading" ||
    user.additionalInfo === "loadingError"
  ) {
    return [];
  } else {
    return user.additionalInfo.skillsets;
  }
});
const isInfoSpecified = computed(
  () =>
    !!chosenCategories.value.length &&
    chosenStarRate.value !== null &&
    chosenDuration.value !== null &&
    chosenBreak.value !== null
);
const isMapsSectionVisible = computed(
  () => !!suggestedMapsList.length || isPreparingMaps.value
);
const totalMapsDurationLabel = computed(() => {
  const totalSeconds = suggestedMapsList.reduce(
    (acc, map) => acc + fromDurationToSeconds(map.duration),
    0
  );
  return fromTotalSecondsToLabel(totalSeconds);
});
const totalBreaksDurationLabel = computed(() => {
  const totalSeconds = 60 * chosenBreak.value * (suggestedMapsList.length - 1);
  return fromTotalSecondsToLabel(totalSeconds);
});

watch(
  userMainCategories,
  () => {
    chosenCategories.value = userMainCategories.value;
  },
  { immediate: true }
);

const onConfirm = async () => {
  isPreparingMaps.value = true;
  suggestedMapsList.splice(0, suggestedMapsList.length);
  const neededRequests: (() => Promise<IOsuMap[]>)[] = [];

  chosenCategories.value.forEach((category) => {
    if (mapsStore.maps[category].loadingState !== LoadingState.LOADED) {
      neededRequests.push(() => mapsStore.loadMapsByCategory(category));
    }
  });

  if (neededRequests.length) {
    try {
      await Promise.all(neededRequests.map((request) => request()));
    } catch (error) {
      const msg = error instanceof Error ? error?.message : error;
      setErrorToast(`Не удалось загрузить карты для тренировки: ${msg}`);
      isPreparingMaps.value = false;
      return;
    }
  }

  const allMaps = mapsStore.getMapsOfGivenCategories(chosenCategories.value);
  let bestMapForStarRateIndex = allMaps.length - 1;
  let lastMap: IOsuMap | null = null;

  for (const [index, map] of allMaps.entries()) {
    if (map.starRate >= chosenStarRate.value) {
      if (lastMap) {
        const currMapDiff = Math.abs(chosenStarRate.value - map.starRate);
        const lastMapDiff = Math.abs(chosenStarRate.value - lastMap.starRate);
        if (currMapDiff < lastMapDiff) {
          bestMapForStarRateIndex = index;
        } else {
          bestMapForStarRateIndex = index - 1;
        }
      } else {
        bestMapForStarRateIndex = index;
      }
      break;
    }
    lastMap = map;
  }

  const breakSeconds = 60 * chosenBreak.value;
  let currMap = allMaps[bestMapForStarRateIndex] as IOsuMap;
  suggestedMapsList.push(currMap);
  let leftSeconds =
    60 * chosenDuration.value - fromDurationToSeconds(currMap.duration);
  let easierMapsIndex = bestMapForStarRateIndex - 1;
  let harderMapsIndex = bestMapForStarRateIndex + 1;
  let isEasyerMapTurn = false;
  while (
    leftSeconds > 0 &&
    (easierMapsIndex >= 0 || harderMapsIndex < allMaps.length)
  ) {
    isEasyerMapTurn = !isEasyerMapTurn;
    if (isEasyerMapTurn) {
      if (easierMapsIndex < 0) continue;
      currMap = allMaps[easierMapsIndex--] as IOsuMap;
    } else {
      if (harderMapsIndex >= allMaps.length) continue;
      currMap = allMaps[harderMapsIndex++] as IOsuMap;
    }
    suggestedMapsList.push(currMap);
    leftSeconds -= breakSeconds + fromDurationToSeconds(currMap.duration);
  }

  suggestedMapsList.sort((a, b) => a.starRate - b.starRate);

  isPreparingMaps.value = false;

  setSuccessToast("Карты для тренировки успешно подготовлены!");
};
</script>

<style lang="scss" scoped>
.workout-constructor-page {
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  &__headline {
    @include default-headline(36px, 36px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 28px;
      line-height: 28px;
    }
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
  }
  &__inputs-wrapper {
    display: flex;
    gap: 10px;
    & > * {
      flex: 1 1 calc(33.33% - 10px);
    }
    @media (max-width: $pc-l) {
      flex-direction: column;
      & > * {
        flex: 1 1 100%;
      }
    }
  }
  &__confirm-btn {
    @include default-btn(100%, var(--color-btn-text), var(--color-btn-bg), 0);
  }
  &__maps-section-wrapper {
    display: flex;
    flex-direction: column;
    row-gap: 10px;
  }
  &__session-info-wrapper {
    display: flex;
    justify-content: space-evenly;
    gap: 10px;
    @media (max-width: $laptop-s) {
      flex-direction: column;
    }
  }
  &__session-block {
    display: grid;
    align-items: center;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    @include default-text(20px, 20px, var(--color-text));
    :nth-child(odd) {
      justify-self: end;
      text-align: end;
    }
  }
}
</style>
