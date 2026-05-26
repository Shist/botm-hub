import { ref } from "vue";
import { defineStore } from "pinia";
import { loadAllScoresFromFirebase } from "@/services/firebase/scores";
import { type IAllScores, isOsuScoreMod } from "@/types/scores";

export const useScoresStore = defineStore("scores", () => {
  const allScores = ref<IAllScores>({});

  const isLoaded = ref(false);
  let loadPromise: Promise<void> | null = null;

  const loadAllScores = async () => {
    if (isLoaded.value) return;
    if (loadPromise) return loadPromise;

    loadPromise = (async () => {
      try {
        const rawData = await loadAllScoresFromFirebase();

        if (rawData) {
          const parsedScores: IAllScores = {};

          for (const [uid, mapsRecord] of Object.entries(rawData)) {
            parsedScores[uid] = {};

            for (const [mapId, modsRecord] of Object.entries(mapsRecord)) {
              parsedScores[uid][mapId] = {};

              for (const [mods, scoreArr] of Object.entries(modsRecord)) {
                if (!isOsuScoreMod(mods)) continue;
                parsedScores[uid][mapId][mods] = {
                  date: scoreArr[0].toDate(),
                  rank: scoreArr[1],
                  score: Number(scoreArr[2]),
                  accuracy: Number(scoreArr[3]),
                  combo: Number(scoreArr[4]),
                  points: Number(scoreArr[5]),
                };
              }
            }
          }
          allScores.value = parsedScores;
        }
      } catch (error) {
        throw error;
      }
    })();

    await loadPromise;
    loadPromise = null;
  };

  return {
    allScores,
    isLoaded,
    loadAllScores,
  };
});
