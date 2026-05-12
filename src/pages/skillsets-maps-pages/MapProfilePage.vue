<template>
  <div class="map-profile-page">
    <v-skeleton-loader type="image, paragraph" :loading="isLoading">
      <div v-if="routeCategory && mapInfo" class="map-profile-page__content">
        <div class="map-profile-page__banner-wrapper">
          <v-img
            v-if="mapInfo.mapsetId"
            :src="`https://assets.ppy.sh/beatmaps/${mapInfo.mapsetId}/covers/cover@2x.jpg`"
            class="map-profile-page__banner"
            cover
          >
            <template #placeholder>
              <div class="map-profile-page__banner-loader">
                <v-progress-circular
                  indeterminate
                  size="40"
                  width="4"
                  color="var(--color-vuetify-progress)"
                />
              </div>
            </template>
            <template #error>
              <div class="map-profile-page__banner-error">
                <span>NO BG</span>
              </div>
            </template>
          </v-img>
        </div>
        <h2 class="map-profile-page__headline">{{ mapInfo.name }}</h2>
        <div class="map-profile-page__info-wrapper">
          <span>Категория:</span>
          <div class="map-profile-page__align-left">
            <CategoryBadge :category="mapInfo.category" />
          </div>
          <span>Маппер:</span>
          <span>{{ mapInfo.mapper }}</span>
          <span>Сложность:</span>
          <span>{{ mapInfo.starRate }} ⭐</span>
          <span>Длительность:</span>
          <span>{{ mapInfo.duration }}</span>
          <span>BPM:</span>
          <span>{{ mapInfo.bpm }}</span>
          <span class="map-profile-page__map-stats-label"
            >CS / AR / OD / HP:</span
          >
          <span
            >{{ mapInfo.cs }} / {{ mapInfo.ar }} / {{ mapInfo.od }} /
            {{ mapInfo.hp }}</span
          >
          <span>Комментарий:</span>
          <span>
            {{ mapInfo.comment || "(нет комментария)" }}
          </span>
          <span>Ссылка:</span>
          <div class="map-profile-page__align-left">
            <v-tooltip text="Перейти на страницу osu!-сайта" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :href="mapInfo.link"
                  target="_blank"
                  icon="mdi-open-in-new"
                  size="small"
                  variant="text"
                  color="var(--color-text)"
                />
              </template>
            </v-tooltip>
          </div>
        </div>
      </div>
      <div
        v-else-if="routeCategory && !mapInfo"
        class="map-profile-page__not-found-wrapper"
      >
        <h2 class="map-profile-page__not-found-headline">
          Карта с указанным ID не найдена в категории
          {{ routeCategory.toUpperCase() }}
        </h2>
        <span class="map-profile-page__not-found-id">
          ID: {{ routeMapId }}
        </span>
        <router-link to="/" class="map-profile-page__link-to-main">
          Назад на главную страницу
        </router-link>
      </div>
      <div v-else class="map-profile-page__not-found-wrapper">
        <h2 class="map-profile-page__not-found-headline">
          Указанная категория скиллсета не существует
        </h2>
        <span class="map-profile-page__not-found-id">
          Категория: {{ route.params.category }}
        </span>
        <router-link to="/" class="map-profile-page__link-to-main">
          Назад на главную страницу
        </router-link>
      </div>
    </v-skeleton-loader>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import CategoryBadge from "@/components/osumaps/CategoryBadge.vue";
import useToast from "@/composables/useToast";
import { useMapsStore } from "@/stores/maps";
import {
  type IOsuMap,
  OsuMapCategory,
  isMapCategoryKey,
} from "@/types/osumaps";

const route = useRoute();

const mapsStore = useMapsStore();

const { setErrorToast } = useToast();

const isLoading = ref(false);

const routeMapId = computed(() => Number(route.params.mapId));

const routeCategory = computed<OsuMapCategory | null>(() => {
  const category = String(route.params.category).toLowerCase();
  return isMapCategoryKey(category) ? (category as OsuMapCategory) : null;
});

const mapInfo = computed<IOsuMap | null>(() => {
  if (!routeCategory.value) return null;
  const categoryMaps = mapsStore.getMapsOfGivenCategories([
    routeCategory.value,
  ]);
  return categoryMaps.find((m) => m.id === routeMapId.value) ?? null;
});

onMounted(async () => {
  if (!routeCategory.value) return;

  try {
    isLoading.value = true;
    await mapsStore.loadMapsByCategory(routeCategory.value);
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось загрузить данные карты: ${msg}`);
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.map-profile-page {
  padding: 10px;
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 20px;
  }
  &__banner-wrapper {
    width: 100%;
    max-width: 900px;
    height: 250px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    @media (max-width: $tablet-l) {
      height: 180px;
    }
    @media (max-width: $phone-l) {
      height: 120px;
    }
  }
  &__banner {
    width: 100%;
    height: 100%;
  }
  &__banner-loader {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: rgba(128, 128, 128, 0.1);
  }
  &__banner-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgba(128, 128, 128, 0.1);
    span {
      @include default-headline(48px, 48px, var(--color-vuetify-progress));
      letter-spacing: 4px;
      @media (max-width: $phone-l) {
        font-size: 28px;
        line-height: 28px;
        letter-spacing: 2px;
      }
    }
  }
  &__headline {
    @include default-headline(32px, 32px, var(--color-text));
    text-align: center;
    @media (max-width: $phone-l) {
      font-size: 24px;
      line-height: 24px;
    }
  }
  &__info-wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 20px;
    width: 100%;
    max-width: 700px;
    @include default-text(20px, 20px, var(--color-text));
    :nth-child(odd) {
      justify-self: end;
      text-align: end;
    }
    @media (max-width: $phone-l) {
      font-size: 16px;
      line-height: 16px;
    }
  }
  &__align-left {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
  }
  &__map-stats-label {
    @media (max-width: $phone-m) {
      font-size: 14px;
      line-height: 14px;
    }
  }
  &__link {
    color: var(--color-link-active);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
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
