<template>
  <div class="workout-constructor-page">
    <h2 class="workout-constructor-page__headline">
      Конструктор Тренировочной Сессии
    </h2>
    <div class="workout-constructor-page__inputs-wrapper">
      <v-select
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
  </div>
</template>

<script setup lang="ts">
import { OsuMapCategory } from "@/types";
import { computed } from "vue";

const categoriesOptions = computed(() =>
  Object.values(OsuMapCategory).map((category) => category.toUpperCase())
);
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
}
</style>
