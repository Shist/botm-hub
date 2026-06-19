<template>
  <div class="skillsets-maps-table">
    <div class="skillsets-maps-table__controls">
      <v-text-field
        v-model="searchQuery"
        variant="filled"
        prepend-inner-icon="mdi-magnify"
        label="Найти карты по любому полю"
        placeholder="Введи любое ключевое слово..."
        density="compact"
        clearable
        hide-details
        class="skillsets-maps-table__search"
      />
    </div>
    <v-skeleton-loader type="table" :loading="isLoading">
      <v-data-table-virtual
        :headers="headers"
        :items="filteredItemsForTable"
        :item-value="'idWithCategory'"
        :sort-by="defaultSortBy"
        :mobile-breakpoint="769"
        :fixed-header="true"
        hover
        hide-details
        class="skillsets-maps-table__content"
        :class="{
          'skillsets-maps-table__content_empty':
            filteredItemsForTable.length === 0,
        }"
        @click:row="onRowClick"
      >
        <template #[`item.id`]="{ item }">
          <span
            class="skillsets-maps-table__id-label"
            @click.stop="copyToClipboard(item.id)"
          >
            {{ item.id }}
          </span>
        </template>
        <template #[`item.link`]="{ item }">
          <v-tooltip text="Перейти на страницу osu!-сайта" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :href="item.link"
                target="_blank"
                icon="mdi-open-in-new"
                size="small"
                variant="text"
                color="var(--color-text)"
                @click.stop
              />
            </template>
          </v-tooltip>
        </template>
        <template #[`item.cover`]="{ item }">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <div
                v-bind="props"
                class="skillsets-maps-table__cover-wrapper"
                :class="{
                  [`skillsets-maps-table__cover-wrapper_rank-${item.bestScoreInfo?.rank}`]:
                    item.bestScoreInfo,
                }"
                @click.stop
              >
                <v-img
                  :src="`https://assets.ppy.sh/beatmaps/${item.mapsetId}/covers/cover.jpg`"
                  cover
                  height="100%"
                >
                  <template #placeholder>
                    <div class="skillsets-maps-table__cover-loader">
                      <v-progress-circular
                        indeterminate
                        size="16"
                        width="2"
                        color="var(--color-vuetify-progress)"
                      />
                    </div>
                  </template>
                  <template #error>
                    <div class="skillsets-maps-table__cover-error">
                      <span>NO BG</span>
                    </div>
                  </template>
                </v-img>
              </div>
            </template>
            <div
              v-if="item.mapUserScores?.length"
              class="skillsets-maps-table__scores-tooltip"
            >
              <span class="skillsets-maps-table__tooltip-title">
                Имеющиеся личные скоры:
              </span>
              <div
                v-for="score in item.mapUserScores"
                :key="score.mods"
                class="skillsets-maps-table__tooltip-row"
              >
                <span
                  class="skillsets-maps-table__tooltip-rank"
                  :class="`rank-${score.rank}`"
                >
                  {{ formatMapRank(score.rank) }}
                </span>
                <span class="skillsets-maps-table__tooltip-mods">{{
                  score.mods
                }}</span>
                <span class="skillsets-maps-table__tooltip-score">
                  {{ score.score.toLocaleString("ru-RU") }}
                </span>
                <span class="skillsets-maps-table__tooltip-stats">
                  {{ score.accuracy.toFixed(2) }}% | {{ score.combo }}x
                </span>
                <span class="skillsets-maps-table__tooltip-points">
                  <v-icon size="14" color="var(--color-points)">
                    mdi-bullseye-arrow
                  </v-icon>
                  {{ score.points.toFixed(2) }}
                </span>
              </div>
            </div>
            <div
              v-else
              class="skillsets-maps-table__scores-tooltip skillsets-maps-table__scores-tooltip_empty"
            >
              <span>Пока нет личных скоров</span>
            </div>
          </v-tooltip>
        </template>
        <template #[`item.category`]="{ item }">
          <CategoryBadge
            :category="item.category"
            class="skillsets-maps-table__badge"
          />
        </template>
        <template #no-data>
          <div class="skillsets-maps-table__no-data">Нет данных о картах</div>
        </template>
      </v-data-table-virtual>
    </v-skeleton-loader>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useScoresStore } from "@/stores/scores";
import useToast from "@/composables/useToast";
import CategoryBadge from "@/components/osumaps/CategoryBadge.vue";
import { CATEGORIES_SORT_PRIORITIES } from "@/constants";
import { formatMapRank } from "@/utils";
import {
  getAdjustedStarRate,
  calculateBasePoints,
  getMaxScoreForMods,
  calculateFinalCategoryPoints,
} from "@/utils/scores-calcs";
import {
  OsuMapCategory,
  type IOsuMap,
  type MapsTableHeader,
} from "@/types/osumaps";

const router = useRouter();

const authStore = useAuthStore();
const scoresStore = useScoresStore();

const props = withDefaults(
  defineProps<{
    mapsList: IOsuMap[];
    isLoading: boolean;
    defaultSort?: { key: string; order?: "asc" | "desc" }[];
  }>(),
  {
    defaultSort: () => [{ key: "starRate", order: "asc" }],
  }
);

const emit = defineEmits<{
  (e: "update:filteredCount", count: number): void;
}>();

const { setSuccessToast, setErrorToast } = useToast();

const searchQuery = ref("");

const headers = reactive<MapsTableHeader[]>([
  { key: "id", title: "ID", minWidth: "104px", align: "center" },
  {
    key: "link",
    title: "Ссылка",
    minWidth: "83px",
    sortable: false,
    align: "center",
  },
  {
    key: "cover",
    title: "Фон / Скоры",
    minWidth: "176px",
    sortable: false,
    align: "center",
  },
  {
    key: "category",
    title: "Мод",
    minWidth: "89px",
    align: "center",
    sort: (a: OsuMapCategory, b: OsuMapCategory) =>
      CATEGORIES_SORT_PRIORITIES[a] - CATEGORIES_SORT_PRIORITIES[b],
  },
  { key: "name", title: "Название", minWidth: "335px" },
  { key: "mapper", title: "Мапер", minWidth: "181px" },
  { key: "starRate", title: "Сложность", minWidth: "140px" },
  {
    key: "duration",
    title: "Длительность",
    minWidth: "164px",
    sort: (a: string, b: string) => {
      const aArr = a.split(":").reverse().map(Number);
      const bArr = b.split(":").reverse().map(Number);
      const aSeconds =
        (aArr[0] ?? 0) + (aArr[1] ?? 0) * 60 + (aArr[2] ?? 0) * 3600;
      const bSeconds =
        (bArr[0] ?? 0) + (bArr[1] ?? 0) * 60 + (bArr[2] ?? 0) * 3600;
      return aSeconds - bSeconds;
    },
  },
  { key: "bpm", title: "BPM", minWidth: "91px" },
  { key: "cs", title: "CS", minWidth: "76px" },
  { key: "ar", title: "AR", minWidth: "77px" },
  { key: "od", title: "OD", minWidth: "78px" },
  { key: "hp", title: "HP", minWidth: "78px" },
  { key: "comment", title: "Комментарий", minWidth: "190px" },
]);

const defaultSortBy = computed(() => props.defaultSort);

const filteredItemsForTable = computed(() => {
  const uid = authStore.user?.uid;
  const userScores = uid ? scoresStore.allScores[uid] : null;

  let list = props.mapsList.map((item) => {
    const mapUserScores = [];

    if (userScores && userScores[item.id]) {
      const mapScores = userScores[item.id] ?? {};

      for (const [modKey, scoreData] of Object.entries(mapScores)) {
        const rawModKey = modKey.toLowerCase();
        const modsArray =
          rawModKey === "nm"
            ? ["NM"]
            : (rawModKey.toUpperCase().match(/.{1,2}/g) ?? []);

        const maxScore = getMaxScoreForMods(modsArray);
        const percentage =
          maxScore > 0 ? (scoreData.score / maxScore) * 100 : 0;
        const adjustedStarRate = getAdjustedStarRate(
          item.starRate,
          item.category,
          modsArray
        );
        const basePoints = calculateBasePoints(percentage, adjustedStarRate);

        const finalPts = calculateFinalCategoryPoints(
          basePoints,
          item.category
        );

        mapUserScores.push({
          mods: modKey.toUpperCase() === "NM" ? "NM" : modKey.toUpperCase(),
          rank: scoreData.rank,
          score: scoreData.score,
          accuracy: scoreData.accuracy,
          combo: scoreData.combo,
          points: finalPts,
        });
      }

      mapUserScores.sort((a, b) => b.points - a.points);
    }

    return {
      idWithCategory: `${item.id}-${item.category}`,
      mapUserScores,
      bestScoreInfo: mapUserScores[0] ?? null,
      ...item,
    };
  });

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((item) => {
      return (
        String(item.id).includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.mapper.toLowerCase().includes(q) ||
        String(item.starRate).includes(q) ||
        item.duration.includes(q) ||
        String(item.bpm).includes(q) ||
        String(item.cs).includes(q) ||
        String(item.ar).includes(q) ||
        String(item.od).includes(q) ||
        String(item.hp).includes(q) ||
        (item.comment && item.comment.toLowerCase().includes(q))
      );
    });
  }

  return list;
});

watch(
  () => filteredItemsForTable.value.length,
  (newCount) => emit("update:filteredCount", newCount),
  { immediate: true }
);

const copyToClipboard = async (mapId: number) => {
  try {
    await navigator.clipboard.writeText(`${mapId}`);
    setSuccessToast("ID карты скопирован в буфер обмена");
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось скопировать ID карты: ${msg}`);
  }
};

const onRowClick = (event: MouseEvent, { item }: { item: IOsuMap }) => {
  const routeLocation = router.resolve({
    name: "map-profile",
    params: {
      category: item.category.toLowerCase(),
      mapId: item.id,
    },
  });

  if (event.ctrlKey || event.metaKey) {
    window.open(routeLocation.href, "_blank");
  } else {
    router.push(routeLocation);
  }
};
</script>

<style lang="scss" scoped>
.skillsets-maps-table {
  width: 100%;
  border: 4px solid var(--color-vuetify-table-borders);
  border-radius: 4px;
  &__controls {
    display: flex;
    align-items: center;
    background-color: var(--color-vuetify-table-borders);
  }
  &__search {
    flex-grow: 1;
  }
  &__content {
    height: 600px;
    cursor: pointer;
    &_empty {
      cursor: default;
    }
    & :deep(th) {
      vertical-align: middle;
      font-weight: bold;
    }
    & :deep(td) {
      vertical-align: middle;
    }
  }
  &__id-label {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  &__cover-wrapper {
    width: 152px;
    height: 48px;
    border: 4px solid transparent;
    border-radius: 6px;
    overflow: hidden;
    margin: 0 auto;
    transition: border-color 0.3s ease-in-out;
    cursor: help;
    @media (max-width: $tablet-l) {
      margin: 0 0 0 auto;
    }
    &_rank-X,
    &_rank-SS,
    &_rank-S {
      border-color: var(--color-rank-s-or-ss);
    }
    &_rank-XH,
    &_rank-SSH,
    &_rank-SH {
      border-color: var(--color-rank-silver-s-or-ss);
    }
    &_rank-A {
      border-color: var(--color-rank-a);
    }
    &_rank-B {
      border-color: var(--color-rank-b);
    }
    &_rank-C {
      border-color: var(--color-rank-c);
    }
    &_rank-D {
      border-color: var(--color-rank-d);
    }
    &_rank-F {
      border-color: var(--color-rank-f);
    }
    .v-img {
      border-radius: 2px;
    }
  }
  &__cover-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  &__cover-error {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background-color: rgba(128, 128, 128, 0.1);
    span {
      @include default-text(14px, 14px, var(--color-vuetify-progress));
      font-weight: bold;
      letter-spacing: 1px;
    }
  }
  &__badge {
    @media (max-width: $tablet-l) {
      float: right;
    }
  }
  &__no-data {
    padding: 40px;
    text-align: center;
    @include default-text(18px, 18px, var(--color-text));
    opacity: 0.7;
  }
  &__scores-tooltip {
    padding-block: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    &_empty {
      span {
        @include default-text(14px, 14px, inherit);
      }
    }
  }
  &__tooltip-title {
    @include default-text(14px, 14px, inherit);
  }
  &__tooltip-row {
    padding: 2px 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--color-score-tooltip-row-bg);
    font-weight: bold;
    text-align: center;
    border-radius: 6px;
    @media (max-width: $phone-l) {
      width: 250px;
      display: grid;
      grid-template-columns: min-content auto 1fr;
      grid-template-areas:
        "rank mods score"
        "rank stats points";
      row-gap: 4px;
      column-gap: 12px;
      padding: 8px 10px;
    }
  }
  &__tooltip-rank {
    font-size: 18px;
    width: 23px;
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
    &.rank-X,
    &.rank-SS,
    &.rank-S {
      color: var(--color-rank-s-or-ss);
    }
    &.rank-XH,
    &.rank-SSH,
    &.rank-SH {
      color: var(--color-rank-silver-s-or-ss);
    }
    &.rank-A {
      color: var(--color-rank-a);
    }
    &.rank-B {
      color: var(--color-rank-b);
    }
    &.rank-C {
      color: var(--color-rank-c);
    }
    &.rank-D {
      color: var(--color-rank-d);
    }
    &.rank-F {
      color: var(--color-rank-f);
    }
    @media (max-width: $phone-l) {
      grid-area: rank;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  &__tooltip-mods {
    width: 50px;
    @media (max-width: $phone-l) {
      grid-area: mods;
      width: auto;
      text-align: left;
    }
  }
  &__tooltip-score {
    width: 75px;
    @media (max-width: $phone-l) {
      grid-area: score;
      width: auto;
      text-align: right;
    }
  }
  &__tooltip-stats {
    width: 110px;
    @media (max-width: $phone-l) {
      grid-area: stats;
      width: auto;
      text-align: left;
      white-space: nowrap;
      font-size: 12px;
    }
  }
  &__tooltip-points {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 80px;
    color: var(--color-points);
    text-shadow:
      1px 1px 0 #000,
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000;
    @media (max-width: $phone-l) {
      grid-area: points;
      justify-content: flex-end;
      width: auto;
    }
  }
}
</style>
