<template>
  <div class="tournaments-page">
    <h2 class="tournaments-page__headline">Турниры и Наши Ростеры</h2>
    <div class="tournaments-page__tabs-wrapper">
      <v-tabs v-model="currTab" show-arrows grow>
        <v-tab value="current" class="tournaments-page__tab-title">
          Текущие
        </v-tab>
        <v-tab value="archive" class="tournaments-page__tab-title">Архив</v-tab>
      </v-tabs>
      <v-divider class="border-opacity-100" />
      <v-tabs-window v-model="currTab">
        <v-tabs-window-item
          value="current"
          class="tournaments-page__tab-window-wrapper"
        >
          <v-btn
            v-if="userInfo?.isRedactor"
            :disabled="isLoading"
            height="50"
            class="tournaments-page__btn"
            @click="isRecordTournamentModalOpened = true"
          >
            Создать запись о турнире
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
            v-if="!isLoading && !activeTournamentsList.length"
            class="tournaments-page__empty-label"
          >
            Пока нет записей о текущих турнирах...
          </h4>
          <v-expansion-panels v-model="expandedActiveTournamentsPanel" v-else>
            <TournamentCard
              v-for="tournament in activeTournamentsList"
              :key="tournament.id"
              :tournament="tournament"
              :currDate="currDate"
              ref="activeTournaments"
              @onEditTournament="onEditTournament"
              @onDeleteTournament="onDeleteTournament"
              @onArchiveTournament="onArchiveTournament"
            />
          </v-expansion-panels>
        </v-tabs-window-item>
        <v-tabs-window-item
          value="archive"
          class="tournaments-page__tab-window-wrapper"
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
            v-if="!isLoading && !archivedTournamentsList.length"
            class="tournaments-page__empty-label"
          >
            Пока нет записей в архиве...
          </h4>
          <v-expansion-panels v-model="expandedArchivedTournamentsPanel" v-else>
            <TournamentCard
              v-for="tournament in archivedTournamentsList"
              :key="tournament.id"
              :tournament="tournament"
              :currDate="currDate"
              ref="archivedTournaments"
            />
          </v-expansion-panels>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
    <PlanTournamentModal
      :isOpened="isRecordTournamentModalOpened"
      :tournament="selectedTournamentForEditing"
      @closeModal="onClosePlanTournamentModal"
      @closeModalAfterRequest="onClosePlanTournamentModalAfterRequest"
    />
    <DeleteTournamentModal
      :isOpened="isDeleteTournamentModalOpened"
      :tournamentId="selectedTournamentIdForDeleting"
      @closeModal="onCloseDeleteTournamentModal"
      @closeModalAfterDeleting="onCloseDeleteTournamentModalAfterDeleting"
    />
    <ArchiveTournamentModal
      :isOpened="isArchiveTournamentModalOpened"
      :tournamentId="selectedTournamentIdForArchiving"
      @closeModal="onCloseArchiveTournamentModal"
      @closeModalAfterArchiving="onCloseArchiveTournamentModalAfterArchiving"
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
} from "vue";
import { useAuthStore } from "@/stores/auth";
import { useTournamentsStore } from "@/stores/tournaments";
import TournamentCard from "@/components/TournamentCard.vue";
import PlanTournamentModal from "@/components/PlanTournamentModal.vue";
import DeleteTournamentModal from "@/components/DeleteTournamentModal.vue";
import ArchiveTournamentModal from "@/components/ArchiveTournamentModal.vue";
import useToast from "@/composables/useToast";
import { type IAllTournamentsListItem } from "@/types";

const activeTournamentsRefs = useTemplateRef("activeTournaments");
const archivedTournamentsRefs = useTemplateRef("archivedTournaments");

const authStore = useAuthStore();
const tournamentsStore = useTournamentsStore();

const { setErrorToast } = useToast();

const currTab = ref("current");
const expandedActiveTournamentsPanel = ref<string | null>(null);
const expandedArchivedTournamentsPanel = ref<string | null>(null);
const isLoading = ref(false);
const currDate = ref(new Date());
const currDateUpdateIntervalId = ref<number | null>(null);
const selectedTournamentForEditing = ref<IAllTournamentsListItem | null>(null);
const selectedTournamentIdForDeleting = ref<string>("");
const selectedTournamentIdForArchiving = ref<string>("");
const isRecordTournamentModalOpened = ref(false);
const isDeleteTournamentModalOpened = ref(false);
const isArchiveTournamentModalOpened = ref(false);

const userInfo = computed(() => authStore.userAdditionalInfo);
const activeTournamentsList = computed(() => {
  return tournamentsStore.tournaments
    .filter((t) => !t.isArchived)
    .sort(
      (a, b) => a.datesInfo.endDate.getTime() - b.datesInfo.endDate.getTime()
    );
});
const archivedTournamentsList = computed(() => {
  return tournamentsStore.tournaments
    .filter((t) => t.isArchived)
    .sort(
      (a, b) => b.datesInfo.endDate.getTime() - a.datesInfo.endDate.getTime()
    );
});

onMounted(async () => {
  updateCurrDate();
  currDateUpdateIntervalId.value = setInterval(updateCurrDate, 1000);

  try {
    isLoading.value = true;
    await tournamentsStore.getAllTournaments();
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось загрузить список турниров: ${msg}`);
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

const scrollToChangedTournamentPanel = async (
  isActiveTab: boolean,
  tournamentId: string
) => {
  await nextTick();
  const tournamentsRefs = isActiveTab
    ? activeTournamentsRefs
    : archivedTournamentsRefs;
  const changedPanel = tournamentsRefs.value?.find(
    (activePanel) => activePanel?.tournamentId === tournamentId
  );
  changedPanel?.$el.scrollIntoView({ behavior: "smooth", block: "start" });
};

const onEditTournament = (tournament: IAllTournamentsListItem) => {
  selectedTournamentForEditing.value = tournament;
  isRecordTournamentModalOpened.value = true;
};
const onDeleteTournament = (tournamentId: string) => {
  selectedTournamentIdForDeleting.value = tournamentId;
  isDeleteTournamentModalOpened.value = true;
};
const onArchiveTournament = (tournamentId: string) => {
  selectedTournamentIdForArchiving.value = tournamentId;
  isArchiveTournamentModalOpened.value = true;
};
const onClosePlanTournamentModal = () => {
  isRecordTournamentModalOpened.value = false;
  selectedTournamentForEditing.value = null;
};
const onClosePlanTournamentModalAfterRequest = (tournamentId: string) => {
  onClosePlanTournamentModal();
  expandedActiveTournamentsPanel.value = tournamentId;
  scrollToChangedTournamentPanel(true, tournamentId);
};
const onCloseDeleteTournamentModal = () => {
  isDeleteTournamentModalOpened.value = false;
  selectedTournamentIdForDeleting.value = "";
};
const onCloseDeleteTournamentModalAfterDeleting = () => {
  onCloseDeleteTournamentModal();
  expandedActiveTournamentsPanel.value = null;
};
const onCloseArchiveTournamentModal = () => {
  isArchiveTournamentModalOpened.value = false;
  selectedTournamentIdForArchiving.value = "";
};
const onCloseArchiveTournamentModalAfterArchiving = (tournamentId: string) => {
  onCloseArchiveTournamentModal();
  expandedArchivedTournamentsPanel.value = tournamentId;
  currTab.value = "archive";
  scrollToChangedTournamentPanel(false, tournamentId);
};
</script>

<style lang="scss" scoped>
.tournaments-page {
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
