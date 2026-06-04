<template>
  <div class="player-profile-page">
    <v-skeleton-loader type="image, paragraph, table" :loading="isLoading">
      <div v-if="playerInfo" class="player-profile-page__user-data-wrapper">
        <div class="player-profile-page__user-info-wrapper">
          <v-tooltip
            :disabled="playerInfo?.osuId !== null"
            text="Этот игрок пока не указал свой osu! ID"
            location="top"
          >
            <template #activator="{ props }">
              <AppImage
                v-bind="props"
                :imgPath="avatarSrc"
                imgAlt="Аватар"
                class="player-profile-page__avatar"
              />
            </template>
          </v-tooltip>
          <div class="player-profile-page__info-wrapper">
            <span>Ник:</span>
            <span>
              {{ playerInfo?.nick ?? "(не указан)" }}
            </span>
            <span>osu! ID:</span>
            <a
              v-if="playerInfo?.osuId"
              :href="`https://osu.ppy.sh/users/${playerInfo?.osuId}`"
              target="_blank"
            >
              {{ playerInfo?.osuId }}
            </a>
            <span v-else>(не указан)</span>
            <span>Скиллсеты:</span>
            <div class="player-profile-page__categories-wrapper">
              <template v-if="playerSkillsets.length">
                <CategoryBadge
                  v-for="skillset in playerSkillsets"
                  :key="skillset"
                  :category="skillset"
                />
              </template>
              <span v-else>(не указаны)</span>
            </div>
            <span>Особые тэги:</span>
            <div class="player-profile-page__tags-wrapper">
              <IconAdmin v-if="isShist" />
              <IconRedactor v-if="isRedactor" />
              <IconTrainer v-if="isTrainer" />
              <IconAimLead v-if="isAimLead" />
              <IconSpeedLead v-if="isSpeedLead" />
              <IconTechLead v-if="isTechLead" />
              <IconReadingLead v-if="isReadingLead" />
              <IconHiddenLead v-if="isHiddenLead" />
              <IconHardrockLead v-if="isHardrockLead" />
              <component :is="digitIconComponent" />
              <span
                v-if="!hasSomeTags"
                class="player-profile-page__no-tags-label"
              >
                (пока нет)
              </span>
            </div>
            <span>Клубы:</span>
            <div class="player-profile-page__tags-wrapper">
              <template v-if="playerClubs.length">
                <IconAimMember
                  v-if="playerClubs.includes(BotmClub.AIM)"
                  class="player-profile-page__club-icon player-profile-page__club-icon_aim"
                />
                <IconSpeedMember
                  v-if="playerClubs.includes(BotmClub.SPEED)"
                  class="player-profile-page__club-icon player-profile-page__club-icon_speed"
                />
                <IconTechMember
                  v-if="playerClubs.includes(BotmClub.TECH)"
                  class="player-profile-page__club-icon player-profile-page__club-icon_tech"
                />
                <IconReadingMember
                  v-if="playerClubs.includes(BotmClub.READING)"
                  class="player-profile-page__club-icon player-profile-page__club-icon_reading"
                />
                <IconHiddenMember
                  v-if="playerClubs.includes(BotmClub.HIDDEN)"
                  class="player-profile-page__club-icon player-profile-page__club-icon_hidden"
                />
                <IconHardrockMember
                  v-if="playerClubs.includes(BotmClub.HARDROCK)"
                  class="player-profile-page__club-icon player-profile-page__club-icon_hardrock"
                />
              </template>
              <span v-else class="player-profile-page__no-tags-label">
                (не состоит)
              </span>
            </div>
            <span>О себе:</span>
            <span class="player-profile-page__description">
              {{ playerInfo.profileDescription ?? "(пока не написал)" }}
            </span>
          </div>
        </div>
        <v-divider class="player-profile-page__divider border-opacity-100" />
        <h2 class="player-profile-page__scores-headline">
          Скоры Игрока ({{ playerScoresList.length }})
        </h2>
        <ScoresTable
          :scoresList="playerScoresList"
          :isLoading="isLoading"
          :hiddenColumns="['user']"
        />
      </div>
      <div v-else class="player-profile-page__user-not-found-wrapper">
        <h2 class="player-profile-page__user-not-found-headline">
          Игрок с указанным ником не найден
        </h2>
        <span class="player-profile-page__user-not-found-nick">
          Ник: {{ playerNick }}
        </span>
        <router-link to="/" class="player-profile-page__link-to-main">
          Назад на главную страницу
        </router-link>
      </div>
    </v-skeleton-loader>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUsersStore } from "@/stores/users";
import { useOsumapsStore } from "@/stores/osumaps";
import { useScoresStore } from "@/stores/scores";
import { useClubsStore } from "@/stores/clubs";
import useUserTags from "@/composables/useUserTags";
import useToast from "@/composables/useToast";
import CategoryBadge from "@/components/osumaps/CategoryBadge.vue";
import ScoresTable from "@/components/scores/ScoresTable.vue";
import IconAdmin from "@/components/users/user-icons/IconAdmin.vue";
import IconRedactor from "@/components/users/user-icons/IconRedactor.vue";
import IconTrainer from "@/components/users/user-icons/IconTrainer.vue";
import IconAimLead from "@/components/users/user-icons/clubs/leads/IconAimLead.vue";
import IconSpeedLead from "@/components/users/user-icons/clubs/leads/IconSpeedLead.vue";
import IconTechLead from "@/components/users/user-icons/clubs/leads/IconTechLead.vue";
import IconReadingLead from "@/components/users/user-icons/clubs/leads/IconReadingLead.vue";
import IconHiddenLead from "@/components/users/user-icons/clubs/leads/IconHiddenLead.vue";
import IconHardrockLead from "@/components/users/user-icons/clubs/leads/IconHardrockLead.vue";
import IconAimMember from "@/components/users/user-icons/clubs/members/IconAimMember.vue";
import IconSpeedMember from "@/components/users/user-icons/clubs/members/IconSpeedMember.vue";
import IconTechMember from "@/components/users/user-icons/clubs/members/IconTechMember.vue";
import IconReadingMember from "@/components/users/user-icons/clubs/members/IconReadingMember.vue";
import IconHiddenMember from "@/components/users/user-icons/clubs/members/IconHiddenMember.vue";
import IconHardrockMember from "@/components/users/user-icons/clubs/members/IconHardrockMember.vue";
import { type IAllUsersListItem } from "@/types/users";
import { OsuMapCategory } from "@/types/osumaps";
import { BotmClub } from "@/types/clubs";

const route = useRoute();

const usersStore = useUsersStore();
const osumapsStore = useOsumapsStore();
const scoresStore = useScoresStore();
const clubsStore = useClubsStore();

const { setErrorToast } = useToast();

const isLoading = ref(false);

const playerNick = computed<string>(() => `${route.params.nick}`);
const playerInfo = computed<IAllUsersListItem | null>(
  () =>
    usersStore.users.find(
      (u) => u.nick.toLowerCase() === playerNick.value.toLowerCase()
    ) ?? null
);
const avatarSrc = computed(
  () => `https://a.ppy.sh/${playerInfo.value?.osuId}?.png`
);
const playerSkillsets = computed<OsuMapCategory[]>(() => {
  return JSON.parse(playerInfo.value?.skillsets ?? "[]");
});

const playerScoresList = computed(() => {
  if (!playerInfo.value) return [];
  return scoresStore.getFlatScoresTableData([playerInfo.value.uid]);
});

const {
  isShist,
  isRedactor,
  isTrainer,
  digitIconComponent,
  isAimLead,
  isSpeedLead,
  isTechLead,
  isReadingLead,
  isHiddenLead,
  isHardrockLead,
} = useUserTags(playerInfo);
const hasSomeTags = computed(
  () =>
    isShist.value ||
    isRedactor.value ||
    isTrainer.value ||
    !!digitIconComponent.value ||
    isAimLead.value ||
    isSpeedLead.value ||
    isTechLead.value ||
    isReadingLead.value ||
    isHiddenLead.value ||
    isHardrockLead.value
);

const playerClubs = computed<BotmClub[]>(() => {
  const uid = playerInfo.value?.uid;
  if (!uid) return [];
  return Object.values(clubsStore.clubs)
    .filter((club) => club.members[uid])
    .map((club) => club.id);
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
.player-profile-page {
  &__user-data-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 20px;
  }
  &__user-info-wrapper {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    @media (max-width: $tablet-l) {
      flex-direction: column;
    }
  }
  &__avatar {
    max-width: 398px;
    width: 100%;
  }
  &__info-wrapper {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 20px;
    @include default-text(24px, 24px, var(--color-text));
    :nth-child(odd) {
      justify-self: end;
      text-align: end;
    }
    @media (max-width: $tablet-l) {
      grid-template-columns: 1fr 1fr;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__categories-wrapper {
    max-width: 600px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  &__tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    *:not(.player-profile-page__no-tags-label) {
      width: 50px;
      height: 50px;
      color: var(--color-text);
      @media (max-width: $phone-l) {
        width: 30px;
        height: 30px;
      }
    }
  }
  &__club-icon {
    width: 50px;
    height: 50px;
    @media (max-width: $phone-l) {
      width: 30px;
      height: 30px;
    }
    &_aim {
      color: var(--color-club-aim);
    }
    &_speed {
      color: var(--color-club-speed);
    }
    &_tech {
      color: var(--color-club-tech);
    }
    &_reading {
      color: var(--color-club-reading);
    }
    &_hidden {
      color: var(--color-club-hidden);
    }
    &_hardrock {
      color: var(--color-club-hardrock);
    }
  }
  &__description {
    padding: 10px;
    max-width: 600px;
    height: 92px;
    overflow: auto;
    background-color: var(--color-text-area-bg);
    white-space: pre-wrap;
    opacity: 0.9;
    border-radius: 10px;
  }
  &__divider {
    width: 100%;
  }
  &__scores-headline {
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
  &__user-not-found-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    row-gap: 20px;
  }
  &__user-not-found-headline {
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
  &__user-not-found-nick {
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
