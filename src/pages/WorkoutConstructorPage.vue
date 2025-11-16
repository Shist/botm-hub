<template>
  <div class="workout-constructor-page">
    <h2 class="workout-constructor-page__headline">
      Конструктор Тренировочной Сессии
    </h2>
    <div class="workout-constructor-page__inputs-wrapper">
      <v-select
        v-model="chosenCategories"
        :items="categoriesOptions"
        variant="solo"
        label="Скиллсеты"
        placeholder="Выбери скиллсет(ы)"
        multiple
        chips
        closable-chips
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
    <v-btn
      :disabled="!isInfoSpecified"
      :loading="isLoadingMaps"
      height="50"
      class="workout-constructor-page__confirm-btn"
      @click="onConfirm"
    >
      Подобрать карты
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useMapsStore } from "@/stores/maps";
import useToast from "@/composables/useToast";
import { LoadingState, OsuMapCategory, type IOsuMap } from "@/types";

const mapsStore = useMapsStore();

const { setErrorToast } = useToast();

const chosenCategories = ref<OsuMapCategory[]>([]);
const chosenDuration = ref(120);
const chosenBreak = ref(2);
const isLoadingMaps = ref(false);

const categoriesOptions = computed(() =>
  Object.values(OsuMapCategory).map((category) => ({
    value: category,
    title: category.toUpperCase(),
  }))
);
const isInfoSpecified = computed(
  () =>
    !!chosenCategories.value.length &&
    chosenDuration.value !== null &&
    chosenBreak.value !== null
);

const onConfirm = async () => {
  const neededRequests: (() => Promise<IOsuMap[]>)[] = [];

  chosenCategories.value.forEach((category) => {
    if (mapsStore.maps[category].loadingState !== LoadingState.LOADED) {
      neededRequests.push(() => mapsStore.loadMapsByCategory(category));
    }
  });

  if (neededRequests.length) {
    try {
      isLoadingMaps.value = true;
      await Promise.all(neededRequests.map((request) => request()));
    } catch (error) {
      const msg = error instanceof Error ? error?.message : error;
      setErrorToast(`Не удалось загрузить карты для тренировки: ${msg}`);
    } finally {
      isLoadingMaps.value = false;
    }
  }
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
}
</style>
