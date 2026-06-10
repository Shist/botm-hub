<template>
  <div class="category-leaderboard-page">
    <v-skeleton-loader type="article, table" :loading="isLoading">
      <div v-if="isValidCategory" class="category-leaderboard-page__content">
        <h2 class="category-leaderboard-page__headline">
          Лидерборд
          <span :style="{ color: categoryColor }">{{ categoryName }}</span>
        </h2>
        <div class="category-leaderboard-page__table-section">
          <div class="category-leaderboard-page__controls">
            <v-btn-toggle
              v-model="selectedDigitFilter"
              :color="categoryColor"
              density="compact"
              rounded="lg"
              mandatory
              class="category-leaderboard-page__digit-toggle"
            >
              <v-btn value="all">Все</v-btn>
              <v-btn :value="DigitCategory.FOUR_DIGIT">
                4
                <span class="category-leaderboard-page__digit-text">
                  &nbsp;Дигиты
                </span>
              </v-btn>
              <v-btn :value="DigitCategory.FIVE_DIGIT">
                5
                <span class="category-leaderboard-page__digit-text">
                  &nbsp;Дигиты
                </span>
              </v-btn>
              <v-btn :value="DigitCategory.SIX_DIGIT">
                6
                <span class="category-leaderboard-page__digit-text">
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
              class="category-leaderboard-page__search"
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
            class="category-leaderboard-page__table"
            hover
            :sort-by="[{ key: 'points', order: 'desc' }]"
          >
            <template #[`item.rank`]="{ item }">
              <span class="category-leaderboard-page__rank">
                #{{ item.rank }}
              </span>
            </template>
            <template #[`item.user`]="{ item }">
              <div class="category-leaderboard-page__table-user-wrapper">
                <UserCard :user="item.user" />
              </div>
            </template>
            <template #[`item.points`]="{ item }">
              <span
                class="category-leaderboard-page__points"
                :style="{ color: categoryColor }"
              >
                {{ item.points.toFixed(2) }}
              </span>
            </template>
            <template #[`item.avgScore`]="{ item }">
              <span class="category-leaderboard-page__score">
                {{
                  item.avgScore > 0
                    ? item.avgScore.toLocaleString("ru-RU")
                    : "0"
                }}
              </span>
            </template>
            <template #[`item.avgAcc`]="{ item }">
              <span>{{ item.avgAcc.toFixed(2) }}%</span>
            </template>
            <template #[`item.avgCombo`]="{ item }">
              <span>{{ item.avgCombo }}x</span>
            </template>
            <template #no-data>
              <div class="category-leaderboard-page__no-data">
                Нет данных об игроках
              </div>
            </template>
          </v-data-table-virtual>
        </div>
        <v-divider
          class="category-leaderboard-page__divider border-opacity-100"
        />
        <div class="category-leaderboard-page__scores-section">
          <h3 class="category-leaderboard-page__sub-headline">
            Все Скоры {{ categoryName }}
            <span class="category-leaderboard-page__count">
              ({{ categoryScoresList.length }})
            </span>
          </h3>
          <ScoresTable
            :scoresList="categoryScoresList"
            :isLoading="isLoading"
            :targetCategory="currentCategory"
          />
        </div>
      </div>
      <div v-else class="category-leaderboard-page__not-found-wrapper">
        <h2 class="category-leaderboard-page__not-found-headline">
          Указанная категория лидерборда не существует
        </h2>
        <span class="category-leaderboard-page__not-found-id">
          Лидерборд: {{ route.params.category }}
        </span>
        <router-link to="/" class="category-leaderboard-page__link-to-main">
          Назад на главную страницу
        </router-link>
      </div>
    </v-skeleton-loader>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useScoresStore } from "@/stores/scores";
import { useUsersStore } from "@/stores/users";
import { useOsumapsStore } from "@/stores/osumaps";
import UserCard from "@/components/users/UserCard.vue";
import ScoresTable from "@/components/scores/ScoresTable.vue";
import useToast from "@/composables/useToast";
import { isValidModCombinationForCategory } from "@/utils/index";
import { MAPS_CATEGORIES, CATEGORIES_COLORS } from "@/constants";
import { OsuMapCategory, isOsuMapCategory } from "@/types/osumaps";
import { DigitCategory } from "@/types/users";

const route = useRoute();
const scoresStore = useScoresStore();
const usersStore = useUsersStore();
const osumapsStore = useOsumapsStore();
const { setErrorToast } = useToast();

const isLoading = ref(false);
const searchQuery = ref("");
const selectedDigitFilter = ref<"all" | DigitCategory>("all");

const currentCategory = computed(() => {
  const category = String(route.params.category).toLowerCase();
  return isOsuMapCategory(category) ? (category as OsuMapCategory) : null;
});

const isValidCategory = computed(() => currentCategory.value !== null);

const categoryName = computed(() => {
  return currentCategory.value ? MAPS_CATEGORIES[currentCategory.value] : "";
});

const categoryColor = computed(() => {
  return currentCategory.value
    ? CATEGORIES_COLORS[currentCategory.value]
    : "var(--color-text)";
});

const tableHeaders = [
  {
    title: "Место",
    key: "rank",
    align: "center" as const,
    width: "80px",
    sortable: false,
  },
  { title: "Игрок", key: "user", minWidth: "300px", sortable: false },
  { title: "Очки", key: "points", align: "center" as const, minWidth: "120px" },
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
];

const allTableItems = computed(() => {
  if (!currentCategory.value) return [];

  const sortedStats = [...scoresStore.leaderboardsData].sort((a, b) => {
    return (
      b.skillsets[currentCategory.value!].points -
      a.skillsets[currentCategory.value!].points
    );
  });

  return sortedStats.map((stat) => {
    const bucket = stat.skillsets[currentCategory.value!];
    return {
      uid: stat.uid,
      user: stat.user,
      searchString: stat.user.nick.toLowerCase(),
      points: bucket.points,
      totalScores: bucket.totalScores,
      avgScore: bucket.avgScore,
      avgAcc: bucket.avgAcc,
      avgCombo: bucket.avgCombo,
    };
  });
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
      rank: item.totalScores > 0 ? currentRank++ : "—",
    };
  });
});

const categoryScoresList = computed(() => {
  if (!currentCategory.value) return [];

  const allScores = scoresStore.getFlatScoresTableData();

  return allScores.filter((score) => {
    const hasCategory = score.mapCategories.includes(currentCategory.value!);
    const hasValidMods = isValidModCombinationForCategory(
      [score.mods],
      currentCategory.value!
    );
    return hasCategory && hasValidMods;
  });
});

onMounted(async () => {
  if (!isValidCategory.value) return;
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
.category-leaderboard-page {
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
  &__scores-section {
    width: 100%;
    display: flex;
    flex-direction: column;
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
      justify-content: center;
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
  &__points {
    font-weight: bold;
    font-size: 18px;
  }
  &__score {
    font-weight: bold;
  }
  &__no-data {
    padding: 40px;
    text-align: center;
    @include default-text(18px, 18px, var(--color-text));
    opacity: 0.7;
  }
  &__not-found-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 20px;
  }
  &__not-found-headline {
    @include default-headline(44px, 44px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 36px;
      line-height: 36px;
    }
    @media (max-width: $phone-l) {
      font-size: 28px;
      line-height: 28px;
    }
  }
  &__not-found-id {
    @include default-text(36px, 36px, var(--color-text));
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    @media (max-width: $tablet-l) {
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      font-size: 12px;
      line-height: 12px;
    }
  }
  &__link-to-main {
    @include default-text(36px, 36px, var(--color-text));
    transition: 0.3s;
    &:hover {
      scale: 1.05;
      translate: 10px;
      color: var(--color-link-active);
    }
    @media (max-width: $tablet-l) {
      font-size: 28px;
      line-height: 28px;
    }
    @media (max-width: $phone-l) {
      font-size: 24px;
      line-height: 24px;
    }
  }
}
</style>
