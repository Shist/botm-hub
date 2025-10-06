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

  return {
    maps,
    loadMapsByCategory,
  };
});
