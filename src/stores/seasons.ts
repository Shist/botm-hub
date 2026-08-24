import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { type ISeasonalSettings } from "@/types/seasons";

const DEFAULT_SETTINGS: ISeasonalSettings = {
  valCorners: true,
  valHearts: true,
  aprilClowns: true,
  aprilCursor: true,
  osuPeppy: true,
  osuCursor: true,
  halloweenPumpkins: true,
  newYearBranches: true,
  newYearSnow: true,
};

export const useSeasonalStore = defineStore("seasonal", () => {
  const settings = ref<ISeasonalSettings>({ ...DEFAULT_SETTINGS });

  const saved = localStorage.getItem("seasonalDecorationsSettings");
  if (saved) {
    try {
      settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      settings.value = { ...DEFAULT_SETTINGS };
    }
  }

  watch(
    settings,
    (newVal) => {
      localStorage.setItem(
        "seasonalDecorationsSettings",
        JSON.stringify(newVal)
      );
    },
    { deep: true }
  );

  const toggleAll = (enable: boolean) => {
    Object.keys(settings.value).forEach((key) => {
      settings.value[key as keyof ISeasonalSettings] = enable;
    });
  };

  return {
    settings,
    toggleAll,
  };
});
