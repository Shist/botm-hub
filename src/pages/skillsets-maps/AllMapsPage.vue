<template>
  <div class="skillset-maps-page">
    <h2 class="skillset-maps-page__headline">
      Все BOTM Мапы
      <span v-if="!isLoading" class="skillset-maps-page__count">
        ({{ filteredMapsCount }})
      </span>
      <v-progress-circular
        v-else
        indeterminate
        size="16"
        width="2"
        color="currentColor"
      />
    </h2>
    <SkillsetsMapsTable
      :mapsList="allMapsList"
      :isLoading="isLoading"
      @update:filteredCount="filteredMapsCount = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useOsumapsStore } from "@/stores/osumaps";
import SkillsetsMapsTable from "@/components/osumaps/SkillsetsMapsTable.vue";
import useToast from "@/composables/useToast";

const mapsStore = useOsumapsStore();
const { setErrorToast } = useToast();

const filteredMapsCount = ref(0);

const allMapsList = computed(() => {
  return Object.values(mapsStore.osumaps).flat();
});

const isLoading = computed(() => mapsStore.isLoading);

onMounted(async () => {
  try {
    await mapsStore.loadAllMaps();
  } catch (error) {
    const msg = error instanceof Error ? error?.message : error;
    setErrorToast(`Не удалось загрузить карты: ${msg}`);
  }
});
</script>

<style lang="scss" scoped>
.skillset-maps-page {
  display: flex;
  flex-direction: column;
  row-gap: 10px;
  &__headline {
    @include default-headline(28px, 28px, var(--color-text));
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }
  &__count {
    @include default-text(24px, 24px, var(--color-text));
  }
}
</style>
