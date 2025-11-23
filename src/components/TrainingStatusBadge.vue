<template>
  <span
    class="training-status-badge"
    :class="`training-status-badge_${status}`"
  >
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { TrainingStatus } from "@/types";

const props = defineProps<{
  status: TrainingStatus;
}>();

const statusLabel = computed(() =>
  `${props.status}`.replace(/-/g, " ").toUpperCase()
);
</script>

<style lang="scss" scoped>
.training-status-badge {
  @include default-headline(16px, 16px, var(--color-text-white));
  padding: 4px;
  display: flex;
  justify-content: center;
  width: 110px;
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
  &_waiting {
    background-color: var(--color-training-waiting);
  }
  &_in-progress {
    background-color: var(--color-training-in-progress);
  }
  &_completed {
    background-color: var(--color-training-completed);
  }
  &_archived {
    background-color: var(--color-training-archived);
  }
}
</style>
