<template>
  <div class="tournaments-page">
    <h2 class="tournaments-page__headline">Турниры и Наши Ростеры</h2>
    <div class="tournaments-page__search-wrapper">
      <v-text-field
        v-model="searchQuery"
        variant="solo"
        prepend-inner-icon="mdi-magnify"
        placeholder="Поиск по названию, описанию или нику..."
        clearable
        hide-details
      />
    </div>
    <div class="tournaments-page__tabs-wrapper" ref="tabsContainer">
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
            v-else-if="!paginatedActiveTournaments.length"
            class="tournaments-page__empty-label"
          >
            {{
              searchQuery
                ? "По запросу ничего не найдено..."
                : "Пока нет записей о текущих турнирах..."
            }}
          </h4>
          <template v-else>
            <v-expansion-panels v-model="expandedActiveTournamentsPanel">
              <TournamentCard
                v-for="tournament in paginatedActiveTournaments"
                :key="tournament.id"
                :tournament="tournament"
                :currDate="currDate"
                ref="activeTournaments"
                @onEditTournament="onEditTournament"
                @onDeleteTournament="onDeleteTournament"
                @onArchiveTournament="onArchiveTournament"
                @onAddRoster="onAddRoster"
                @onEditRoster="onEditRoster"
                @onDeleteRoster="onDeleteRoster"
              />
            </v-expansion-panels>
            <div
              v-if="activeTotalPages > 1"
              class="tournaments-page__pagination-wrapper"
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
            v-else-if="!paginatedArchivedTournaments.length"
            class="tournaments-page__empty-label"
          >
            {{
              searchQuery
                ? "По запросу ничего не найдено..."
                : "Пока нет записей в архиве..."
            }}
          </h4>
          <template v-else>
            <v-expansion-panels v-model="expandedArchivedTournamentsPanel">
              <TournamentCard
                v-for="tournament in paginatedArchivedTournaments"
                :key="tournament.id"
                :tournament="tournament"
                :currDate="currDate"
                ref="archivedTournaments"
              />
            </v-expansion-panels>
            <div
              v-if="archiveTotalPages > 1"
              class="tournaments-page__pagination-wrapper"
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
    <PlanTournamentRosterModal
      :isOpened="isPlanRosterModalOpened"
      :tournamentId="selectedTournamentIdForRoster"
      :roster="selectedRosterForEditing"
      @closeModal="onClosePlanRosterModal"
      @closeModalAfterRequest="onClosePlanRosterModalAfterRequest"
    />
    <DeleteTournamentRosterModal
      :isOpened="isDeleteRosterModalOpened"
      :tournamentId="selectedTournamentIdForRoster"
      :rosterId="selectedRosterIdForDeleting"
      @closeModal="onCloseDeleteRosterModal"
      @closeModalAfterDeleting="onCloseDeleteRosterModalAfterDeleting"
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
import { useTournamentsStore } from "@/stores/tournaments";
import TournamentCard from "@/components/tournaments/TournamentCard.vue";
import PlanTournamentModal from "@/components/tournaments/PlanTournamentModal.vue";
import DeleteTournamentModal from "@/components/tournaments/DeleteTournamentModal.vue";
import ArchiveTournamentModal from "@/components/tournaments/ArchiveTournamentModal.vue";
import PlanTournamentRosterModal from "@/components/tournaments/PlanTournamentRosterModal.vue";
import DeleteTournamentRosterModal from "@/components/tournaments/DeleteTournamentRosterModal.vue";
import { useDisplay } from "vuetify";
import useToast from "@/composables/useToast";
import {
  type IAllTournamentsListItem,
  type IRosterInfo,
} from "@/types/tournaments";
import { type IAllUsersListItem } from "@/types/users";

const ITEMS_PER_PAGE = 10;

const tabsContainer = useTemplateRef<HTMLElement>("tabsContainer");
const activeTournamentsRefs = useTemplateRef("activeTournaments");
const archivedTournamentsRefs = useTemplateRef("archivedTournaments");

const authStore = useAuthStore();
const tournamentsStore = useTournamentsStore();

const { width } = useDisplay();
const { setErrorToast } = useToast();

const currTab = ref("current");
const searchQuery = ref("");
const activePage = ref(1);
const archivePage = ref(1);

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
const selectedTournamentIdForRoster = ref<string>("");
const selectedRosterForEditing = ref<IRosterInfo<IAllUsersListItem> | null>(
  null
);
const selectedRosterIdForDeleting = ref<string>("");
const isPlanRosterModalOpened = ref(false);
const isDeleteRosterModalOpened = ref(false);

const userInfo = computed(() => authStore.userAdditionalInfo);

const isTournamentMatchSearch = (
  tournament: IAllTournamentsListItem,
  query: string
) => {
  const q = query.toLowerCase();
  return (
    tournament.title.toLowerCase().includes(q) ||
    tournament.description.toLowerCase().includes(q) ||
    tournament.rostersInfo.some((r) =>
      r.players.some((p) => p && p.nick.toLowerCase().includes(q))
    )
  );
};

const filteredActiveTournaments = computed(() => {
  let list = tournamentsStore.tournaments
    .filter((t) => !t.isArchived)
    .sort(
      (a, b) => a.datesInfo.endDate.getTime() - b.datesInfo.endDate.getTime()
    );
  if (searchQuery.value) {
    list = list.filter((t) => isTournamentMatchSearch(t, searchQuery.value));
  }
  return list;
});

const filteredArchivedTournaments = computed(() => {
  let list = tournamentsStore.tournaments
    .filter((t) => t.isArchived)
    .sort(
      (a, b) => b.datesInfo.endDate.getTime() - a.datesInfo.endDate.getTime()
    );
  if (searchQuery.value) {
    list = list.filter((t) => isTournamentMatchSearch(t, searchQuery.value));
  }
  return list;
});

const paginationVisible = computed(() => (width.value <= 480 ? 3 : 5));
const paginationSize = computed(() =>
  width.value <= 480 ? "x-small" : "default"
);

const paginatedActiveTournaments = computed(() => {
  const start = (activePage.value - 1) * ITEMS_PER_PAGE;
  return filteredActiveTournaments.value.slice(start, start + ITEMS_PER_PAGE);
});
const paginatedArchivedTournaments = computed(() => {
  const start = (archivePage.value - 1) * ITEMS_PER_PAGE;
  return filteredArchivedTournaments.value.slice(start, start + ITEMS_PER_PAGE);
});

const activeTotalPages = computed(() =>
  Math.ceil(filteredActiveTournaments.value.length / ITEMS_PER_PAGE)
);
const archiveTotalPages = computed(() =>
  Math.ceil(filteredArchivedTournaments.value.length / ITEMS_PER_PAGE)
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

  setTimeout(() => {
    const changedPanel = tournamentsRefs.value?.find(
      (activePanel) => activePanel?.tournamentId === tournamentId
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
const onAddRoster = (tournamentId: string) => {
  selectedTournamentIdForRoster.value = tournamentId;
  selectedRosterForEditing.value = null;
  isPlanRosterModalOpened.value = true;
};
const onEditRoster = (tournamentId: string, rosterId: string) => {
  selectedTournamentIdForRoster.value = tournamentId;
  const tournament = tournamentsStore.tournaments.find(
    (t) => t.id === tournamentId
  );
  if (!tournament) return;
  const roster = tournament.rostersInfo.find((r) => r.id === rosterId);
  if (!roster) return;
  selectedRosterForEditing.value = {
    ...roster,
    players: [...roster.players],
  };
  isPlanRosterModalOpened.value = true;
};
const onDeleteRoster = (tournamentId: string, rosterId: string) => {
  selectedTournamentIdForRoster.value = tournamentId;
  selectedRosterIdForDeleting.value = rosterId;
  isDeleteRosterModalOpened.value = true;
};

const onClosePlanTournamentModal = () => {
  isRecordTournamentModalOpened.value = false;
  selectedTournamentForEditing.value = null;
};
const onClosePlanTournamentModalAfterRequest = async (tournamentId: string) => {
  onClosePlanTournamentModal();

  searchQuery.value = "";
  currTab.value = "current";
  await nextTick();

  const itemIndex = filteredActiveTournaments.value.findIndex(
    (t) => t.id === tournamentId
  );
  if (itemIndex !== -1) {
    activePage.value = Math.floor(itemIndex / ITEMS_PER_PAGE) + 1;
  }

  await nextTick();
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
  if (paginatedActiveTournaments.value.length === 0 && activePage.value > 1) {
    activePage.value--;
  }
};

const onCloseArchiveTournamentModal = () => {
  isArchiveTournamentModalOpened.value = false;
  selectedTournamentIdForArchiving.value = "";
};
const onCloseArchiveTournamentModalAfterArchiving = async (
  tournamentId: string
) => {
  onCloseArchiveTournamentModal();

  searchQuery.value = "";
  currTab.value = "archive";

  await nextTick();

  const itemIndex = filteredArchivedTournaments.value.findIndex(
    (t) => t.id === tournamentId
  );
  if (itemIndex !== -1) {
    archivePage.value = Math.floor(itemIndex / ITEMS_PER_PAGE) + 1;
  }

  await nextTick();
  expandedArchivedTournamentsPanel.value = tournamentId;
  scrollToChangedTournamentPanel(false, tournamentId);
};

const onClosePlanRosterModal = () => {
  isPlanRosterModalOpened.value = false;
  selectedRosterForEditing.value = null;
  selectedTournamentIdForRoster.value = "";
};
const onClosePlanRosterModalAfterRequest = () => {
  onClosePlanRosterModal();
  scrollToChangedTournamentPanel(
    currTab.value === "current",
    selectedTournamentIdForRoster.value
  );
};
const onCloseDeleteRosterModal = () => {
  isDeleteRosterModalOpened.value = false;
  selectedTournamentIdForRoster.value = "";
  selectedRosterIdForDeleting.value = "";
};
const onCloseDeleteRosterModalAfterDeleting = () => {
  onCloseDeleteRosterModal();
  scrollToChangedTournamentPanel(
    currTab.value === "current",
    selectedTournamentIdForRoster.value
  );
};
</script>

<style lang="scss" scoped>
.tournaments-page {
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
