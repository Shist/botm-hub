<template>
  <SkillsetMapsTable :category="OsuMapCategory.fm2" />
</template>

<script setup lang="ts">
import SkillsetMapsTable from "@/components/SkillsetMapsTable.vue";
import { OsuMapCategory } from "@/types";
</script>
