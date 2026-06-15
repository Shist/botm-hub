import { reactive, ref } from "vue";
import { defineStore } from "pinia";
import { loadAllMapsFromFirebase } from "@/services/firebase/osumaps";
import { useMetaStore } from "@/stores/meta";
import { OsuMapCategory, type IOsuMap } from "@/types/osumaps";

export const useOsumapsStore = defineStore("osumaps", () => {
  const metaStore = useMetaStore();

  const isLoading = ref(false);
  const isLoaded = ref(false);
  let loadPromise: Promise<void> | null = null;

  const osumaps = reactive<Record<OsuMapCategory, IOsuMap[]>>(
    Object.values(OsuMapCategory).reduce(
      (acc, category) => {
        acc[category] = [];
        return acc;
      },
      {} as Record<OsuMapCategory, IOsuMap[]>
    )
  );

  const populateStore = (maps: IOsuMap[]) => {
    for (const key in osumaps) {
      osumaps[key as OsuMapCategory] = [];
    }
    maps.forEach((map) => {
      map.starRate = Math.round(map.starRate * 100) / 100;
      osumaps[map.category].push(map);
    });
  };

  const loadAllMaps = async () => {
    if (isLoaded.value) return;
    if (loadPromise) return loadPromise;

    isLoading.value = true;

    loadPromise = (async () => {
      if (!metaStore.isLoaded) await metaStore.loadMeta();

      const serverTimestamp = metaStore.metaConfig?.mapsUpdatedAt?.toString();
      const localTimestamp = localStorage.getItem("mapsUpdatedAt");
      const localMaps = localStorage.getItem("botmMaps");

      if (serverTimestamp && localTimestamp === serverTimestamp && localMaps) {
        try {
          const parsedMaps: IOsuMap[] = JSON.parse(localMaps);
          if (parsedMaps.length > 0) {
            populateStore(parsedMaps);
            isLoading.value = false;
            isLoaded.value = true;
            return;
          } else {
            console.warn(
              "В localStorage обнаружен пустой массив карт. Принудительная загрузка с сервера..."
            );
          }
        } catch (e) {
          console.error("Ошибка парсинга карт из localStorage:", e);
        }
      }

      try {
        const fetchedMaps = await loadAllMapsFromFirebase();
        populateStore(fetchedMaps);

        localStorage.setItem("botmMaps", JSON.stringify(fetchedMaps));
        if (serverTimestamp) {
          localStorage.setItem("mapsUpdatedAt", serverTimestamp);
        }
        isLoaded.value = true;
      } catch (error) {
        throw error;
      } finally {
        isLoading.value = false;
      }
    })();

    await loadPromise;
    loadPromise = null;
  };

  const getMapsOfGivenCategories = (
    categories: OsuMapCategory[],
    sortBy: keyof IOsuMap = "starRate"
  ): IOsuMap[] => {
    const mapsList = categories.flatMap((category) => osumaps[category]);

    if (["id", "starRate", "bpm", "cs", "ar", "od", "hp"].includes(sortBy)) {
      mapsList.sort((a, b) => (a[sortBy] as number) - (b[sortBy] as number));
    } else if (sortBy === "duration") {
      mapsList.sort((a, b) => {
        const aArr = a.duration.split(":").reverse().map(Number);
        const bArr = b.duration.split(":").reverse().map(Number);
        const aSeconds =
          (aArr[0] ?? 0) + (aArr[1] ?? 0) * 60 + (aArr[2] ?? 0) * 3600;
        const bSeconds =
          (bArr[0] ?? 0) + (bArr[1] ?? 0) * 60 + (bArr[2] ?? 0) * 3600;
        return aSeconds - bSeconds;
      });
    } else {
      mapsList.sort((a, b) =>
        (a[sortBy] as string).localeCompare(b[sortBy] as string)
      );
    }

    return mapsList;
  };

  return {
    osumaps,
    isLoading,
    isLoaded,
    loadAllMaps,
    getMapsOfGivenCategories,
  };
});
