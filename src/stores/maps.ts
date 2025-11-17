import { reactive } from "vue";
import { defineStore } from "pinia";
import { loadMapsByCategoryFromFirebase } from "@/services/firebase";
import {
  LoadingState,
  type OsuMapCategory,
  type IOsuMap,
  type IOsuMapsCategoryState,
} from "@/types";

export const useMapsStore = defineStore("maps", () => {
  const maps = reactive<Record<OsuMapCategory, IOsuMapsCategoryState>>({
    nm1: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    nm2: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    nm3: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    nm4: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    nm5: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    nm6: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    nm7: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    hd1: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    hd2: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    hd3: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    hr1: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    hr2: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    hr3: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    dt1: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    dt2: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    dt3: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    dt4: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    fm1: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    fm2: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    fm3: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
    tb: { mapsList: [], loadingState: LoadingState.NOT_LOADED },
  });

  const loadMapsByCategory = async (
    category: OsuMapCategory
  ): Promise<IOsuMap[]> => {
    if (maps[category].loadingState === LoadingState.LOADED)
      return maps[category].mapsList;

    try {
      maps[category].loadingState = LoadingState.LOADING;
      const mapsList = await loadMapsByCategoryFromFirebase(category);
      maps[category].mapsList = mapsList;
      maps[category].loadingState = LoadingState.LOADED;
      return mapsList;
    } catch (error) {
      maps[category].loadingState = LoadingState.ERROR;
      throw error;
    }
  };

  const getMapsOfGivenCategories = (
    categories: OsuMapCategory[],
    sortBy: keyof IOsuMap = "starRate"
  ): IOsuMap[] => {
    const mapsList = categories.flatMap((category) => maps[category].mapsList);

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
    maps,
    loadMapsByCategory,
    getMapsOfGivenCategories,
  };
});
