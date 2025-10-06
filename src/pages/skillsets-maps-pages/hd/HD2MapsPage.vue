<template>
  <SkillsetMapsTable :category="OsuMapCategory.hd2" />
</template>

<script setup lang="ts">
import SkillsetMapsTable from "@/components/SkillsetMapsTable.vue";
import { OsuMapCategory } from "@/types";
</script>
