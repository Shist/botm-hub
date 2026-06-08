<template>
  <div class="global-leaderboard-page">
    <v-skeleton-loader type="article, table, table" :loading="isLoading">
      <div class="global-leaderboard-page__content">
        <h2 class="global-leaderboard-page__headline">
          <span class="global-leaderboard-page__headline_global">
            Глобальный
          </span>
          Лидерборд BOTM
        </h2>
        <div class="global-leaderboard-page__table-section">
          <div class="global-leaderboard-page__controls">
            <v-btn-toggle
              v-model="selectedDigitFilter"
              color="var(--color-btn-bg-skillsets-maps)"
              density="compact"
              rounded="lg"
              mandatory
              class="global-leaderboard-page__digit-toggle"
            >
              <v-btn value="all">Все</v-btn>
              <v-btn :value="DigitCategory.FOUR_DIGIT">
                4
                <span class="global-leaderboard-page__digit-text">
                  &nbsp;Дигиты
                </span>
              </v-btn>
              <v-btn :value="DigitCategory.FIVE_DIGIT">
                5
                <span class="global-leaderboard-page__digit-text">
                  &nbsp;Дигиты
                </span>
              </v-btn>
              <v-btn :value="DigitCategory.SIX_DIGIT">
                6
                <span class="global-leaderboard-page__digit-text">
                  &nbsp;Дигиты
                </span>
              </v-btn>
            </v-btn-toggle>
            <v-text-field
              v-model="searchQuery"
              variant="solo"
              prepend-inner-icon="mdi-magnify"
              label="Поиск по нику"
              placeholder="Введи ник игрока..."
              clearable
              hide-details
              density="compact"
              class="global-leaderboard-page__search"
            />
          </div>
          <v-data-table-virtual
            :headers="tableHeaders"
            :items="filteredTableItems"
            :search="searchQuery"
            :mobile-breakpoint="769"
            :custom-filter="
              (_, query, item) =>
                item?.raw.searchString.includes(query.toLowerCase())
            "
            item-value="uid"
            class="global-leaderboard-page__table"
            hover
            :sort-by="[{ key: 'totalPoints', order: 'desc' }]"
          >
            <template #[`item.rank`]="{ item }">
              <span class="global-leaderboard-page__rank">
                #{{ item.rank }}
              </span>
            </template>
            <template #[`item.user`]="{ item }">
              <div class="global-leaderboard-page__table-user-wrapper">
                <UserCard :user="item.user" />
              </div>
            </template>
            <template #[`item.totalPoints`]="{ item }">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <span
                    v-bind="props"
                    class="global-leaderboard-page__points-total global-leaderboard-page__points-hoverable"
                  >
                    {{ item.totalPoints.toFixed(2) }}
                  </span>
                </template>
                <div class="global-leaderboard-page__tooltip-content">
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Скоров:</span>
                    <span>{{ item.overallStats.totalScores }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средний скор:</span>
                    <span>{{
                      item.overallStats.avgScore > 0
                        ? item.overallStats.avgScore.toLocaleString("ru-RU")
                        : "0"
                    }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средняя акка:</span>
                    <span>{{ item.overallStats.avgAcc.toFixed(2) }}%</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Среднее комбо:</span>
                    <span>{{ item.overallStats.avgCombo }}x</span>
                  </div>
                </div>
              </v-tooltip>
            </template>
            <template #[`item.aim`]="{ item }">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <span
                    v-bind="props"
                    class="global-leaderboard-page__points-club global-leaderboard-page__points-hoverable"
                    style="color: var(--color-club-aim)"
                  >
                    {{ item.aim.toFixed(2) }}
                  </span>
                </template>
                <div class="global-leaderboard-page__tooltip-content">
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Скоров:</span>
                    <span>{{ item.aimStats.totalScores }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средний скор:</span>
                    <span>{{
                      item.aimStats.avgScore > 0
                        ? item.aimStats.avgScore.toLocaleString("ru-RU")
                        : "0"
                    }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средняя акка:</span>
                    <span>{{ item.aimStats.avgAcc.toFixed(2) }}%</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Среднее комбо:</span>
                    <span>{{ item.aimStats.avgCombo }}x</span>
                  </div>
                </div>
              </v-tooltip>
            </template>
            <template #[`item.speed`]="{ item }">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <span
                    v-bind="props"
                    class="global-leaderboard-page__points-club global-leaderboard-page__points-hoverable"
                    style="color: var(--color-club-speed)"
                  >
                    {{ item.speed.toFixed(2) }}
                  </span>
                </template>
                <div class="global-leaderboard-page__tooltip-content">
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Скоров:</span>
                    <span>{{ item.speedStats.totalScores }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средний скор:</span>
                    <span>{{
                      item.speedStats.avgScore > 0
                        ? item.speedStats.avgScore.toLocaleString("ru-RU")
                        : "0"
                    }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средняя акка:</span>
                    <span>{{ item.speedStats.avgAcc.toFixed(2) }}%</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Среднее комбо:</span>
                    <span>{{ item.speedStats.avgCombo }}x</span>
                  </div>
                </div>
              </v-tooltip>
            </template>
            <template #[`item.tech`]="{ item }">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <span
                    v-bind="props"
                    class="global-leaderboard-page__points-club global-leaderboard-page__points-hoverable"
                    style="color: var(--color-club-tech)"
                  >
                    {{ item.tech.toFixed(2) }}
                  </span>
                </template>
                <div class="global-leaderboard-page__tooltip-content">
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Скоров:</span>
                    <span>{{ item.techStats.totalScores }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средний скор:</span>
                    <span>{{
                      item.techStats.avgScore > 0
                        ? item.techStats.avgScore.toLocaleString("ru-RU")
                        : "0"
                    }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средняя акка:</span>
                    <span>{{ item.techStats.avgAcc.toFixed(2) }}%</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Среднее комбо:</span>
                    <span>{{ item.techStats.avgCombo }}x</span>
                  </div>
                </div>
              </v-tooltip>
            </template>
            <template #[`item.reading`]="{ item }">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <span
                    v-bind="props"
                    class="global-leaderboard-page__points-club global-leaderboard-page__points-hoverable"
                    style="color: var(--color-club-reading)"
                  >
                    {{ item.reading.toFixed(2) }}
                  </span>
                </template>
                <div class="global-leaderboard-page__tooltip-content">
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Скоров:</span>
                    <span>{{ item.readingStats.totalScores }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средний скор:</span>
                    <span>{{
                      item.readingStats.avgScore > 0
                        ? item.readingStats.avgScore.toLocaleString("ru-RU")
                        : "0"
                    }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средняя акка:</span>
                    <span>{{ item.readingStats.avgAcc.toFixed(2) }}%</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Среднее комбо:</span>
                    <span>{{ item.readingStats.avgCombo }}x</span>
                  </div>
                </div>
              </v-tooltip>
            </template>
            <template #[`item.hidden`]="{ item }">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <span
                    v-bind="props"
                    class="global-leaderboard-page__points-club global-leaderboard-page__points-hoverable"
                    style="color: var(--color-club-hidden)"
                  >
                    {{ item.hidden.toFixed(2) }}
                  </span>
                </template>
                <div class="global-leaderboard-page__tooltip-content">
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Скоров:</span>
                    <span>{{ item.hiddenStats.totalScores }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средний скор:</span>
                    <span>
                      {{
                        item.hiddenStats.avgScore > 0
                          ? item.hiddenStats.avgScore.toLocaleString("ru-RU")
                          : "0"
                      }}
                    </span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средняя акка:</span>
                    <span>{{ item.hiddenStats.avgAcc.toFixed(2) }}%</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Среднее комбо:</span>
                    <span>{{ item.hiddenStats.avgCombo }}x</span>
                  </div>
                </div>
              </v-tooltip>
            </template>
            <template #[`item.hardrock`]="{ item }">
              <v-tooltip location="top">
                <template #activator="{ props }">
                  <span
                    v-bind="props"
                    class="global-leaderboard-page__points-club global-leaderboard-page__points-hoverable"
                    style="color: var(--color-club-hardrock)"
                  >
                    {{ item.hardrock.toFixed(2) }}
                  </span>
                </template>
                <div class="global-leaderboard-page__tooltip-content">
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Скоров:</span>
                    <span>{{ item.hardrockStats.totalScores }}</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средний скор:</span>
                    <span>
                      {{
                        item.hardrockStats.avgScore > 0
                          ? item.hardrockStats.avgScore.toLocaleString("ru-RU")
                          : "0"
                      }}
                    </span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Средняя акка:</span>
                    <span>{{ item.hardrockStats.avgAcc.toFixed(2) }}%</span>
                  </div>
                  <div class="global-leaderboard-page__tooltip-row">
                    <span>Среднее комбо:</span>
                    <span>{{ item.hardrockStats.avgCombo }}x</span>
                  </div>
                </div>
              </v-tooltip>
            </template>
            <template #no-data>
              <div class="global-leaderboard-page__no-data">
                Нет данных об игроках
              </div>
            </template>
          </v-data-table-virtual>
        </div>
        <v-divider
          class="global-leaderboard-page__divider border-opacity-100"
        />
        <div class="global-leaderboard-page__scores-section">
          <h3 class="global-leaderboard-page__sub-headline">
            Все BOTM Скоры
            <span class="global-leaderboard-page__count">
              ({{ allScoresList.length }})
            </span>
          </h3>
          <ScoresTable :scoresList="allScoresList" :isLoading="isLoading" />
        </div>
      </div>
    </v-skeleton-loader>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useScoresStore } from "@/stores/scores";
import { useUsersStore } from "@/stores/users";
import { useOsumapsStore } from "@/stores/osumaps";
import UserCard from "@/components/users/UserCard.vue";
import ScoresTable from "@/components/scores/ScoresTable.vue";
import useToast from "@/composables/useToast";
import { DigitCategory } from "@/types/users";
import { BotmClub } from "@/types/clubs";

const scoresStore = useScoresStore();
const usersStore = useUsersStore();
const osumapsStore = useOsumapsStore();
const { setErrorToast } = useToast();

const isLoading = ref(false);
const searchQuery = ref("");
const selectedDigitFilter = ref<"all" | DigitCategory>("all");

const tableHeaders = [
  {
    title: "Место",
    key: "rank",
    align: "center" as const,
    width: "80px",
    sortable: false,
  },
  { title: "Игрок", key: "user", minWidth: "300px", sortable: false },
  {
    title: "Всего Очков",
    key: "totalPoints",
    align: "center" as const,
    minWidth: "135px",
  },
  { title: "Aim", key: "aim", align: "center" as const, minWidth: "109px" },
  { title: "Speed", key: "speed", align: "center" as const, minWidth: "109px" },
  { title: "Tech", key: "tech", align: "center" as const, minWidth: "109px" },
  {
    title: "Reading",
    key: "reading",
    align: "center" as const,
    minWidth: "109px",
  },
  {
    title: "Hidden",
    key: "hidden",
    align: "center" as const,
    minWidth: "109px",
  },
  {
    title: "Hardrock",
    key: "hardrock",
    align: "center" as const,
    minWidth: "109px",
  },
];

const allTableItems = computed(() => {
  return scoresStore.leaderboardsData.map((stat, index) => ({
    uid: stat.uid,
    rank: index + 1,
    user: stat.user,
    searchString: stat.user.nick.toLowerCase(),
    totalPoints: stat.overall.points,
    overallStats: stat.overall,
    aim: stat.clubs[BotmClub.AIM].points,
    aimStats: stat.clubs[BotmClub.AIM],
    speed: stat.clubs[BotmClub.SPEED].points,
    speedStats: stat.clubs[BotmClub.SPEED],
    tech: stat.clubs[BotmClub.TECH].points,
    techStats: stat.clubs[BotmClub.TECH],
    reading: stat.clubs[BotmClub.READING].points,
    readingStats: stat.clubs[BotmClub.READING],
    hidden: stat.clubs[BotmClub.HIDDEN].points,
    hiddenStats: stat.clubs[BotmClub.HIDDEN],
    hardrock: stat.clubs[BotmClub.HARDROCK].points,
    hardrockStats: stat.clubs[BotmClub.HARDROCK],
  }));
});

const filteredTableItems = computed(() => {
  let filtered = allTableItems.value;

  if (selectedDigitFilter.value !== "all") {
    filtered = filtered.filter(
      (item) => item.user.digitCategory === selectedDigitFilter.value
    );
  }

  let currentRank = 1;
  return filtered.map((item) => {
    return {
      ...item,
      rank: item.totalPoints > 0 ? currentRank++ : "—",
    };
  });
});

const allScoresList = computed(() => {
  return scoresStore.getFlatScoresTableData();
});

onMounted(async () => {
  try {
    isLoading.value = true;
    await Promise.all([
      usersStore.getAllUsersAndLoadClubs(),
      osumapsStore.loadAllMaps(),
      scoresStore.loadAllScores(),
    ]);
  } catch (error) {
    const msg = error instanceof Error ? error.message : error;
    setErrorToast(`Ошибка загрузки юзеров, клубов, карт или скоров: ${msg}`);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.global-leaderboard-page {
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 30px;
    width: 100%;
  }
  &__headline {
    @include default-headline(44px, 44px, var(--color-text));
    text-align: center;
    @media (max-width: $tablet-l) {
      font-size: 32px;
      line-height: 32px;
    }
    @media (max-width: $phone-l) {
      font-size: 24px;
      line-height: 24px;
    }
    &_global {
      color: var(--color-btn-bg-skillsets-maps);
    }
  }
  &__sub-headline {
    @include default-headline(28px, 28px, var(--color-text));
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 15px;
  }
  &__count {
    @include default-text(24px, 24px, var(--color-text));
  }
  &__divider {
    width: 100%;
  }
  &__table-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  &__controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    padding-inline: 10px;
    @media (max-width: $tablet-l) {
      flex-direction: column;
      align-items: stretch;
    }
  }
  &__digit-toggle {
    @media (max-width: $tablet-l) {
      width: 100%;
    }
    & :deep(.v-btn) {
      @media (max-width: $tablet-l) {
        flex: 1 1 auto;
      }
    }
  }
  &__digit-text {
    @media (max-width: $phone-l) {
      display: none;
    }
  }
  &__search {
    max-width: 400px;
    @media (max-width: $tablet-l) {
      max-width: 100%;
    }
  }
  &__table {
    border: 4px solid var(--color-vuetify-table-borders);
    border-radius: 4px;
    height: 600px;
    & :deep(th) {
      vertical-align: middle;
      font-weight: bold;
    }
    & :deep(td) {
      vertical-align: middle;
    }
  }
  &__table-user-wrapper {
    padding: 8px 0;
  }
  &__rank {
    font-weight: bold;
    font-size: 18px;
    color: var(--color-text-gray);
  }
  &__points-total {
    font-weight: bold;
    font-size: 18px;
    color: var(--color-points);
  }
  &__points-club {
    font-weight: bold;
  }
  &__points-hoverable {
    cursor: help;
    border-bottom: 1px dashed var(--color-hoverable-bottom-border);
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.8;
    }
  }
  &__tooltip-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 6px 4px;
  }
  &__tooltip-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    font-size: 14px;
    span:last-child {
      font-weight: bold;
    }
  }
  &__no-data {
    padding: 40px;
    text-align: center;
    @include default-text(18px, 18px, var(--color-text));
    opacity: 0.7;
  }
  &__scores-section {
    width: 100%;
    display: flex;
    flex-direction: column;
  }
}
</style>
