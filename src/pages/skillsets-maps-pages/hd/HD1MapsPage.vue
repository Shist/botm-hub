<template>
  <SkillsetMapsTable :category="OsuMapCategory.hd1" />
</template>

<script setup lang="ts">
import SkillsetMapsTable from "@/components/SkillsetMapsTable.vue";
import { OsuMapCategory } from "@/types";
</script>
