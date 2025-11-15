<template>
  <div class="skillset-maps-table">
    <v-text-field
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      label="Найти карты по любому полю"
      hide-details
    />
    <v-skeleton-loader type="table" :loading="isSomeCategoryLoading">
      <v-data-table-virtual
        :headers="headers"
        :items="allMapsList"
        :search="searchQuery"
        :mobile-breakpoint="769"
        :fixed-header="true"
        hide-details
        class="skillset-maps-table__content"
      >
        <template v-slot:[`item.id`]="{ item }">
          <span
            class="skillset-maps-table__id-label"
            @click="copyToClipboard(item.id)"
          >
            {{ item.id }}
          </span>
        </template>
        <template v-slot:[`item.link`]="{ item }">
          <a :href="item.link" target="_blank">{{ item.link }}</a>
        </template>
        <template v-slot:[`item.category`]="{ item }">
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
import CategoryBadge from "@/components/CategoryBadge.vue";
import useToast from "@/composables/useToast";
import { LoadingState, type IOsuMapsCategoryState } from "@/types";

const props = defineProps<{ mapsCategories: IOsuMapsCategoryState[] }>();

const { setSuccessToast, setErrorToast } = useToast();

const searchQuery = ref("");

const headers = reactive([
  {
    key: "id",
    title: "ID",
    minWidth: "104px",
  },
  {
    key: "link",
    title: "Ссылка",
    minWidth: "255px",
  },
  {
    key: "category",
    title: "Мод",
    minWidth: "89px",
  },
  {
    key: "name",
    title: "Название",
    minWidth: "340px",
  },
  {
    key: "mapper",
    title: "Мапер",
    minWidth: "182px",
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

const isSomeCategoryLoading = computed(() =>
  props.mapsCategories.some(
    (category) => category.loadingState === LoadingState.LOADING
  )
);
const allMapsList = computed(() =>
  props.mapsCategories.map((category) => category.mapsList).flat()
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

<style scoped lang="scss">
.skillset-maps-table {
  width: 100%;
  & :deep(th) {
    vertical-align: middle;
  }
  & :deep(td) {
    vertical-align: middle;
  }
  &__content {
    height: calc(100vh - 300px);
    @media (max-width: $tablet-l) {
      height: calc(100vh - 290px);
    }
    @media (max-width: $phone-l) {
      height: calc(100vh - 277px);
    }
  }
  &__id-label {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
  &__badge {
    @media (max-width: $tablet-l) {
      float: right;
    }
  }
}
</style>
