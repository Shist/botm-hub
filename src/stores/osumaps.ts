import { reactive } from "vue";
import { defineStore } from "pinia";
import { loadMapsByCategoryFromFirebase } from "@/services/firebase/osumaps";
import { LoadingState } from "@/types/global";
import {
  OsuMapCategory,
  type IOsuMap,
  type IOsuMapsCategoryState,
} from "@/types/osumaps";

export const useOsumapsStore = defineStore("osumaps", () => {
  const osumaps = reactive<Record<OsuMapCategory, IOsuMapsCategoryState>>({
    [OsuMapCategory.NM1]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.NM2]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.NM3]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.NM4]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.NM5]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.NM6]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.NM7]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.HD1]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.HD2]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.HD3]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.HR1]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.HR2]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.HR3]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.DT1]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.DT2]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.DT3]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.DT4]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.FM1]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.FM2]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.FM3]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
    [OsuMapCategory.TB]: {
      mapsList: [],
      loadingState: LoadingState.NOT_LOADED,
    },
  });

  const loadMapsByCategory = async (
    category: OsuMapCategory
  ): Promise<IOsuMap[]> => {
    if (osumaps[category].loadingState === LoadingState.LOADED)
      return osumaps[category].mapsList;

    try {
      osumaps[category].loadingState = LoadingState.LOADING;
      const mapsList = await loadMapsByCategoryFromFirebase(category);
      osumaps[category].mapsList = mapsList;
      osumaps[category].loadingState = LoadingState.LOADED;
      return mapsList;
    } catch (error) {
      osumaps[category].loadingState = LoadingState.ERROR;
      throw error;
    }
  };

  const getMapsOfGivenCategories = (
    categories: OsuMapCategory[],
    sortBy: keyof IOsuMap = "starRate"
  ): IOsuMap[] => {
    const mapsList = categories.flatMap(
      (category) => osumaps[category].mapsList
    );

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
    loadMapsByCategory,
    getMapsOfGivenCategories,
  };
});
