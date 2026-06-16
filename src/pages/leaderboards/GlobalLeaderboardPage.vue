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
        <div class="global-leaderboard-page__section-wrapper">
          <h3 class="global-leaderboard-page__sub-headline">
            Игроки BOTM
            <span class="global-leaderboard-page__count">
              ({{ filteredPlayersCount }})
            </span>
          </h3>
          <LeaderboardTable
            :itemsList="allTableItems"
            :hiddenColumns="[
              'joinedTimestamp',
              'points',
              'totalScores',
              'avgScore',
              'avgAcc',
              'avgCombo',
            ]"
            :themeColor="'var(--color-btn-bg-skillsets-maps)'"
            :defaultSortBy="[{ key: 'totalPoints', order: 'desc' }]"
            showDigitFilters
            @update:filteredCount="filteredPlayersCount = $event"
          />
        </div>
        <v-divider
          class="global-leaderboard-page__divider border-opacity-100"
        />
        <div class="global-leaderboard-page__section-wrapper">
          <h3 class="global-leaderboard-page__sub-headline">
            Все BOTM Скоры
            <span class="global-leaderboard-page__count">
              ({{ filteredScoresCount }})
            </span>
          </h3>
          <ScoresTable
            :scoresList="allScoresList"
            :isLoading="isLoading"
            :themeColor="'var(--color-btn-bg-skillsets-maps)'"
            showDigitFilters
            @update:filteredCount="filteredScoresCount = $event"
          />
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
import LeaderboardTable from "@/components/leaderboards/LeaderboardTable.vue";
import ScoresTable from "@/components/scores/ScoresTable.vue";
import useToast from "@/composables/useToast";
import { BotmClub } from "@/types/clubs";

const scoresStore = useScoresStore();
const usersStore = useUsersStore();
const osumapsStore = useOsumapsStore();
const { setErrorToast } = useToast();

const isLoading = ref(false);
const filteredPlayersCount = ref(0);
const filteredScoresCount = ref(0);

const allTableItems = computed(() => {
  return scoresStore.leaderboardsData.map((stat) => ({
    uid: stat.uid,
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
    &_global {
      color: var(--color-btn-bg-skillsets-maps);
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
}
</style>
