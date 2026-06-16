<template>
  <div class="leaderboard-table">
    <div class="leaderboard-table__controls">
      <v-btn-toggle
        v-if="showDigitFilters"
        v-model="selectedDigitFilter"
        :color="themeColor"
        density="compact"
        mandatory
        class="leaderboard-table__digit-toggle"
      >
        <v-btn value="all">Все</v-btn>
        <v-btn :value="DigitCategory.FOUR_DIGIT">
          4<span class="leaderboard-table__digit-text">&nbsp;Дигиты</span>
        </v-btn>
        <v-btn :value="DigitCategory.FIVE_DIGIT">
          5<span class="leaderboard-table__digit-text">&nbsp;Дигиты</span>
        </v-btn>
        <v-btn :value="DigitCategory.SIX_DIGIT">
          6<span class="leaderboard-table__digit-text">&nbsp;Дигиты</span>
        </v-btn>
      </v-btn-toggle>
      <v-text-field
        v-model="searchQuery"
        variant="filled"
        prepend-inner-icon="mdi-magnify"
        label="Найти по любому полю"
        placeholder="Введи любое значение..."
        density="compact"
        clearable
        hide-details
        class="leaderboard-table__search"
      />
    </div>
    <v-data-table-virtual
      :headers="visibleHeaders"
      :items="filteredTableItems"
      :mobile-breakpoint="769"
      item-value="uid"
      class="leaderboard-table__content"
      hover
      :sort-by="defaultSortBy"
    >
      <template #[`item.rank`]="{ item }">
        <span class="leaderboard-table__rank">{{ item.rank }}</span>
      </template>
      <template #[`item.user`]="{ item }">
        <div
          class="leaderboard-table__user-card-wrapper"
          @click.stop="goToUserProfile(item.user.nick)"
        >
          <UserCard :user="item.user" />
        </div>
      </template>
      <template #[`item.totalPoints`]="{ item }">
        <v-tooltip location="top">
          <template #activator="{ props }">
            <span
              v-bind="props"
              class="leaderboard-table__points-total leaderboard-table__points-hoverable"
            >
              {{ item.totalPoints?.toFixed(2) }}
            </span>
          </template>
          <div class="leaderboard-table__tooltip-content">
            <div class="leaderboard-table__tooltip-row">
              <span>Скоров:</span>
              <span>{{ item.overallStats?.totalScores }}</span>
            </div>
            <div class="leaderboard-table__tooltip-row">
              <span>Средний скор:</span>
              <span>
                {{
                  item.overallStats?.avgScore && item.overallStats.avgScore > 0
                    ? item.overallStats.avgScore.toLocaleString("ru-RU")
                    : "0"
                }}
              </span>
            </div>
            <div class="leaderboard-table__tooltip-row">
              <span>Средняя акка:</span>
              <span>{{ item.overallStats?.avgAcc?.toFixed(2) }}%</span>
            </div>
            <div class="leaderboard-table__tooltip-row">
              <span>Среднее комбо:</span>
              <span>{{ item.overallStats?.avgCombo }}x</span>
            </div>
          </div>
        </v-tooltip>
      </template>
      <template
        v-for="club in Object.values(BotmClub)"
        :key="club"
        #[`item.${club}`]="{ item }"
      >
        <v-tooltip location="top">
          <template #activator="{ props }">
            <span
              v-bind="props"
              class="leaderboard-table__points-club leaderboard-table__points-hoverable"
              :style="{ color: `var(--color-club-${club})` }"
            >
              {{
                (item[club as keyof ILeaderboardTableRow] as number)?.toFixed(2)
              }}
            </span>
          </template>
          <div class="leaderboard-table__tooltip-content">
            <div class="leaderboard-table__tooltip-row">
              <span>Скоров:</span>
              <span>
                {{
                  (item[`${club}Stats` as keyof ILeaderboardTableRow] as any)
                    ?.totalScores
                }}
              </span>
            </div>
            <div class="leaderboard-table__tooltip-row">
              <span>Средний скор:</span>
              <span>
                {{
                  (item[`${club}Stats` as keyof ILeaderboardTableRow] as any)
                    ?.avgScore > 0
                    ? (
                        item[
                          `${club}Stats` as keyof ILeaderboardTableRow
                        ] as any
                      ).avgScore.toLocaleString("ru-RU")
                    : "0"
                }}
              </span>
            </div>
            <div class="leaderboard-table__tooltip-row">
              <span>Средняя акка:</span>
              <span>
                {{
                  (
                    item[`${club}Stats` as keyof ILeaderboardTableRow] as any
                  )?.avgAcc?.toFixed(2)
                }}%
              </span>
            </div>
            <div class="leaderboard-table__tooltip-row">
              <span>Среднее комбо:</span>
              <span>
                {{
                  (item[`${club}Stats` as keyof ILeaderboardTableRow] as any)
                    ?.avgCombo
                }}x
              </span>
            </div>
          </div>
        </v-tooltip>
      </template>
      <template #[`item.points`]="{ item }">
        <span class="leaderboard-table__points" :style="{ color: themeColor }">
          {{ item.points?.toFixed(2) }}
        </span>
      </template>
      <template #[`item.totalScores`]="{ item }">
        <span>{{ item.totalScores }}</span>
      </template>
      <template #[`item.avgScore`]="{ item }">
        <span class="leaderboard-table__score">
          {{
            item.avgScore && item.avgScore > 0
              ? item.avgScore.toLocaleString("ru-RU")
              : "0"
          }}
        </span>
      </template>
      <template #[`item.avgAcc`]="{ item }">
        <span>{{ item.avgAcc?.toFixed(2) }}%</span>
      </template>
      <template #[`item.avgCombo`]="{ item }">
        <span>{{ item.avgCombo }}x</span>
      </template>
      <template #[`item.joinedTimestamp`]="{ item }">
        <span>{{ formatDateTime(item.joinedTimestamp) }}</span>
      </template>
      <template #no-data>
        <div class="leaderboard-table__no-data">Нет данных об игроках</div>
      </template>
    </v-data-table-virtual>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, reactive } from "vue";
import { useRouter } from "vue-router";
import UserCard from "@/components/users/UserCard.vue";
import { DigitCategory } from "@/types/users";
import type { ILeaderboardTableRow } from "@/types/scores";
import { BotmClub } from "@/types/clubs";

const router = useRouter();

const props = withDefaults(
  defineProps<{
    itemsList: ILeaderboardTableRow[];
    hiddenColumns?: string[];
    themeColor?: string;
    defaultSortBy?: { key: string; order?: "asc" | "desc" }[];
    showDigitFilters?: boolean;
  }>(),
  {
    hiddenColumns: () => [],
    themeColor: "var(--global-bg-base)",
    defaultSortBy: () => [{ key: "points", order: "desc" }],
    showDigitFilters: false,
  }
);

const emit = defineEmits<{
  (e: "update:filteredCount", count: number): void;
}>();

const searchQuery = ref("");
const selectedDigitFilter = ref<"all" | DigitCategory>("all");

const allHeaders = reactive([
  {
    title: "Место",
    key: "rank",
    align: "center" as const,
    width: "95px",
    minWidth: "95px",
    sort: (a: string | number, b: string | number) => {
      if (a === "—") return 1;
      if (b === "—") return -1;
      const numA = typeof a === "string" ? parseInt(a.replace("#", ""), 10) : a;
      const numB = typeof b === "string" ? parseInt(b.replace("#", ""), 10) : b;
      return numA - numB;
    },
  },
  {
    title: "Игрок",
    key: "user",
    minWidth: "300px",
    sort: (a: { nick?: string }, b: { nick?: string }) => {
      const nickA = a?.nick ?? "";
      const nickB = b?.nick ?? "";
      return nickA.localeCompare(nickB);
    },
  },
  { title: "Дата вступления", key: "joinedTimestamp", minWidth: "165px" },
  {
    title: "Всего Очков",
    key: "totalPoints",
    align: "center" as const,
    minWidth: "135px",
  },
  { title: "Очки", key: "points", align: "center" as const, minWidth: "120px" },
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
  {
    title: "Скоров",
    key: "totalScores",
    align: "center" as const,
    minWidth: "102px",
  },
  {
    title: "Средний Скор",
    key: "avgScore",
    align: "center" as const,
    minWidth: "146px",
  },
  {
    title: "Средняя Акка",
    key: "avgAcc",
    align: "center" as const,
    minWidth: "145px",
  },
  {
    title: "Среднее Комбо",
    key: "avgCombo",
    align: "center" as const,
    minWidth: "156px",
  },
]);

const visibleHeaders = computed(() => {
  return allHeaders.filter((h) => !props.hiddenColumns.includes(h.key));
});

const filteredTableItems = computed(() => {
  let filtered = props.itemsList;

  if (props.showDigitFilters && selectedDigitFilter.value !== "all") {
    filtered = filtered.filter(
      (item) => item.user.digitCategory === selectedDigitFilter.value
    );
  }

  const sortKey = props.defaultSortBy[0]?.key ?? "points";
  const orderMultiplier = props.defaultSortBy[0]?.order === "asc" ? 1 : -1;

  filtered = [...filtered].sort((a, b) => {
    const valA = (a[sortKey as keyof ILeaderboardTableRow] as number) || 0;
    const valB = (b[sortKey as keyof ILeaderboardTableRow] as number) || 0;
    return (valA - valB) * orderMultiplier;
  });

  let currentRank = 1;
  filtered = filtered.map((item) => {
    const val = (item[sortKey as keyof ILeaderboardTableRow] as number) || 0;
    return {
      ...item,
      rank: val > 0 ? `#${currentRank++}` : "—",
    };
  });

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    filtered = filtered.filter((item) => {
      return (
        item.searchString.includes(q) ||
        String(item.rank).includes(q) ||
        item.totalPoints?.toFixed(2).includes(q) ||
        item.points?.toFixed(2).includes(q) ||
        item.totalScores?.toString().includes(q) ||
        item.avgScore?.toString().includes(q) ||
        item.avgAcc?.toFixed(2).includes(q) ||
        item.avgCombo?.toString().includes(q) ||
        item.aim?.toFixed(2).includes(q) ||
        item.speed?.toFixed(2).includes(q) ||
        item.tech?.toFixed(2).includes(q) ||
        item.reading?.toFixed(2).includes(q) ||
        item.hidden?.toFixed(2).includes(q) ||
        item.hardrock?.toFixed(2).includes(q) ||
        (item.joinedTimestamp &&
          formatDateTime(item.joinedTimestamp).includes(q))
      );
    });
  }

  return filtered;
});

const goToUserProfile = (nick: string) => {
  router.push({ name: "player-profile", params: { nick: nick } });
};

const formatDateTime = (timestamp?: number) => {
  if (!timestamp) return "—";
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeStr = date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} ${timeStr}`;
};

watch(
  () => filteredTableItems.value.length,
  (newLength) => emit("update:filteredCount", newLength),
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.leaderboard-table {
  width: 100%;
  border: 4px solid var(--color-vuetify-table-borders);
  border-radius: 4px;
  &__controls {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: var(--color-vuetify-table-borders);
    @media (max-width: $tablet-l) {
      flex-direction: column;
      align-items: stretch;
    }
  }
  &__digit-toggle {
    padding-inline: 2px;
    @media (max-width: $tablet-l) {
      padding-inline: 0;
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
    flex-grow: 1;
  }
  &__content {
    height: 600px;
    & :deep(th) {
      vertical-align: middle;
      font-weight: bold;
    }
    & :deep(td) {
      vertical-align: middle;
    }
  }
  &__user-card-wrapper {
    padding: 4px 0;
  }
  &__rank {
    font-weight: bold;
    font-size: 18px;
    color: var(--color-text-gray);
  }
  &__points,
  &__points-total,
  &__points-club {
    font-weight: bold;
    font-size: 18px;
  }
  &__points-total {
    color: var(--color-points);
  }
  &__points-hoverable {
    cursor: help;
    border-bottom: 1px dashed var(--color-hoverable-bottom-border);
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.8;
    }
  }
  &__score {
    font-weight: bold;
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
}
</style>
