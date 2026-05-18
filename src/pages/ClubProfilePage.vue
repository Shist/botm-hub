<template>
  <div class="club-profile-page">
    <v-skeleton-loader type="image, article" :loading="isLoading">
      <div v-if="isValidClub && clubData" class="club-profile-page__content">
        <h2
          class="club-profile-page__headline"
          :style="{ color: `var(--color-club-${normalizedClubId})` }"
        >
          {{ clubTitle }}
        </h2>
        <p>Здесь скоро будут данные клуба...</p>
      </div>
      <div v-else-if="!isValidClub" class="club-profile-page__not-found">
        <h2 class="club-profile-page__not-found-headline">
          Такого клуба не существует
        </h2>
        <span class="club-profile-page__not-found-text">
          ID клуба: {{ displayClubId }}
        </span>
        <router-link to="/" class="club-profile-page__link-to-main">
          Назад на главную страницу
        </router-link>
      </div>
    </v-skeleton-loader>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useClubsStore } from "@/stores/clubs";
import { isBotmClub } from "@/types/clubs";
import useToast from "@/composables/useToast";

const route = useRoute();

const clubsStore = useClubsStore();

const { setErrorToast } = useToast();

const isLoading = ref(false);

const displayClubId = computed(() => String(route.params.clubId));
const normalizedClubId = computed(() => displayClubId.value.toLowerCase());
const isValidClub = computed(() => isBotmClub(normalizedClubId.value));

const clubTitle = computed(() => {
  if (!isValidClub.value) return "";
  const name = `${normalizedClubId.value[0]?.toUpperCase()}${normalizedClubId.value.slice(1)}`;
  return `${name} Club`;
});

const clubData = computed(() => {
  if (!isBotmClub(normalizedClubId.value)) return null;
  return clubsStore.clubs[normalizedClubId.value].data;
});

onMounted(async () => {
  if (!isBotmClub(normalizedClubId.value)) return;

  try {
    isLoading.value = true;
    await clubsStore.loadClubById(normalizedClubId.value);
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось загрузить данные клуба: ${msg}`);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.club-profile-page {
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 20px;
  }
  &__headline {
    @include default-headline(44px, 44px, var(--color-text));
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 2px;
    @media (max-width: $tablet-l) {
      font-size: 32px;
      line-height: 32px;
    }
    @media (max-width: $phone-l) {
      font-size: 24px;
      line-height: 24px;
    }
  }
  &__not-found {
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
  &__not-found-text {
    @include default-text(36px, 36px, var(--color-text));
    @media (max-width: $tablet-l) {
      font-size: 20px;
      line-height: 20px;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
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
