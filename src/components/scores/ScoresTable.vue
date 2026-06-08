<template>
  <div class="scores-table">
    <v-text-field
      v-model="searchQuery"
      variant="solo-filled"
      prepend-inner-icon="mdi-magnify"
      label="Найти скоры по любому полю"
      placeholder="Введи любое ключевое слово любого поля"
      clearable
      hide-details
    />
    <v-skeleton-loader type="table" :loading="isLoading">
      <v-data-table-virtual
        :headers="visibleHeaders"
        :items="enrichedScoresList"
        :item-value="'uidWithMapIdAndMods'"
        :search="searchQuery"
        :custom-filter="customFilter"
        :mobile-breakpoint="769"
        :fixed-header="true"
        hover
        hide-details
        class="scores-table__content"
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
          <span class="scores-table__score">
            {{ item.score.toLocaleString("ru-RU") }}
          </span>
        </template>
        <template #[`item.accuracy`]="{ item }">
          <span>{{ item.accuracy.toFixed(2) }}%</span>
        </template>
        <template #[`item.combo`]="{ item }">
          <span>{{ item.combo }}x</span>
        </template>
        <template #[`item.points`]="{ item }">
          <span class="scores-table__points">
            {{ item.points.toFixed(2) }}
          </span>
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
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useOsumapsStore } from "@/stores/osumaps";
import useToast from "@/composables/useToast";
import UserCard from "@/components/users/UserCard.vue";
import CategoryBadge from "@/components/osumaps/CategoryBadge.vue";
import { formatMapRank, isValidModCombinationForCategory } from "@/utils";
import { OsuMapCategory } from "@/types/osumaps";
import { type IScoreTableRow } from "@/types/scores";

type DataTableHeader = {
  key: string;
  title: string;
  minWidth?: string;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  sort?:
    | ((a: number, b: number) => number)
    | ((a: string, b: string) => number)
    | ((a: Date, b: Date) => number)
    | ((a: { nick: string }, b: { nick: string }) => number);
};

const router = useRouter();

const mapsStore = useOsumapsStore();

const props = withDefaults(
  defineProps<{
    scoresList: IScoreTableRow[];
    isLoading: boolean;
    hiddenColumns?: string[];
    defaultSort?: { key: string; order?: "asc" | "desc" }[];
  }>(),
  {
    hiddenColumns: () => [],
    defaultSort: () => [{ key: "points", order: "desc" }],
  }
);

const { setSuccessToast, setErrorToast } = useToast();

const searchQuery = ref("");
const isCategoryModalOpen = ref(false);
const selectedMapCategories = ref<OsuMapCategory[]>([]);
const pendingMapId = ref<number | null>(null);
const isPendingNewTab = ref(false);

const allHeaders = reactive<DataTableHeader[]>([
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
    minWidth: "335px",
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
    minWidth: "100px",
    align: "center",
  },
  {
    key: "score",
    title: "Скор",
    minWidth: "96px",
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
    const validDbMaps = allMaps.filter(
      (m) =>
        m.id === score.mapId &&
        isValidModCombinationForCategory([score.mods], m.category)
    );

    const validSrInfo = validDbMaps
      .map((m) => {
        const catUpper = m.category.toUpperCase();
        return {
          category: m.category,
          sr: m.starRate,
          isFmTb: catUpper.startsWith("FM") || catUpper === "TB",
        };
      })
      .sort((a, b) => b.sr - a.sr);

    const maxSr = validSrInfo.length > 0 ? (validSrInfo[0]?.sr ?? 0) : 0;

    return {
      ...score,
      validSrInfo,
      maxSr,
    };
  });
});

const customFilter = (
  _: unknown,
  query: string,
  item?: {
    raw: IScoreTableRow & {
      validSrInfo?: { category: string; sr: number }[];
      maxSr?: number;
    };
  }
) => {
  if (!query || !item) return true;

  const q = query.toLowerCase();
  const row = item.raw;

  const matchesCategoryOrSr = row.validSrInfo?.some(
    (info) =>
      info.category.toLowerCase().includes(q) || info.sr.toFixed(2).includes(q)
  );

  return (
    matchesCategoryOrSr ||
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
};

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

  if (item.mapCategories.length > 1) {
    selectedMapCategories.value = item.mapCategories;
    pendingMapId.value = item.mapId;
    isPendingNewTab.value = isNewTab;
    isCategoryModalOpen.value = true;
  } else if (item.mapCategories.length === 1 && item.mapCategories[0]) {
    navigateToMapProfile(item.mapCategories[0], item.mapId, isNewTab);
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
</script>

<style lang="scss" scoped>
.scores-table {
  width: 100%;
  border: 4px solid var(--color-vuetify-table-borders);
  border-radius: 4px;
  & :deep(th) {
    vertical-align: middle;
  }
  & :deep(td) {
    vertical-align: middle;
  }
  &__content {
    height: 600px;
    cursor: pointer;
  }
  &__id-label {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  &__user-card-wrapper {
    padding: 8px 0;
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
    font-weight: bold;
  }
  &__sr-tooltip-sr-wrapper {
    display: flex;
    align-items: center;
  }
  &__sr-tooltip-nm {
    margin-bottom: 1px;
    font-size: 11px;
    opacity: 0.7;
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
    font-weight: 500;
  }
  &__time {
    color: var(--color-text-gray);
    font-size: 12px;
  }
  &__score {
    font-weight: bold;
  }
  &__points {
    color: var(--color-points);
    font-weight: bold;
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
      var(--color-btn-text),
      var(--color-btn-cancel-bg),
      0
    );
  }
}
</style>
