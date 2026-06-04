<template>
  <div class="skillset-maps-page">
    <template v-if="currentCategory">
      <h2 class="skillset-maps-page__headline">
        Мапы {{ categoryTitle }}
        <span v-if="!isLoading" class="skillset-maps-page__count">
          ({{ categoryMapsList.length }})
        </span>
        <v-progress-circular
          v-else
          indeterminate
          size="16"
          width="2"
          color="currentColor"
        />
      </h2>
      <SkillsetsMapsTable :mapsList="categoryMapsList" :isLoading="isLoading" />
    </template>
    <div v-else class="skillset-maps-page__not-found-wrapper">
      <h2 class="skillset-maps-page__not-found-headline">
        Указанная категория скиллсета не существует
      </h2>
      <span class="skillset-maps-page__not-found-id">
        Категория: {{ route.params.category }}
      </span>
      <router-link to="/" class="skillset-maps-page__link-to-main">
        Назад на главную страницу
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useOsumapsStore } from "@/stores/osumaps";
import SkillsetsMapsTable from "@/components/osumaps/SkillsetsMapsTable.vue";
import useToast from "@/composables/useToast";
import { MAPS_CATEGORIES } from "@/constants";
import { OsuMapCategory } from "@/types/osumaps";

const route = useRoute();

const mapsStore = useOsumapsStore();

const { setErrorToast } = useToast();

const currentCategory = computed<OsuMapCategory | null>(() => {
  const paramCategory = String(route.params.category).toLowerCase();

  const validCategory = Object.values(OsuMapCategory).find(
    (enumVal) => enumVal.toLowerCase() === paramCategory
  );

  return validCategory ?? null;
});

const categoryTitle = computed(() => {
  return currentCategory.value ? MAPS_CATEGORIES[currentCategory.value] : "";
});

const categoryMapsList = computed(() => {
  if (!currentCategory.value) return [];
  return mapsStore.osumaps[currentCategory.value] ?? [];
});

const isLoading = computed(() => mapsStore.isLoading);

onMounted(async () => {
  try {
    await mapsStore.loadAllMaps();
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось загрузить карты для пула: ${msg}`);
  }
});
</script>

<style lang="scss" scoped>
.skillset-maps-page {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  &__headline {
    @include default-headline(28px, 28px, var(--color-text));
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  &__count {
    @include default-text(24px, 24px, var(--color-text));
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
