<template>
  <SkillsetMapsTable :category="OsuMapCategory.tb" />
</template>

<script setup lang="ts">
import SkillsetMapsTable from "@/components/SkillsetMapsTable.vue";
import { OsuMapCategory } from "@/types";
</script>
