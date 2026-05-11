<template>
  <div class="skillset-maps-table">
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
        :search="searchQuery"
        :mobile-breakpoint="769"
        :fixed-header="true"
        hide-details
        class="skillset-maps-table__content"
      >
        <template #[`item.id`]="{ item }">
          <span
            class="skillset-maps-table__id-label"
            @click="copyToClipboard(item.id)"
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
              />
            </template>
          </v-tooltip>
        </template>
        <template #[`item.cover`]="{ item }">
          <div class="skillset-maps-table__cover-wrapper">
            <v-img
              :src="`https://assets.ppy.sh/beatmaps/${item.mapsetId}/covers/cover.jpg`"
              cover
            >
              <template #placeholder>
                <div class="skillset-maps-table__cover-loader">
                  <v-progress-circular
                    indeterminate
                    size="16"
                    width="2"
                    color="var(--color-vuetify-progress)"
                  />
                </div>
              </template>
            </v-img>
          </div>
        </template>
        <template #[`item.category`]="{ item }">
          <CategoryBadge
            :category="item.category"
            class="skillset-maps-table__badge"
          />
        </template>
      </v-data-table-virtual>
    </v-skeleton-loader>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
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

const props = defineProps<{ mapsList: IOsuMap[]; isLoading: boolean }>();

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
</script>

<style lang="scss" scoped>
.skillset-maps-table {
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
    @media (max-width: $tablet-l) {
      height: calc(100dvh - 334px);
    }
    @media (max-width: $phone-l) {
      height: calc(100dvh - 321px);
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
  &__badge {
    @media (max-width: $tablet-l) {
      float: right;
    }
  }
}
</style>
