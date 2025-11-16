<template>
  <div class="skillset-maps-page">
    <h2 class="skillset-maps-page__headline">
      Мапы {{ MAPS_CATEGORIES[OsuMapCategory.fm1] }}
    </h2>
    <SkillsetMapsTable :mapsList="categoryMapsList" :isLoading="isLoading" />
  </div>
</template>

<script setup lang="ts">
import SkillsetMapsTable from "@/components/SkillsetMapsTable.vue";
import { OsuMapCategory } from "@/types";
import useSkillsetPageFlow from "@/composables/useSkillsetPageFlow";
import { MAPS_CATEGORIES } from "@/constants";

const { categoryMapsList, isLoading } = useSkillsetPageFlow(OsuMapCategory.fm1);
</script>
