import { ref } from "vue";
import { defineStore } from "pinia";
import { getFirestore, doc, getDoc } from "firebase/firestore/lite";
import { type IMetaConfig } from "@/types/meta";

export const useMetaStore = defineStore("meta", () => {
  const metaConfig = ref<IMetaConfig | null>(null);
  const isLoaded = ref(false);

  const loadMeta = async () => {
    if (isLoaded.value) return;

    try {
      const db = getFirestore();
      const metaRef = doc(db, "global", "meta");
      const snap = await getDoc(metaRef);

      if (snap.exists()) {
        metaConfig.value = snap.data() as IMetaConfig;
      }
      isLoaded.value = true;
    } catch (error) {
      console.error("Ошибка при загрузке meta-конфига:", error);
    }
  };

  return {
    metaConfig,
    isLoaded,
    loadMeta,
  };
});
