<template>
  <div class="trainings-page">
    <h2 class="trainings-page__headline">Расписания Качалочек</h2>
    <div class="trainings-page__search-wrapper">
      <v-text-field
        v-model="searchQuery"
        variant="solo"
        prepend-inner-icon="mdi-magnify"
        placeholder="Поиск по названию, описанию или нику..."
        clearable
        hide-details
      />
    </div>
    <div class="trainings-page__tabs-wrapper" ref="tabsContainer">
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
            v-if="userInfo?.isTrainer"
            :disabled="isLoading"
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
            v-else-if="!paginatedActiveTrainings.length"
            class="trainings-page__empty-label"
          >
            {{
              searchQuery
                ? "По запросу ничего не найдено..."
                : "Пока нет качалочек в планах..."
            }}
          </h4>
          <template v-else>
            <v-expansion-panels v-model="expandedActiveTrainingsPanel">
              <TrainingCard
                v-for="training in paginatedActiveTrainings"
                :key="training.id"
                :training="training"
                :currDate="currDate"
                ref="activeTrainings"
                @onEditTraining="onEditTraining"
                @onDeleteTraining="onDeleteTraining"
                @onArchiveTraining="onArchiveTraining"
              />
            </v-expansion-panels>
            <div
              v-if="activeTotalPages > 1"
              class="trainings-page__pagination-wrapper"
            >
              <v-pagination
                v-model="activePage"
                :length="activeTotalPages"
                :total-visible="paginationVisible"
                :size="paginationSize"
                @update:model-value="scrollToTabs"
              />
            </div>
          </template>
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
            v-else-if="!paginatedArchivedTrainings.length"
            class="trainings-page__empty-label"
          >
            {{
              searchQuery
                ? "По запросу ничего не найдено..."
                : "Пока нет записей в архиве..."
            }}
          </h4>
          <template v-else>
            <v-expansion-panels v-model="expandedArchivedTrainingsPanel">
              <TrainingCard
                v-for="training in paginatedArchivedTrainings"
                :key="training.id"
                :training="training"
                :currDate="currDate"
                ref="archivedTrainings"
              />
            </v-expansion-panels>
            <div
              v-if="archiveTotalPages > 1"
              class="trainings-page__pagination-wrapper"
            >
              <v-pagination
                v-model="archivePage"
                :length="archiveTotalPages"
                :total-visible="paginationVisible"
                :size="paginationSize"
                @update:model-value="scrollToTabs"
              />
            </div>
          </template>
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
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  useTemplateRef,
  nextTick,
  watch,
} from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTrainingsStore } from "@/stores/trainings";
import TrainingCard from "@/components/trainings/TrainingCard.vue";
import PlanTrainingModal from "@/components/trainings/PlanTrainingModal.vue";
import DeleteTrainingModal from "@/components/trainings/DeleteTrainingModal.vue";
import ArchiveTrainingModal from "@/components/trainings/ArchiveTrainingModal.vue";
import { useDisplay } from "vuetify";
import useToast from "@/composables/useToast";
import { type IAllTrainingsListItem } from "@/types/trainings";

const ITEMS_PER_PAGE = 10;

const tabsContainer = useTemplateRef<HTMLElement>("tabsContainer");
const activeTrainingsRefs = useTemplateRef("activeTrainings");
const archivedTrainingsRefs = useTemplateRef("archivedTrainings");

const authStore = useAuthStore();
const trainingsStore = useTrainingsStore();

const { width } = useDisplay();
const { setErrorToast } = useToast();

const currTab = ref("plans");
const searchQuery = ref("");
const activePage = ref(1);
const archivePage = ref(1);

const expandedActiveTrainingsPanel = ref<string | null>(null);
const expandedArchivedTrainingsPanel = ref<string | null>(null);
const isLoading = ref(false);
const currDate = ref(new Date());
const currDateUpdateIntervalId = ref<number | null>(null);
const selectedTrainingForEditing = ref<IAllTrainingsListItem | null>(null);
const selectedTrainingIdForDeleting = ref<string>("");
const selectedTrainingIdForArchiving = ref<string>("");
const isPlanTrainingModalOpened = ref(false);
const isDeleteTrainingModalOpened = ref(false);
const isArchiveTrainingModalOpened = ref(false);

const userInfo = computed(() => authStore.userAdditionalInfo);

const isTrainingMatchSearch = (
  training: IAllTrainingsListItem,
  query: string
) => {
  const q = query.toLowerCase();
  return (
    training.title.toLowerCase().includes(q) ||
    training.description.toLowerCase().includes(q) ||
    training.participants.some((p) => p.nick.toLowerCase().includes(q))
  );
};

const filteredActiveTrainings = computed(() => {
  let list = trainingsStore.trainings.filter((t) => !t.isArchived);
  if (searchQuery.value) {
    list = list.filter((t) => isTrainingMatchSearch(t, searchQuery.value));
  }
  return list;
});

const filteredArchivedTrainings = computed(() => {
  let list = trainingsStore.trainings
    .filter((t) => t.isArchived)
    .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());
  if (searchQuery.value) {
    list = list.filter((t) => isTrainingMatchSearch(t, searchQuery.value));
  }
  return list;
});

const paginationVisible = computed(() => (width.value <= 480 ? 3 : 5));
const paginationSize = computed(() =>
  width.value <= 480 ? "x-small" : "default"
);

const paginatedActiveTrainings = computed(() => {
  const start = (activePage.value - 1) * ITEMS_PER_PAGE;
  return filteredActiveTrainings.value.slice(start, start + ITEMS_PER_PAGE);
});
const paginatedArchivedTrainings = computed(() => {
  const start = (archivePage.value - 1) * ITEMS_PER_PAGE;
  return filteredArchivedTrainings.value.slice(start, start + ITEMS_PER_PAGE);
});

const activeTotalPages = computed(() =>
  Math.ceil(filteredActiveTrainings.value.length / ITEMS_PER_PAGE)
);
const archiveTotalPages = computed(() =>
  Math.ceil(filteredArchivedTrainings.value.length / ITEMS_PER_PAGE)
);

watch(searchQuery, () => {
  activePage.value = 1;
  archivePage.value = 1;
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
  if (currDateUpdateIntervalId.value) {
    clearInterval(currDateUpdateIntervalId.value);
  }
});

const updateCurrDate = () => {
  currDate.value = new Date();
};

const scrollToChangedTrainingPanel = async (
  isActiveTab: boolean,
  trainingId: string
) => {
  await nextTick();
  const trainingsRefs = isActiveTab
    ? activeTrainingsRefs
    : archivedTrainingsRefs;

  setTimeout(() => {
    const changedPanel = trainingsRefs.value?.find(
      (activePanel) => activePanel?.trainingId === trainingId
    );
    changedPanel?.$el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 400);
};

const scrollToTabs = async () => {
  await nextTick();
  if (tabsContainer.value) {
    tabsContainer.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
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
const onClosePlanTrainingModalAfterRequest = async (trainingId: string) => {
  onClosePlanTrainingModal();

  searchQuery.value = "";
  currTab.value = "plans";
  await nextTick();

  const itemIndex = filteredActiveTrainings.value.findIndex(
    (t) => t.id === trainingId
  );
  if (itemIndex !== -1) {
    activePage.value = Math.floor(itemIndex / ITEMS_PER_PAGE) + 1;
  }

  await nextTick();
  expandedActiveTrainingsPanel.value = trainingId;
  scrollToChangedTrainingPanel(true, trainingId);
};

const onCloseDeleteTrainingModal = () => {
  isDeleteTrainingModalOpened.value = false;
  selectedTrainingIdForDeleting.value = "";
};
const onCloseDeleteTrainingModalAfterDeleting = () => {
  onCloseDeleteTrainingModal();
  expandedActiveTrainingsPanel.value = null;
  if (paginatedActiveTrainings.value.length === 0 && activePage.value > 1) {
    activePage.value--;
  }
};

const onCloseArchiveTrainingModal = () => {
  isArchiveTrainingModalOpened.value = false;
  selectedTrainingIdForArchiving.value = "";
};
const onCloseArchiveTrainingModalAfterArchiving = async (
  trainingId: string
) => {
  onCloseArchiveTrainingModal();

  searchQuery.value = "";
  currTab.value = "archive";

  await nextTick();

  const itemIndex = filteredArchivedTrainings.value.findIndex(
    (t) => t.id === trainingId
  );
  if (itemIndex !== -1) {
    archivePage.value = Math.floor(itemIndex / ITEMS_PER_PAGE) + 1;
  }

  await nextTick();
  expandedArchivedTrainingsPanel.value = trainingId;
  scrollToChangedTrainingPanel(false, trainingId);
};
</script>

<style lang="scss" scoped>
.trainings-page {
  display: flex;
  flex-direction: column;
  row-gap: 15px;
  &__headline {
    @include default-headline(36px, 36px, var(--color-text));
    text-align: center;
    @media (max-width: $tablet-l) {
      font-size: 28px;
      line-height: 28px;
    }
    @media (max-width: $phone-l) {
      font-size: 20px;
      line-height: 20px;
    }
  }
  &__search-wrapper {
    margin-bottom: -10px;
  }
  &__tabs-wrapper {
    color: var(--color-text);
    background-color: var(--color-tabs-bg);
    scroll-margin-top: 100px;
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
  &__pagination-wrapper {
    margin-top: 10px;
    display: flex;
    justify-content: center;
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
