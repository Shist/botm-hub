<template>
  <div class="player-by-uid-page">
    <v-skeleton-loader type="image, paragraph" :loading="isLoading">
      <div v-if="playerInfo" class="player-by-uid-page__user-info-wrapper">
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
              class="player-by-uid-page__avatar"
            />
          </template>
        </v-tooltip>
        <div class="player-by-uid-page__info-wrapper">
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
          <div class="player-by-uid-page__categories-wrapper">
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
          <div class="player-by-uid-page__tags-wrapper">
            <IconAdmin v-if="isShist" />
            <IconTrainer v-if="isTrainer" />
            <component :is="digitIconComponent" />
            <span v-if="!hasSomeTags" class="player-by-uid-page__no-tags-label">
              (пока нет)
            </span>
          </div>
        </div>
      </div>
      <div v-else class="player-by-uid-page__user-not-found-wrapper">
        <h2 class="player-by-uid-page__user-not-found-headline">
          Игрок с указанным UID не найден
        </h2>
        <span class="player-by-uid-page__user-not-found-uid">
          UID: {{ playerUid }}
        </span>
        <router-link to="/" class="player-by-uid-page__link-to-main">
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
import useUserTags from "@/composables/useUserTags";
import useToast from "@/composables/useToast";
import CategoryBadge from "@/components/CategoryBadge.vue";
import IconAdmin from "@/components/user-card/IconAdmin.vue";
import IconTrainer from "@/components/user-card/IconTrainer.vue";
import { OsuMapCategory, type IAllUsersListItem } from "@/types";

const route = useRoute();

const usersStore = useUsersStore();

const { setErrorToast } = useToast();

const isLoading = ref(false);

const playerUid = computed<string>(() => `${route.params.uid}`);
const playerInfo = computed<IAllUsersListItem | null>(() => {
  return usersStore.users.find((u) => u.uid === playerUid.value) ?? null;
});
const avatarSrc = computed(
  () => `https://a.ppy.sh/${playerInfo.value?.osuId}?.png`
);
const playerSkillsets = computed<OsuMapCategory[]>(() => {
  return JSON.parse(playerInfo.value?.skillsets ?? "");
});

const { isShist, digitIconComponent, isTrainer } = useUserTags(playerInfo);
const hasSomeTags = computed(
  () => isShist.value || !!digitIconComponent.value || isTrainer.value
);

onMounted(async () => {
  try {
    isLoading.value = true;
    await usersStore.getAllUsers();
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось загрузить список игроков: ${msg}`);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.player-by-uid-page {
  &__user-info-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 20px;
  }
  &__avatar {
    max-width: 320px;
    width: 100%;
  }
  &__info-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    @include default-text(24px, 24px, var(--color-text));
    :nth-child(odd) {
      justify-self: end;
      text-align: end;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__categories-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  &__tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    *:not(.player-by-uid-page__no-tags-label) {
      width: 50px;
      height: 50px;
      color: var(--color-text);
      @media (max-width: $phone-l) {
        width: 30px;
        height: 30px;
      }
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
  &__user-not-found-uid {
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
