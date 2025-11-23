<template>
  <div class="trainings-page">
    <h2 class="trainings-page__headline">Расписания Качалочек</h2>
    <div class="trainings-page__tabs-wrapper">
      <v-tabs v-model="currTab" show-arrows grow>
        <v-tab value="plans" class="trainings-page__tab-title">Планы</v-tab>
        <v-tab value="archive" class="trainings-page__tab-title">Архив</v-tab>
      </v-tabs>
      <v-divider class="border-opacity-100" />
      <v-tabs-window v-model="currTab">
        <v-tabs-window-item
          value="plans"
          class="trainings-page__tab-window-wrapper"
        >
          <h4 v-if="false" class="trainings-page__empty-label">
            Здесь пока пусто...
          </h4>
          <v-expansion-panels v-else>
            <TrainingCard v-for="i in 1" :key="i" />
          </v-expansion-panels>
        </v-tabs-window-item>
        <v-tabs-window-item
          value="archive"
          class="trainings-page__tab-window-wrapper"
        >
          <h4 v-if="true" class="trainings-page__empty-label">
            Здесь пока пусто...
          </h4>
          <v-expansion-panels v-else>
            <TrainingCard v-for="i in 1" :key="i" />
          </v-expansion-panels>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import TrainingCard from "@/components/TrainingCard.vue";

const currTab = ref("plans");
</script>

<style lang="scss" scoped>
.trainings-page {
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
  &__tabs-wrapper {
    color: var(--color-text);
    background-color: var(--color-tabs-bg);
  }
  &__tab-title {
    @include default-text(24px, 24px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__tab-window-wrapper {
    padding: 10px;
  }
  &__empty-label {
    @include default-text(24px, 24px, var(--color-text));
    text-align: center;
    @media (max-width: $tablet-l) {
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
}
</style>
