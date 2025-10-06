<template>
  <div class="skillset-maps-page">
    <h2 class="skillset-maps-page__headline">
      Мапы {{ MAPS_CATEGORIES[category] }}
    </h2>
    <div class="skillset-maps-page__table-wrapper">
      <v-text-field
        v-model="searchQuery"
        prepend-inner-icon="mdi-magnify"
        label="Найти карты по любому полю"
        hide-details
      />
      <v-skeleton-loader
        type="table"
        :loading="mapsInfo.loadingState === LoadingState.LOADING"
      >
        <v-data-table-virtual
          :headers="headers"
          :items="mapsInfo.mapsList"
          :search="searchQuery"
          :mobile-breakpoint="768"
          :fixed-header="true"
          height="560px"
          hide-details
        >
          <template v-slot:[`item.link`]="{ item }">
            <a :href="item.link" target="_blank">{{ item.link }}</a>
          </template>
          <template v-slot:[`item.category`]="{ item }">
            <CategoryBadge :category="item.category" />
          </template>
        </v-data-table-virtual>
      </v-skeleton-loader>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useMapsStore } from "@/stores/maps";
import CategoryBadge from "@/components/CategoryBadge.vue";
import useToast from "@/composables/useToast";
import { LoadingState, OsuMapCategory } from "@/types";
import { MAPS_CATEGORIES } from "@/constants";

const props = defineProps<{
  category: OsuMapCategory;
}>();

const mapsStore = useMapsStore();

const { setErrorToast } = useToast();

onMounted(async () => {
  try {
    await mapsStore.loadMapsByCategory(props.category);
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(
      `Не удалось загрузить карты для категории "${props.category}": ${msg}`
    );
  }
});

const searchQuery = ref("");

const mapsInfo = computed(() => mapsStore.maps[props.category]);

const headers = reactive([
  {
    key: "id",
    title: "ID",
    width: "130px",
    maxWidth: "130px",
  },
  {
    key: "link",
    title: "Ссылка",
    width: "280px",
    maxWidth: "280px",
  },
  {
    key: "category",
    title: "Мод",
    width: "80px",
    maxWidth: "80px",
  },
  {
    key: "name",
    title: "Название",
    minWidth: "300px",
  },
  {
    key: "mapper",
    title: "Мапер",
    width: "200px",
    maxWidth: "200px",
  },
  {
    key: "starRate",
    title: "Сложность",
    width: "110px",
    maxWidth: "110px",
  },
  {
    key: "duration",
    title: "Длительность",
    width: "130px",
    maxWidth: "130px",
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
    width: "65px",
    maxWidth: "65px",
  },
  {
    key: "cs",
    title: "CS",
    width: "55px",
    maxWidth: "55px",
  },
  {
    key: "ar",
    title: "AR",
    width: "55px",
    maxWidth: "55px",
  },
  {
    key: "od",
    title: "OD",
    width: "55px",
    maxWidth: "55px",
  },
  {
    key: "hp",
    title: "HP",
    width: "55px",
    maxWidth: "55px",
  },
  {
    key: "comment",
    title: "Комментарий",
    width: "300px",
    maxWidth: "300px",
  },
]);
</script>

<style scoped lang="scss">
.skillset-maps-page {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: 20px;
  &__headline {
    @include default-headline(28px, 28px, var(--color-text));
  }
  &__table-wrapper {
    width: 100%;
    & :deep(th) {
      vertical-align: middle;
    }
    & :deep(td) {
      vertical-align: middle;
    }
  }
}
</style>
