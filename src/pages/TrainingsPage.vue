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
            :disabled="isLoading || !userInfo"
            height="50"
            class="trainings-page__btn"
            @click="isPlanTrainingModalOpened = true"
          >
            Запланировать качалочку
          </v-btn>
          <template v-if="isLoading">
            <v-skeleton-loader
              v-for="i in 3"
              :key="i"
              type="paragraph"
              :loading="isLoading"
            />
          </template>
          <h4
            v-if="!isLoading && !activeTrainingsList.length"
            class="trainings-page__empty-label"
          >
            Пока нет качалочек в планах...
          </h4>
          <v-expansion-panels v-model="expandedActiveTrainingsPanel" v-else>
            <TrainingCard
              v-for="training in activeTrainingsList"
              :key="training.id"
              :training="training"
              :currDate="currDate"
              @onEditTraining="onEditTraining"
              @onDeleteTraining="onDeleteTraining"
              @onArchiveTraining="onArchiveTraining"
            />
          </v-expansion-panels>
        </v-tabs-window-item>
        <v-tabs-window-item
          value="archive"
          class="trainings-page__tab-window-wrapper"
        >
          <template v-if="isLoading">
            <v-skeleton-loader
              v-for="i in 3"
              :key="i"
              type="paragraph"
              :loading="isLoading"
            />
          </template>
          <h4
            v-if="!isLoading && !archivedTrainingsList.length"
            class="trainings-page__empty-label"
          >
            Пока нет записей в архиве...
          </h4>
          <v-expansion-panels v-model="expandedArchivedTrainingsPanel" v-else>
            <TrainingCard
              v-for="training in archivedTrainingsList"
              :key="training.id"
              :training="training"
              :currDate="currDate"
            />
          </v-expansion-panels>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
    <PlanTrainingModal
      :isOpened="isPlanTrainingModalOpened"
      :training="selectedTrainingForEditing"
      @closeModal="onClosePlanTrainingModal"
      @closeModalAfterRequest="onClosePlanTrainingModalAfterRequest"
    />
    <DeleteTrainingModal
      :isOpened="isDeleteTrainingModalOpened"
      :trainingId="selectedTrainingIdForDeleting"
      @closeModal="onCloseDeleteTrainingModal"
      @closeModalAfterDeleting="onCloseDeleteTrainingModalAfterDeleting"
    />
    <ArchiveTrainingModal
      :isOpened="isArchiveTrainingModalOpened"
      :trainingId="selectedTrainingIdForArchiving"
      @closeModal="onCloseArchiveTrainingModal"
      @closeModalAfterArchiving="onCloseArchiveTrainingModalAfterArchiving"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTrainingsStore } from "@/stores/trainings";
import TrainingCard from "@/components/TrainingCard.vue";
import PlanTrainingModal from "@/components/PlanTrainingModal.vue";
import DeleteTrainingModal from "@/components/DeleteTrainingModal.vue";
import ArchiveTrainingModal from "@/components/ArchiveTrainingModal.vue";
import useToast from "@/composables/useToast";
import { type IAllTrainingsListItem } from "@/types";

const authStore = useAuthStore();
const trainingsStore = useTrainingsStore();

const { setErrorToast } = useToast();

const currTab = ref("plans");
const expandedActiveTrainingsPanel = ref<number | null>(null);
const expandedArchivedTrainingsPanel = ref<number | null>(null);
const isLoading = ref(false);
const currDate = ref(new Date());
const currDateUpdateIntervalId = ref<number | null>(null);
const selectedTrainingForEditing = ref<IAllTrainingsListItem | null>(null);
const selectedTrainingIdForDeleting = ref<string>("");
const selectedTrainingIdForArchiving = ref<string>("");
const isPlanTrainingModalOpened = ref(false);
const isDeleteTrainingModalOpened = ref(false);
const isArchiveTrainingModalOpened = ref(false);

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
const activeTrainingsList = computed(() => {
  return trainingsStore.trainings.filter((t) => !t.isArchived);
});
const archivedTrainingsList = computed(() => {
  return trainingsStore.trainings.filter((t) => t.isArchived);
});

onMounted(async () => {
  updateCurrDate();
  currDateUpdateIntervalId.value = setInterval(updateCurrDate, 1000);

  try {
    isLoading.value = true;
    await trainingsStore.getAllTrainings();
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось загрузить список качалочек: ${msg}`);
  } finally {
    isLoading.value = false;
  }
});

onUnmounted(() => {
  if (currDateUpdateIntervalId.value)
    clearInterval(currDateUpdateIntervalId.value);
});

const updateCurrDate = () => {
  currDate.value = new Date();
};

const onEditTraining = (training: IAllTrainingsListItem) => {
  selectedTrainingForEditing.value = training;
  isPlanTrainingModalOpened.value = true;
};
const onDeleteTraining = (trainingId: string) => {
  selectedTrainingIdForDeleting.value = trainingId;
  isDeleteTrainingModalOpened.value = true;
};
const onArchiveTraining = (trainingId: string) => {
  selectedTrainingIdForArchiving.value = trainingId;
  isArchiveTrainingModalOpened.value = true;
};
const onClosePlanTrainingModal = () => {
  isPlanTrainingModalOpened.value = false;
  selectedTrainingForEditing.value = null;
};
const onClosePlanTrainingModalAfterRequest = (trainingId: string) => {
  onClosePlanTrainingModal();
  expandedActiveTrainingsPanel.value = activeTrainingsList.value.findIndex(
    (t) => t.id === trainingId
  );
};
const onCloseDeleteTrainingModal = () => {
  isDeleteTrainingModalOpened.value = false;
  selectedTrainingIdForDeleting.value = "";
};
const onCloseDeleteTrainingModalAfterDeleting = () => {
  onCloseDeleteTrainingModal();
  expandedActiveTrainingsPanel.value = null;
};
const onCloseArchiveTrainingModal = () => {
  isArchiveTrainingModalOpened.value = false;
  selectedTrainingIdForArchiving.value = "";
};
const onCloseArchiveTrainingModalAfterArchiving = (trainingId: string) => {
  onCloseArchiveTrainingModal();
  expandedArchivedTrainingsPanel.value = archivedTrainingsList.value.findIndex(
    (t) => t.id === trainingId
  );
  currTab.value = "archive";
};
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
