<template>
  <div class="clubs-page">
    <h2 class="clubs-page__headline">Клубы и Лидерборды</h2>
    <v-skeleton-loader type="table" :loading="isLoading">
      <div class="clubs-grid">
        <div
          v-for="club in clubsData"
          :key="club.id"
          class="clubs-grid__club-wrapper"
          :class="`clubs-grid__club-wrapper_${club.id}`"
        >
          <h3 class="clubs-grid__club-title">{{ club.title }}</h3>
          <v-btn
            :to="`/clubs/${club.id}`"
            variant="elevated"
            color="rgba(0, 0, 0, 0.25)"
            elevation="0"
            append-icon="mdi-arrow-right-circle-outline"
            class="clubs-grid__details-btn"
          >
            Подробнее
          </v-btn>
          <div class="clubs-grid__section">
            <span class="clubs-grid__section-label">Лидер:</span>
            <UserCard v-if="club.leader" :user="club.leader" />
            <span v-else class="clubs-grid__empty-label">Пока не назначен</span>
          </div>
          <v-divider class="clubs-grid__divider border-opacity-50" />
          <div class="clubs-grid__section">
            <span class="clubs-grid__section-label">Активные участники:</span>
            <div class="clubs-grid__members-list">
              <span v-if="!club.members.length" class="clubs-grid__empty-label">
                В поисках талантов...
              </span>
              <template v-else>
                <UserCard
                  v-for="member in club.members"
                  :key="member.uid"
                  :user="member"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
      <v-divider class="border-opacity-100" />
      <h2 class="clubs-page__headline">
        Все BOTM Скоры ({{ allScoresList.length }})
      </h2>
      <ScoresTable
        :scoresList="allScoresList"
        :isLoading="isLoading"
        :defaultSort="[{ key: 'date', order: 'asc' }]"
      />
      <v-divider class="border-opacity-100" />
      <h2 class="clubs-page__headline">
        Все BOTM Мапы ({{ allMapsList.length }})
      </h2>
      <SkillsetMapsTable :mapsList="allMapsList" :isLoading="isLoading" />
    </v-skeleton-loader>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useUsersStore } from "@/stores/users";
import { useClubsStore } from "@/stores/clubs";
import { useOsumapsStore } from "@/stores/osumaps";
import { useScoresStore } from "@/stores/scores";
import UserCard from "@/components/users/UserCard.vue";
import ScoresTable from "@/components/scores/ScoresTable.vue";
import SkillsetMapsTable from "@/components/osumaps/SkillsetMapsTable.vue";
import useToast from "@/composables/useToast";
import { CLUB_SETTINGS } from "@/constants";

const usersStore = useUsersStore();
const clubsStore = useClubsStore();
const mapsStore = useOsumapsStore();
const scoresStore = useScoresStore();

const { setErrorToast } = useToast();

const isLoading = ref(false);

const clubsData = computed(() => {
  return Object.values(CLUB_SETTINGS).map((clubSettings) => {
    const clubDbData = clubsStore.clubs[clubSettings.id];

    const leader = clubDbData?.leaderUid
      ? (usersStore.users.find((u) => u.uid === clubDbData.leaderUid) ?? null)
      : null;

    const members = usersStore.users
      .filter((u) => {
        const isMember = clubDbData?.members?.[u.uid];
        const isLeader = u.uid === leader?.uid;
        return isMember && !isLeader;
      })
      .sort((a, b) => a.nick.localeCompare(b.nick));

    return { ...clubSettings, leader, members };
  });
});

const allScoresList = computed(() => {
  if (isLoading.value) return [];
  return scoresStore.getFlatScoresTableData();
});

const allMapsList = computed(() => {
  if (isLoading.value) return [];
  return Object.values(mapsStore.osumaps).flat();
});

onMounted(async () => {
  try {
    isLoading.value = true;
    await Promise.all([
      usersStore.getAllUsersAndLoadClubs(),
      mapsStore.loadAllMaps(),
      scoresStore.loadAllScores(),
    ]);
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(
      `Не удалось загрузить данные юзеров, клубов, карт или скоров: ${msg}`
    );
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.clubs-page {
  display: flex;
  flex-direction: column;
  row-gap: 20px;
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
}
.clubs-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  @media (max-width: $pc-xl) {
    grid-template-columns: repeat(3, 1fr);
  }
  @media (max-width: $tablet-l) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: $phone-l) {
    grid-template-columns: repeat(1, 1fr);
  }
  &__club-wrapper {
    padding: 10px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    border-radius: 5px;
    &_aim {
      background-color: var(--color-club-aim);
    }
    &_speed {
      background-color: var(--color-club-speed);
    }
    &_tech {
      background-color: var(--color-club-tech);
    }
    &_reading {
      background-color: var(--color-club-reading);
    }
    &_hidden {
      background-color: var(--color-club-hidden);
    }
    &_hardrock {
      background-color: var(--color-club-hardrock);
    }
  }
  &__club-title {
    @include default-headline(26px, 26px, var(--color-text-white));
    text-align: center;
  }
  &__details-btn {
    color: var(--color-text-white) !important;
    font-weight: 700;
    letter-spacing: 0.5px;
    width: 100%;
  }
  &__divider {
    color: var(--color-text-white);
  }
  &__section {
    display: flex;
    flex-direction: column;
    row-gap: 6px;
  }
  &__section-label {
    @include default-headline(16px, 16px, var(--color-text-white));
    opacity: 0.9;
  }
  &__members-list {
    display: flex;
    flex-direction: column;
    row-gap: 6px;
  }
  &__empty-label {
    @include default-text(16px, 16px, var(--color-text-white));
    opacity: 0.8;
    font-style: italic;
  }
}
</style>
