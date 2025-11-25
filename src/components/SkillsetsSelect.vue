<template>
  <v-select
    v-model="chosenCategories"
    :items="categoriesOptions"
    variant="solo"
    prepend-inner-icon="mdi-star-cog"
    label="Скиллсеты"
    placeholder="Выбери скиллсет(ы)"
    multiple
    chips
    closable-chips
    clearable
    hide-details
  >
    <template #chip="{ item }">
      <CategoryBadge :category="item.value" />
    </template>
  </v-select>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import CategoryBadge from "@/components/CategoryBadge.vue";
import { OsuMapCategory } from "@/types";
import { CATEGORIES_SORT_PRIORITIES, MAPS_CATEGORIES } from "@/constants";

const props = defineProps<{
  modelValue: OsuMapCategory[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: OsuMapCategory[]];
}>();

const chosenCategories = computed({
  get: () => props.modelValue,
  set: (value) =>
    emit(
      "update:modelValue",
      value.sort(
        (a, b) => CATEGORIES_SORT_PRIORITIES[a] - CATEGORIES_SORT_PRIORITIES[b]
      )
    ),
});

const categoriesOptions = computed(() =>
  Object.values(OsuMapCategory).map((category) => ({
    value: category,
    title: MAPS_CATEGORIES[category],
  }))
);
</script>
