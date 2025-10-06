<template>
  <span class="mode-badge" :class="`mode-badge_${category}`">
    {{ categoryLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  category: string;
}>();

const categoryLabel = computed(() => `${props.category}`.toUpperCase());
</script>

<style lang="scss" scoped>
.mode-badge {
  @include default-headline(16px, 16px, var(--color-text-white));
  padding: 4px;
  display: flex;
  justify-content: center;
  width: 45px;
  border-radius: 10px;
  @media (max-width: $phone-l) {
    font-size: 12px;
    line-height: 12px;
    padding: 3px;
    border-radius: 7px;
  }
  @media (max-width: $phone-m) {
    font-size: 10px;
    line-height: 10px;
    border-radius: 6px;
  }
  &_nm1 {
    background-color: var(--color-btn-bg-nm1);
  }
  &_nm2 {
    background-color: var(--color-btn-bg-nm2);
  }
  &_nm3 {
    background-color: var(--color-btn-bg-nm3);
  }
  &_nm4 {
    background-color: var(--color-btn-bg-nm4);
  }
  &_nm5 {
    background-color: var(--color-btn-bg-nm5);
  }
  &_nm6 {
    background-color: var(--color-btn-bg-nm6);
  }
  &_nm7 {
    background-color: var(--color-btn-bg-nm7);
  }
  &_hd1 {
    background-color: var(--color-btn-bg-hd1);
  }
  &_hd2 {
    background-color: var(--color-btn-bg-hd2);
  }
  &_hd3 {
    background-color: var(--color-btn-bg-hd3);
  }
  &_hr1 {
    background-color: var(--color-btn-bg-hr1);
  }
  &_hr2 {
    background-color: var(--color-btn-bg-hr2);
  }
  &_hr3 {
    background-color: var(--color-btn-bg-hr3);
  }
  &_dt1 {
    background-color: var(--color-btn-bg-dt1);
  }
  &_dt2 {
    background-color: var(--color-btn-bg-dt2);
  }
  &_dt3 {
    background-color: var(--color-btn-bg-dt3);
  }
  &_dt4 {
    background-color: var(--color-btn-bg-dt4);
  }
  &_fm1 {
    background-color: var(--color-btn-bg-fm1);
  }
  &_fm2 {
    background-color: var(--color-btn-bg-fm2);
  }
  &_fm3 {
    background-color: var(--color-btn-bg-fm3);
  }
  &_tb {
    background-color: var(--color-btn-bg-tb);
  }
}
</style>
