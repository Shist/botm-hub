<template>
  <div class="category-leaderboard-page">
    <v-skeleton-loader type="article, table" :loading="isLoading">
      <div v-if="isValidCategory" class="category-leaderboard-page__content">
        <h2 class="category-leaderboard-page__headline">
          Лидерборд
          <span :style="{ color: categoryColor }">
            {{ categoryName }}
          </span>
        </h2>
        <div class="category-leaderboard-page__section-wrapper">
          <h3 class="category-leaderboard-page__sub-headline">
            Игроки BOTM
            <span class="category-leaderboard-page__count">
              ({{ filteredPlayersCount }})
            </span>
          </h3>
          <LeaderboardTable
            :itemsList="allTableItems"
            :hiddenColumns="[
              'joinedTimestamp',
              'totalPoints',
              'aim',
              'speed',
              'tech',
              'reading',
              'hidden',
              'hardrock',
            ]"
            :themeColor="categoryColor"
            :defaultSortBy="[{ key: 'points', order: 'desc' }]"
            showDigitFilters
            @update:filteredCount="filteredPlayersCount = $event"
          />
        </div>
        <v-divider
          class="category-leaderboard-page__divider border-opacity-100"
        />
        <div class="category-leaderboard-page__section-wrapper">
          <h3 class="category-leaderboard-page__sub-headline">
            Все Скоры {{ categoryName }}
            <span class="category-leaderboard-page__count">
              ({{ filteredScoresCount }})
            </span>
          </h3>
          <ScoresTable
            :scoresList="categoryScoresList"
            :isLoading="isLoading"
            :targetCategory="currentCategory"
            :themeColor="categoryColor"
            showDigitFilters
            @update:filteredCount="filteredScoresCount = $event"
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
import LeaderboardTable from "@/components/leaderboards/LeaderboardTable.vue";
import ScoresTable from "@/components/scores/ScoresTable.vue";
import useToast from "@/composables/useToast";
import { isValidModCombinationForCategory } from "@/utils/index";
import { MAPS_CATEGORIES, CATEGORIES_COLORS } from "@/constants";
import { OsuMapCategory, isOsuMapCategory } from "@/types/osumaps";

const route = useRoute();
const scoresStore = useScoresStore();
const usersStore = useUsersStore();
const osumapsStore = useOsumapsStore();
const { setErrorToast } = useToast();

const isLoading = ref(false);
const filteredPlayersCount = ref(0);
const filteredScoresCount = ref(0);

const currentCategory = computed(() => {
  const category = String(route.params.category).toLowerCase();
  return isOsuMapCategory(category) ? (category as OsuMapCategory) : null;
});
const isValidCategory = computed(() => currentCategory.value !== null);

const categoryName = computed(() =>
  currentCategory.value ? MAPS_CATEGORIES[currentCategory.value] : ""
);
const categoryColor = computed(() =>
  currentCategory.value
    ? CATEGORIES_COLORS[currentCategory.value]
    : "var(--global-bg-base)"
);

const allTableItems = computed(() => {
  if (!currentCategory.value) return [];
  return scoresStore.leaderboardsData.map((stat) => {
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
    row-gap: 20px;
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
  &__section-wrapper {
    @extend %section-wrapper;
  }
  &__sub-headline {
    @include default-headline(28px, 28px, var(--color-text));
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  &__count {
    @include default-text(24px, 24px, var(--color-text));
  }
  &__divider {
    width: 100%;
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
