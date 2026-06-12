<template>
  <v-select
    v-model="chosenCategories"
    :items="categoriesOptions"
    variant="solo"
    prepend-inner-icon="mdi-star-cog"
    :label="`Скиллсет${isMultiple ? '(ы)' : ''}`"
    :placeholder="`Выбери скиллсет${isMultiple ? '(ы)' : ''}`"
    :multiple="isMultiple"
    :chips="isMultiple"
    :closable-chips="isMultiple"
    clearable
    hide-details
  >
    <template v-if="isMultiple" #chip="{ item }">
      <CategoryBadge :category="item.value" />
    </template>
    <template v-else #selection="{ item }">
      <CategoryBadge :category="item.value" />
    </template>
  </v-select>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import CategoryBadge from "@/components/osumaps/CategoryBadge.vue";
import { OsuMapCategory } from "@/types/osumaps";
import { CATEGORIES_SORT_PRIORITIES, MAPS_CATEGORIES } from "@/constants";

const props = defineProps<{
  modelValue: OsuMapCategory | OsuMapCategory[] | null;
  isMultiple?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: OsuMapCategory | OsuMapCategory[] | null];
}>();

const chosenCategories = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (props.isMultiple && Array.isArray(value)) {
      emit(
        "update:modelValue",
        [...value].sort(
          (a, b) =>
            CATEGORIES_SORT_PRIORITIES[a] - CATEGORIES_SORT_PRIORITIES[b]
        )
      );
    } else {
      emit("update:modelValue", value);
    }
  },
});

const categoriesOptions = computed(() =>
  Object.values(OsuMapCategory).map((category) => ({
    value: category,
    title: MAPS_CATEGORIES[category],
  }))
);
</script>
