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
          <v-btn
            v-if="true"
            height="50"
            :disabled="!userInfo"
            class="trainings-page__btn"
            @click="isPlanTrainingModalOpened = true"
          >
            Запланировать качалочку
          </v-btn>
          <h4 v-if="false" class="trainings-page__empty-label">
            Пока нет качалочек в планах...
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
            Пока нет записей в архиве...
          </h4>
          <v-expansion-panels v-else>
            <TrainingCard v-for="i in 1" :key="i" />
          </v-expansion-panels>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
    <PlanTrainingModal
      :isOpened="isPlanTrainingModalOpened"
      @closeModal="isPlanTrainingModalOpened = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import TrainingCard from "@/components/TrainingCard.vue";
import PlanTrainingModal from "@/components/PlanTrainingModal.vue";

const authStore = useAuthStore();

const currTab = ref("plans");
const isPlanTrainingModalOpened = ref(false);

const userInfo = computed(() => {
  if (
    authStore.user?.additionalInfo === "loading" ||
    authStore.user?.additionalInfo === "loadingError"
  ) {
    return null;
  } else {
    return authStore.user?.additionalInfo ?? null;
  }
});
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
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__btn {
    @include default-btn(100%, var(--color-btn-text), var(--color-btn-bg), 0);
    @media (max-width: $phone-l) {
      font-size: 12px;
      line-height: 12px;
    }
    @media (max-width: $phone-m) {
      font-size: 10px;
      line-height: 10px;
    }
  }
  &__empty-label {
    padding: 20px;
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
