<template>
  <label class="switcher" :for="generatedId">
    <input
      type="checkbox"
      class="switcher__input"
      :id="generatedId"
      v-model="currSwitchValue"
    />
    <div class="switcher__slider" />
  </label>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const generatedId = ref("");

const currSwitchValue = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit("update:modelValue", value);
  },
});

onMounted(() => {
  generatedId.value = `switcher-${Math.random().toString(36).substring(2, 15)}`;
});
</script>

<style lang="scss" scoped>
.switcher {
  position: relative;
  width: 60px;
  height: 34px;
  &__input {
    display: none;
    &:checked + .switcher__slider {
      background-color: var(--color-theme-slider-dark);
    }
    &:checked + .switcher__slider:before {
      transform: translateX(26px);
    }
  }
  &__slider {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    cursor: pointer;
    background-color: var(--color-theme-slider-light);
    border-radius: 34px;
    box-shadow: inset 0 0 0 1px rgba(128, 128, 128, 0.3);
    transition: 0.4s;
    &::before {
      content: "";
      height: 26px;
      width: 26px;
      position: absolute;
      bottom: 4px;
      left: 4px;
      background-color: var(--color-theme-slider-circle);
      border-radius: 50%;
      box-shadow:
        0 2px 4px rgba(0, 0, 0, 0.2),
        0 0 2px rgba(0, 0, 0, 0.3);
      transition: 0.4s;
    }
  }
}
</style>
