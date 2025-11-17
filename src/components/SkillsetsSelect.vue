<template>
  <v-select
    v-model="chosenCategories"
    :items="categoriesOptions"
    variant="solo"
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

const props = defineProps<{
  modelValue: OsuMapCategory[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: OsuMapCategory[]];
}>();

const chosenCategories = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const categoriesOptions = computed(() =>
  Object.values(OsuMapCategory).map((category) => ({
    value: category,
    title: category.toUpperCase(),
  }))
);
</script>
