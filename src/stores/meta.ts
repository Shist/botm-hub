import { ref } from "vue";
import { defineStore } from "pinia";
import { loadMetaFromFirebase } from "@/services/firebase/meta";
import { type IMetaConfig } from "@/types/meta";

export const useMetaStore = defineStore("meta", () => {
  const metaConfig = ref<IMetaConfig | null>(null);
  const isLoaded = ref(false);
  let loadPromise: Promise<void> | null = null;

  const loadMeta = async () => {
    if (isLoaded.value) return;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      const data = await loadMetaFromFirebase();
      if (data) metaConfig.value = data;
      isLoaded.value = true;
    })();

    await loadPromise;
    loadPromise = null;
  };

  return {
    metaConfig,
    isLoaded,
    loadMeta,
  };
});
