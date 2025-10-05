<template>
  <div class="theme-switcher">
    <span class="theme-switcher__icon theme-switcher__icon_sun" />
    <AppSwitcher v-model="isSwitcherChecked" />
    <span class="theme-switcher__icon theme-switcher__icon_moon" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useThemeStore } from "@/stores/theme";

const themeStore = useThemeStore();

const isSwitcherChecked = computed({
  get: () => themeStore.currTheme === "dark",
  set: (value: boolean) => {
    themeStore.setCurrTheme(value ? "dark" : "light");
  },
});
</script>

<style lang="scss" scoped>
.theme-switcher {
  display: flex;
  justify-content: center;
  align-items: center;
  column-gap: 5px;
  &__icon {
    width: 50px;
    height: 50px;
    background-color: transparent;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    &_sun {
      background-image: var(--sun-icon-img);
    }
    &_moon {
      background-image: var(--moon-icon-img);
    }
  }
}
</style>
