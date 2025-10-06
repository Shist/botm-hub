<template>
  <SkillsetMapsTable :category="OsuMapCategory.dt4" />
</template>

<script setup lang="ts">
import SkillsetMapsTable from "@/components/SkillsetMapsTable.vue";
import { OsuMapCategory } from "@/types";
</script>
