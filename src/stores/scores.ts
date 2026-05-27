import { ref } from "vue";
import { defineStore } from "pinia";
import { Timestamp } from "firebase/firestore/lite";
import {
  loadAllScoresFromFirebase,
  uploadScoresToFirebase,
} from "@/services/firebase/scores";
import {
  type IAllScores,
  type IFirebaseScoreRecord,
  type IMpModalScore,
  isOsuScoreMod,
} from "@/types/scores";

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
    isLoaded.value = true;
  };

  const uploadScores = async (uid: string, newScores: IMpModalScore[]) => {
    if (!uid || newScores.length === 0) return;

    const formattedForFirebase: Record<
      string,
      Record<string, IFirebaseScoreRecord>
    > = {};

    newScores.forEach((score) => {
      if (!score.mapId) return;

      const mapIdStr = String(score.mapId);
      const rawModKey = (
        score.mods && score.mods.length ? score.mods.join("") : "nm"
      ).toLowerCase();

      if (isOsuScoreMod(rawModKey)) {
        formattedForFirebase[mapIdStr] ??= {};

        const scoreTimestamp = Timestamp.fromDate(score.date);
        const accToSave = Math.round(score.accuracy * 10000) / 100;

        formattedForFirebase[mapIdStr][rawModKey] = [
          scoreTimestamp,
          score.rank,
          String(score.score),
          String(accToSave),
          String(score.combo),
          score.points.toFixed(2),
        ];
      }
    });

    if (Object.keys(formattedForFirebase).length === 0) return;

    await uploadScoresToFirebase(uid, formattedForFirebase);

    newScores.forEach((score) => {
      if (!score.mapId) return;

      const mapIdStr = String(score.mapId);
      const rawModKey = (
        score.mods && score.mods.length ? score.mods.join("") : "nm"
      ).toLowerCase();

      if (isOsuScoreMod(rawModKey)) {
        allScores.value[uid] ??= {};

        const userScores = allScores.value[uid];

        userScores[mapIdStr] ??= {};

        const mapScores = userScores[mapIdStr];

        const accToSave = Math.round(score.accuracy * 10000) / 100;

        mapScores[rawModKey] = {
          date: score.date,
          rank: score.rank,
          score: score.score,
          accuracy: accToSave,
          combo: score.combo,
          points: Number(score.points.toFixed(2)),
        };
      }
    });
  };

  return {
    allScores,
    isLoaded,
    loadAllScores,
    uploadScores,
  };
});
