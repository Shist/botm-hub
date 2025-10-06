<template>
  <SkillsetMapsTable :category="OsuMapCategory.hr3" />
</template>

<script setup lang="ts">
import SkillsetMapsTable from "@/components/SkillsetMapsTable.vue";
import { OsuMapCategory } from "@/types";
</script>
