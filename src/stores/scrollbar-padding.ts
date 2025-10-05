import { ref } from "vue";
import { defineStore } from "pinia";
import { getScrollbarWidth } from "@/utils";

export const useScrollbarPaddingStore = defineStore("scrollbarPadding", () => {
  const scrollbarWidth = ref(`${getScrollbarWidth()}px`);
  const isPaddingNeeded = ref(false);

  return { scrollbarWidth, isPaddingNeeded };
});
