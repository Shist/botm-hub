<template>
  <SkillsetMapsTable :category="OsuMapCategory.nm4" />
</template>

<script setup lang="ts">
import SkillsetMapsTable from "@/components/SkillsetMapsTable.vue";
import { OsuMapCategory } from "@/types";
</script>
