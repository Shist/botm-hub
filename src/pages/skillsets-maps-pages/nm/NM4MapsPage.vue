<template>
  <div class="skillset-maps-page">
    <h2 class="skillset-maps-page__headline">
      Мапы {{ MAPS_CATEGORIES[OsuMapCategory.nm4] }}
    </h2>
    <SkillsetMapsTable :mapsCategories="categoryMapsInfo" />
  </div>
</template>

<script setup lang="ts">
import SkillsetMapsTable from "@/components/SkillsetMapsTable.vue";
import { OsuMapCategory } from "@/types";
import useSkillsetPageFlow from "@/composables/useSkillsetPageFlow";
import { MAPS_CATEGORIES } from "@/constants";

const { categoryMapsInfo } = useSkillsetPageFlow(OsuMapCategory.nm4);
</script>
