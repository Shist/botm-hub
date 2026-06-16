<template>
  <div class="scores-table">
    <div class="scores-table__controls">
      <v-btn-toggle
        v-if="showDigitFilters"
        v-model="selectedDigitFilter"
        :color="themeColor"
        density="compact"
        mandatory
        class="scores-table__digit-toggle"
      >
        <v-btn value="all">Все</v-btn>
        <v-btn :value="DigitCategory.FOUR_DIGIT">
          4<span class="scores-table__digit-text">&nbsp;Дигиты</span>
        </v-btn>
        <v-btn :value="DigitCategory.FIVE_DIGIT">
          5<span class="scores-table__digit-text">&nbsp;Дигиты</span>
        </v-btn>
        <v-btn :value="DigitCategory.SIX_DIGIT">
          6<span class="scores-table__digit-text">&nbsp;Дигиты</span>
        </v-btn>
      </v-btn-toggle>
      <v-text-field
        v-model="searchQuery"
        variant="filled"
        prepend-inner-icon="mdi-magnify"
        label="Найти скоры по любому полю"
        placeholder="Введи любое ключевое слово..."
        density="compact"
        clearable
        hide-details
        class="scores-table__search"
      />
    </div>
    <v-skeleton-loader type="table" :loading="isLoading">
      <v-data-table-virtual
        :headers="visibleHeaders"
        :items="filteredScoresList"
        :item-value="'uidWithMapIdAndMods'"
        :mobile-breakpoint="769"
        :fixed-header="true"
        hover
        hide-details
        class="scores-table__content"
        :class="{
          'scores-table__content_empty': filteredScoresList.length === 0,
        }"
        :sort-by="defaultSortBy"
        @click:row="onRowClick"
      >
        <template #[`item.user`]="{ item }">
          <div
            class="scores-table__user-card-wrapper"
            @click.stop="goToUserProfile(item.user.nick)"
          >
            <UserCard :user="item.user" />
          </div>
        </template>
        <template #[`item.mapId`]="{ item }">
          <span
            class="scores-table__id-label"
            @click.stop="copyToClipboard(item.mapId)"
          >
            {{ item.mapId }}
          </span>
        </template>
        <template #[`item.link`]="{ item }">
          <v-tooltip text="Перейти на страницу osu!-сайта" location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                :href="`https://osu.ppy.sh/beatmapsets/${item.mapsetId}#osu/${item.mapId}`"
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
          <div class="scores-table__cover-wrapper">
            <v-img
              :src="`https://assets.ppy.sh/beatmaps/${item.mapsetId}/covers/cover.jpg`"
              cover
              height="100%"
            >
              <template #placeholder>
                <div class="scores-table__cover-loader">
                  <v-progress-circular
                    indeterminate
                    size="16"
                    width="2"
                    color="var(--color-vuetify-progress)"
                  />
                </div>
              </template>
              <template #error>
                <div class="scores-table__cover-error">
                  <span>NO BG</span>
                </div>
              </template>
            </v-img>
          </div>
        </template>
        <template #[`item.mods`]="{ item }">
          <v-chip
            size="small"
            :color="getModsChipColor(item.mods)"
            variant="elevated"
            class="scores-table__mods-chip"
          >
            {{ item.mods.toUpperCase() }}
          </v-chip>
        </template>
        <template #[`item.maxSr`]="{ item }">
          <div class="scores-table__sr-cell">
            <template
              v-if="item.validSrInfo.length === 1 && item.validSrInfo[0]"
            >
              <div class="scores-table__sr-single">
                <CategoryBadge :category="item.validSrInfo[0].category" />
                <div class="scores-table__sr-wrapper">
                  <span class="scores-table__sr-text">
                    {{ item.validSrInfo[0].sr.toFixed(2) }}⭐
                  </span>
                  <v-tooltip
                    v-if="item.validSrInfo[0].isFmTb"
                    text="SR базовой карты (без учёта модов)"
                    location="top"
                  >
                    <template #activator="{ props }">
                      <v-icon
                        v-bind="props"
                        size="16"
                        color="var(--color-text-gray)"
                        class="scores-table__sr-info-icon"
                        @click.stop
                      >
                        mdi-information-outline
                      </v-icon>
                    </template>
                  </v-tooltip>
                </div>
              </div>
            </template>
            <template v-else-if="item.validSrInfo.length > 1">
              <v-tooltip
                location="top"
                content-class="scores-table__tooltip-bg"
              >
                <template #activator="{ props }">
                  <div
                    v-bind="props"
                    class="scores-table__sr-mixed"
                    @click.stop
                  >
                    <v-icon
                      size="20"
                      color="var(--color-table-score-sr-mixed-icon)"
                    >
                      mdi-star-circle-outline
                    </v-icon>
                    <span class="scores-table__sr-text">
                      {{ item.maxSr.toFixed(2) }}⭐
                    </span>
                  </div>
                </template>
                <div class="scores-table__sr-tooltip">
                  <span class="scores-table__sr-tooltip-title">
                    Подходящие категории:
                  </span>
                  <div
                    v-for="info in item.validSrInfo"
                    :key="info.category"
                    class="scores-table__sr-tooltip-row"
                  >
                    <CategoryBadge :category="info.category" />
                    <div class="scores-table__sr-tooltip-sr-wrapper">
                      <span> {{ info.sr.toFixed(2) }}⭐ </span>
                      <span
                        v-if="info.isFmTb"
                        class="scores-table__sr-tooltip-nm"
                      >
                        (NM)
                      </span>
                    </div>
                  </div>
                </div>
              </v-tooltip>
            </template>
            <span v-else>—</span>
          </div>
        </template>
        <template #[`item.date`]="{ item }">
          <div class="scores-table__date-wrapper">
            <span class="scores-table__date">
              {{ formatDate(item.date) }}
            </span>
            <span class="scores-table__time">
              {{ formatTime(item.date) }}
            </span>
          </div>
        </template>
        <template #[`item.rank`]="{ item }">
          <span class="scores-table__rank" :class="`rank-${item.rank}`">
            {{ formatMapRank(item.rank) }}
          </span>
        </template>
        <template #[`item.score`]="{ item }">
          <div class="scores-table__score-wrapper">
            <v-tooltip location="top" content-class="scores-table__tooltip-bg">
              <template #activator="{ props }">
                <span
                  v-bind="props"
                  class="scores-table__score scores-table__score-hoverable"
                  @click.stop
                >
                  {{ item.score.toLocaleString("ru-RU") }}
                </span>
              </template>
              <div class="scores-table__sr-tooltip">
                <div class="scores-table__sr-tooltip-row">
                  <span>
                    <b>{{ item.percentage.toFixed(2) }}%</b> от максимума
                  </span>
                </div>
                <span
                  v-if="item.modsArray.includes('EZ')"
                  class="scores-table__sr-tooltip-ez"
                >
                  (с учётом баффа x1.8 для EZ)
                </span>
              </div>
            </v-tooltip>
          </div>
        </template>
        <template #[`item.accuracy`]="{ item }">
          <span>{{ item.accuracy.toFixed(2) }}%</span>
        </template>
        <template #[`item.combo`]="{ item }">
          <span>{{ item.combo }}x</span>
        </template>
        <template #[`item.points`]="{ item }">
          <div class="scores-table__sr-cell">
            <template
              v-if="item.validSrInfo.length === 1 && item.validSrInfo[0]"
            >
              <span class="scores-table__points">
                {{ item.validSrInfo[0].finalPoints.toFixed(2) }}
              </span>
            </template>
            <template v-else-if="item.validSrInfo.length > 1">
              <v-tooltip
                location="top"
                content-class="scores-table__tooltip-bg"
              >
                <template #activator="{ props }">
                  <div
                    v-bind="props"
                    class="scores-table__sr-mixed"
                    @click.stop
                  >
                    <v-icon size="20" color="var(--color-points)">
                      mdi-bullseye-arrow
                    </v-icon>
                    <span class="scores-table__points">
                      {{ item.points.toFixed(2) }}
                    </span>
                  </div>
                </template>
                <div class="scores-table__sr-tooltip">
                  <span class="scores-table__sr-tooltip-title">
                    Очки по категориям:
                  </span>
                  <div
                    v-for="info in item.validSrInfo"
                    :key="info.category"
                    class="scores-table__sr-tooltip-row"
                  >
                    <CategoryBadge :category="info.category" />
                    <div class="scores-table__sr-tooltip-sr-wrapper">
                      <span
                        class="scores-table__points scores-table__points_outlined"
                      >
                        {{ info.finalPoints.toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </div>
              </v-tooltip>
            </template>
            <span v-else>—</span>
          </div>
        </template>
        <template #no-data>
          <div class="scores-table__no-data">Нет данных о скорах</div>
        </template>
      </v-data-table-virtual>
    </v-skeleton-loader>
    <AppModal
      :isOpened="isCategoryModalOpen"
      title="Выбор Скиллсета"
      maxWidth="450px"
      :isClosableByClickOutside="true"
      @closeModal="isCategoryModalOpen = false"
    >
      <div class="scores-table__category-modal">
        <p class="scores-table__category-desc">
          Эта карта присутствует в нескольких скиллсетах! Выбери, на страницу
          какого именно скиллсета ты хочешь перейти:
        </p>
        <div class="scores-table__category-actions">
          <div
            v-for="category in selectedMapCategories"
            :key="category"
            class="scores-table__category-btn-wrapper"
            @click="onCategorySelected($event, category)"
          >
            <CategoryBadge :category="category" />
          </div>
        </div>
      </div>
      <template #actions>
        <v-btn
          class="scores-table__category-cancel"
          height="50"
          @click="isCategoryModalOpen = false"
        >
          Отмена
        </v-btn>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useOsumapsStore } from "@/stores/osumaps";
import useToast from "@/composables/useToast";
import UserCard from "@/components/users/UserCard.vue";
import CategoryBadge from "@/components/osumaps/CategoryBadge.vue";
import { formatMapRank, isValidModCombinationForCategory } from "@/utils";
import { calculateFinalCategoryPoints } from "@/utils/scores-calcs";
import { DigitCategory } from "@/types/users";
import { OsuMapCategory } from "@/types/osumaps";
import { type ScoresTableHeader, type IScoreTableRow } from "@/types/scores";

const router = useRouter();
const mapsStore = useOsumapsStore();

const props = withDefaults(
  defineProps<{
    scoresList: IScoreTableRow[];
    isLoading: boolean;
    targetCategory?: OsuMapCategory | null;
    hiddenColumns?: string[];
    themeColor?: string;
    defaultSort?: { key: string; order?: "asc" | "desc" }[];
    showDigitFilters?: boolean;
  }>(),
  {
    targetCategory: null,
    hiddenColumns: () => [],
    themeColor: "var(--global-bg-base)",
    defaultSort: () => [{ key: "points", order: "desc" }],
    showDigitFilters: false,
  }
);

const emit = defineEmits<{
  (e: "update:filteredCount", count: number): void;
}>();

const { setSuccessToast, setErrorToast } = useToast();

const searchQuery = ref("");
const isCategoryModalOpen = ref(false);
const selectedMapCategories = ref<OsuMapCategory[]>([]);
const pendingMapId = ref<number | null>(null);
const isPendingNewTab = ref(false);

const selectedDigitFilter = ref<"all" | DigitCategory>("all");

const allHeaders = reactive<ScoresTableHeader[]>([
  {
    key: "user",
    title: "Игрок",
    minWidth: "300px",
    sort: (a: { nick?: string }, b: { nick?: string }) => {
      const nickA = a?.nick ?? "";
      const nickB = b?.nick ?? "";
      return nickA.localeCompare(nickB);
    },
  },
  {
    key: "mapId",
    title: "ID Карты",
    minWidth: "111px",
    align: "center",
  },
  {
    key: "link",
    title: "Ссылка",
    minWidth: "83px",
    sortable: false,
    align: "center",
  },
  {
    key: "cover",
    title: "Фон",
    minWidth: "194px",
    sortable: false,
    align: "center",
  },
  {
    key: "mapName",
    title: "Название карты",
    minWidth: "322px",
  },
  {
    key: "mods",
    title: "Моды",
    minWidth: "96px",
    align: "center",
  },
  {
    key: "maxSr",
    title: "Скиллсет / SR",
    minWidth: "154px",
    align: "center",
  },
  {
    key: "points",
    title: "Очки",
    minWidth: "129px",
    align: "center",
  },
  {
    key: "score",
    title: "Скор",
    minWidth: "114px",
    align: "center",
  },
  {
    key: "accuracy",
    title: "Акка",
    minWidth: "86px",
    align: "center",
  },
  {
    key: "combo",
    title: "Комбо",
    minWidth: "96px",
    align: "center",
  },
  {
    key: "rank",
    title: "Ранг",
    minWidth: "84px",
    align: "center",
    sort: (a: string, b: string) => {
      const rankWeights: Record<string, number> = {
        XH: 8,
        SSH: 8,
        X: 7,
        SS: 7,
        SH: 6,
        S: 5,
        A: 4,
        B: 3,
        C: 2,
        D: 1,
        F: 0,
      };
      const weightA = rankWeights[a.toUpperCase()] ?? 0;
      const weightB = rankWeights[b.toUpperCase()] ?? 0;
      return weightA - weightB;
    },
  },
  {
    key: "date",
    title: "Дата",
    minWidth: "103px",
    align: "center",
    sort: (a: Date, b: Date) => a.getTime() - b.getTime(),
  },
]);

const defaultSortBy = computed(() => props.defaultSort);

const visibleHeaders = computed(() => {
  return allHeaders.filter(
    (header) => !props.hiddenColumns.includes(header.key)
  );
});

const enrichedScoresList = computed(() => {
  const allMaps = mapsStore.getMapsOfGivenCategories(
    Object.values(OsuMapCategory)
  );

  return props.scoresList.map((score) => {
    const modsArray =
      score.mods === "nm"
        ? ["NM"]
        : (score.mods.toUpperCase().match(/.{1,2}/g) ?? []);

    const validDbMaps = allMaps.filter(
      (m) =>
        m.id === score.mapId &&
        isValidModCombinationForCategory(modsArray, m.category) &&
        (!props.targetCategory || m.category === props.targetCategory)
    );

    const validSrInfo = validDbMaps
      .map((m) => {
        const categoryUpper = m.category.toUpperCase();
        const basePts = calculateFinalCategoryPoints(
          score.basePoints,
          m.category,
          modsArray
        );

        return {
          category: m.category,
          sr: m.starRate,
          isFmTb: categoryUpper.startsWith("FM") || categoryUpper === "TB",
          finalPoints: basePts,
        };
      })
      .sort((a, b) => b.finalPoints - a.finalPoints);

    const maxSr =
      validSrInfo.length > 0 ? Math.max(...validSrInfo.map((i) => i.sr)) : 0;
    const maxPoints =
      validSrInfo.length > 0 ? (validSrInfo[0]?.finalPoints ?? 0) : 0;

    return {
      ...score,
      points: maxPoints,
      modsArray,
      validSrInfo,
      maxSr,
    };
  });
});

const filteredScoresList = computed(() => {
  let list = enrichedScoresList.value;

  if (props.showDigitFilters && selectedDigitFilter.value !== "all") {
    list = list.filter(
      (score) => score.user.digitCategory === selectedDigitFilter.value
    );
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter((row) => {
      const matchesCategoryOrSrOrPoints = row.validSrInfo?.some(
        (info) =>
          info.category.toLowerCase().includes(q) ||
          info.sr.toFixed(2).includes(q) ||
          info.finalPoints.toFixed(2).includes(q)
      );

      return (
        matchesCategoryOrSrOrPoints ||
        row.user.nick.toLowerCase().includes(q) ||
        row.mapName.toLowerCase().includes(q) ||
        row.mods.toLowerCase().includes(q) ||
        row.rank.toLowerCase().includes(q) ||
        String(row.mapId).includes(q) ||
        String(row.combo).includes(q) ||
        row.points.toFixed(2).includes(q) ||
        row.accuracy.toFixed(2).includes(q) ||
        `${row.score}`.includes(q) ||
        formatDate(row.date).includes(q) ||
        formatTime(row.date).includes(q)
      );
    });
  }

  return list;
});

const formatDate = (date: Date) => {
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
const formatTime = (date: Date) => {
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const getModsChipColor = (mods: string): string => {
  const m = mods.toUpperCase();
  if (m.includes("DT")) return "var(--color-mod-combination-dt)";
  if (m.includes("FL")) return "var(--color-mod-combination-fl)";
  if (m.includes("HR")) return "var(--color-mod-combination-hr)";
  if (m.includes("HD")) return "var(--color-mod-combination-hd)";
  if (m.includes("EZ")) return "var(--color-mod-combination-ez)";
  return "var(--color-mod-combination-nm)";
};

const copyToClipboard = async (mapId: number) => {
  try {
    await navigator.clipboard.writeText(`${mapId}`);
    setSuccessToast("ID карты скопирован в буфер обмена");
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось скопировать ID карты: ${msg}`);
  }
};

const goToUserProfile = (nick: string) => {
  router.push({ name: "player-profile", params: { nick: nick } });
};

const navigateToMapProfile = (
  category: OsuMapCategory,
  mapId: number,
  newTab: boolean
) => {
  const routeLocation = router.resolve({
    name: "map-profile",
    params: {
      category: category.toLowerCase(),
      mapId: mapId,
    },
  });

  if (newTab) {
    window.open(routeLocation.href, "_blank");
  } else {
    router.push(routeLocation);
  }
  isCategoryModalOpen.value = false;
};

const onRowClick = (event: MouseEvent, { item }: { item: IScoreTableRow }) => {
  const isNewTab = event.ctrlKey || event.metaKey;

  if (item.mapCategories.length > 1 && !props.targetCategory) {
    selectedMapCategories.value = item.mapCategories;
    pendingMapId.value = item.mapId;
    isPendingNewTab.value = isNewTab;
    isCategoryModalOpen.value = true;
  } else {
    const target = props.targetCategory || item.mapCategories[0];
    if (target) navigateToMapProfile(target, item.mapId, isNewTab);
  }
};

const onCategorySelected = (event: MouseEvent, category: OsuMapCategory) => {
  if (pendingMapId.value !== null) {
    const isNewTab =
      event.ctrlKey ||
      event.metaKey ||
      event.button === 1 ||
      isPendingNewTab.value;
    navigateToMapProfile(category, pendingMapId.value, isNewTab);
  }
};

watch(
  () => filteredScoresList.value.length,
  (newCount) => emit("update:filteredCount", newCount),
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.scores-table {
  width: 100%;
  border: 4px solid var(--color-vuetify-table-borders);
  border-radius: 4px;
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
  &__controls {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: var(--color-vuetify-table-borders);
    @media (max-width: $tablet-l) {
      flex-direction: column;
      align-items: stretch;
    }
  }
  &__digit-toggle {
    padding-inline: 2px;
    @media (max-width: $tablet-l) {
      padding-inline: 0;
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
    flex-grow: 1;
  }
  &__id-label {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  &__user-card-wrapper {
    padding-block: 4px;
  }
  &__cover-wrapper {
    width: 162px;
    height: 45px;
    border-radius: 4px;
    overflow: hidden;
    margin: 0 auto;
    @media (max-width: $tablet-l) {
      margin: 0 0 0 auto;
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
  &__mods-chip {
    font-weight: bold;
    color: var(--color-text-white);
  }
  &__sr-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    @media (max-width: $tablet-l) {
      justify-content: flex-end;
    }
  }
  &__sr-single {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  &__sr-wrapper {
    display: flex;
    align-items: center;
  }
  &__sr-text {
    font-weight: bold;
    color: var(--color-text);
    white-space: nowrap;
  }
  &__sr-info-icon {
    margin-bottom: 1px;
    cursor: help;
    opacity: 0.7;
    &:hover {
      opacity: 1;
    }
  }
  &__sr-mixed {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: help;
    padding: 8px;
    border-radius: 10px;
    background-color: var(--color-table-score-sr-mixed-bg);
    transition: background-color 0.3s;
    &:hover {
      background-color: var(--color-table-score-sr-mixed-bg-hover);
    }
  }
  &__sr-tooltip {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 4px;
  }
  &__sr-tooltip-title {
    @include default-text(14px, 14px, inherit);
  }
  &__sr-tooltip-row {
    @include default-text(14px, 14px, inherit);
    display: flex;
    align-items: center;
    gap: 5px;
    b {
      font-weight: bold;
    }
  }
  &__sr-tooltip-sr-wrapper {
    display: flex;
    align-items: center;
    font-weight: bold;
  }
  &__sr-tooltip-nm {
    margin-bottom: 1px;
    font-size: 11px;
    opacity: 0.9;
    font-weight: normal;
  }
  &__sr-tooltip-ez {
    font-size: 12px;
    opacity: 0.9;
    font-weight: normal;
  }
  &__tooltip-bg {
    background-color: var(--color-bg);
    border: 1px solid var(--color-vuetify-table-borders);
  }
  &__date-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    @media (max-width: $tablet-l) {
      align-items: end;
    }
  }
  &__date {
    color: var(--color-text);
    font-size: 14px;
  }
  &__time {
    color: var(--color-text-gray);
    font-size: 12px;
  }
  &__score-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    @media (max-width: $tablet-l) {
      justify-content: flex-end;
    }
  }
  &__score {
    font-weight: bold;
  }
  &__score-hoverable {
    cursor: help;
    border-bottom: 1px dashed var(--color-hoverable-bottom-border);
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.8;
    }
  }
  &__points {
    color: var(--color-points);
    font-weight: bold;
    &_outlined {
      text-shadow:
        1px 1px 0 #000000,
        -1px -1px 0 #000000,
        1px -1px 0 #000000,
        -1px 1px 0 #000000;
    }
  }
  &__no-data {
    padding: 40px;
    text-align: center;
    @include default-text(18px, 18px, var(--color-text));
    opacity: 0.7;
  }
  &__rank {
    font-size: 20px;
    font-weight: bold;
    text-shadow: 1px 1px 1px var(--color-rank-shadow-rgba);
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
  }
  &__category-modal {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 10px 0;
  }
  &__category-desc {
    @include default-text(16px, 20px, var(--color-text));
    text-align: center;
  }
  &__category-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    width: 100%;
  }
  &__category-btn-wrapper {
    cursor: pointer;
    transition: filter 0.3s;
    &:hover {
      filter: brightness(1.1);
    }
  }
  &__category-cancel {
    @include default-btn(
      100%,
      var(--color-text-white),
      var(--color-btn-cancel-bg),
      0
    );
  }
}
</style>
