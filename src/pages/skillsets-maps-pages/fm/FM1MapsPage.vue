<template>
  <SkillsetMapsTable :category="OsuMapCategory.fm1" />
</template>

<script setup lang="ts">
import SkillsetMapsTable from "@/components/SkillsetMapsTable.vue";
import { OsuMapCategory } from "@/types";
</script>
