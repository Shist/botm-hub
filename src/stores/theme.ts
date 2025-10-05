import { ref } from "vue";
import { defineStore } from "pinia";
import { updateGlobalOptions } from "vue3-toastify";

export const useThemeStore = defineStore("theme", () => {
  const currTheme = ref<"dark" | "light">(
    localStorage.getItem("theme") === "light" ? "light" : "dark"
  );

  const setCurrTheme = (newTheme: "light" | "dark") => {
    currTheme.value = newTheme;
    localStorage.setItem("theme", currTheme.value);
    updateGlobalOptions({ clearOnUrlChange: false, theme: currTheme.value });
  };

  return { currTheme, setCurrTheme };
});
