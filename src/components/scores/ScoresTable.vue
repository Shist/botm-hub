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
        :items="scoresList"
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
import useToast from "@/composables/useToast";
import UserCard from "@/components/users/UserCard.vue";
import CategoryBadge from "@/components/osumaps/CategoryBadge.vue";
import { formatMapRank } from "@/utils";
import { type OsuMapCategory } from "@/types/osumaps";
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
    | ((a: Date, b: Date) => number);
};

const router = useRouter();

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
  },
  {
    key: "date",
    title: "Дата",
    minWidth: "103px",
    align: "center",
    sort: (a: Date, b: Date) => b.getTime() - a.getTime(),
  },
]);

const defaultSortBy = computed(() => props.defaultSort);

const visibleHeaders = computed(() => {
  return allHeaders.filter(
    (header) => !props.hiddenColumns.includes(header.key)
  );
});

const customFilter = (
  _: unknown,
  query: string,
  item?: { raw: IScoreTableRow }
) => {
  if (!query || !item) return true;

  const q = query.toLowerCase();
  const row = item.raw;

  return (
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
    color: var(--color-club-points);
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
