<template>
  <div class="skillsets-maps-table">
    <v-text-field
      v-model="searchQuery"
      variant="solo-filled"
      prepend-inner-icon="mdi-magnify"
      label="Найти карты по любому полю"
      placeholder="Введи любое ключевое слово любого поля"
      clearable
      hide-details
    />
    <v-skeleton-loader type="table" :loading="isLoading">
      <v-data-table-virtual
        :headers="headers"
        :items="itemsForTable"
        :item-value="'idWithCategory'"
        :sort-by="defaultSortBy"
        :search="searchQuery"
        :mobile-breakpoint="769"
        :fixed-header="true"
        hover
        hide-details
        class="skillsets-maps-table__content"
        :class="{ 'skillsets-maps-table__content_fixed-height': isFixedHeight }"
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
          <div class="skillsets-maps-table__cover-wrapper">
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
        <template #[`item.category`]="{ item }">
          <CategoryBadge
            :category="item.category"
            class="skillsets-maps-table__badge"
          /> </template
        ><template #no-data>
          <div class="skillsets-maps-table__no-data">Нет данных о картах</div>
        </template>
      </v-data-table-virtual>
    </v-skeleton-loader>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import CategoryBadge from "@/components/osumaps/CategoryBadge.vue";
import useToast from "@/composables/useToast";
import { OsuMapCategory, type IOsuMap } from "@/types/osumaps";
import { CATEGORIES_SORT_PRIORITIES } from "@/constants";

type DataTableHeader = {
  key: string;
  title: string;
  minWidth?: string;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  sort?:
    | ((a: OsuMapCategory, b: OsuMapCategory) => number)
    | ((a: string, b: string) => number);
};

const router = useRouter();

const props = withDefaults(
  defineProps<{
    mapsList: IOsuMap[];
    isLoading: boolean;
    defaultSort?: { key: string; order?: "asc" | "desc" }[];
    isFixedHeight?: boolean;
  }>(),
  {
    defaultSort: () => [{ key: "starRate", order: "asc" }],
    isFixedHeight: false,
  }
);

const { setSuccessToast, setErrorToast } = useToast();

const searchQuery = ref("");

const headers = reactive<DataTableHeader[]>([
  {
    key: "id",
    title: "ID",
    minWidth: "104px",
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
  {
    key: "name",
    title: "Название",
    minWidth: "335px",
  },
  {
    key: "mapper",
    title: "Мапер",
    minWidth: "181px",
  },
  {
    key: "starRate",
    title: "Сложность",
    minWidth: "140px",
  },
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
  {
    key: "bpm",
    title: "BPM",
    minWidth: "91px",
  },
  {
    key: "cs",
    title: "CS",
    minWidth: "76px",
  },
  {
    key: "ar",
    title: "AR",
    minWidth: "77px",
  },
  {
    key: "od",
    title: "OD",
    minWidth: "78px",
  },
  {
    key: "hp",
    title: "HP",
    minWidth: "78px",
  },
  {
    key: "comment",
    title: "Комментарий",
    minWidth: "190px",
  },
]);

const defaultSortBy = computed(() => props.defaultSort);

const itemsForTable = computed(() =>
  props.mapsList.map((item) => ({
    idWithCategory: `${item.id}-${item.category}`,
    ...item,
  }))
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
  & :deep(th) {
    vertical-align: middle;
  }
  & :deep(td) {
    vertical-align: middle;
  }
  &__content {
    height: calc(100dvh - 344px);
    cursor: pointer;
    @media (max-width: $tablet-l) {
      height: calc(100dvh - 334px);
    }
    @media (max-width: $phone-l) {
      height: calc(100dvh - 329px);
    }
    &_fixed-height {
      height: 600px;
    }
  }
  &__id-label {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  &__cover-wrapper {
    width: 144px;
    height: 40px;
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
}
</style>
