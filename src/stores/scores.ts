import { ref } from "vue";
import { defineStore } from "pinia";
import { Timestamp } from "firebase/firestore/lite";
import {
  loadAllScoresFromFirebase,
  uploadScoresToFirebase,
} from "@/services/firebase/scores";
import { useMetaStore } from "@/stores/meta";
import { useUsersStore } from "@/stores/users";
import { useOsumapsStore } from "@/stores/osumaps";
import { OsuMapCategory } from "@/types/osumaps";
import {
  type IAllScores,
  type IFirebaseScoreRecord,
  type IMpModalScore,
  type IScoreTableRow,
  type OsuScoreMod,
  isOsuScoreMod,
} from "@/types/scores";

export const useScoresStore = defineStore("scores", () => {
  const metaStore = useMetaStore();
  const osumapsStore = useOsumapsStore();
  const usersStore = useUsersStore();

  const allScores = ref<IAllScores>({});

  const isLoaded = ref(false);
  let loadPromise: Promise<void> | null = null;

  const getFlatScoresTableData = (
    uidsFilter?: string[],
    mapIdsFilter?: number[]
  ): IScoreTableRow[] => {
    const flatScores: IScoreTableRow[] = [];

    const allUsersMap = new Map(usersStore.users.map((u) => [u.uid, u]));

    const allMapsList = Object.values(osumapsStore.osumaps).flat();
    const mapsDataMap = new Map<
      number,
      { mapsetId: number; name: string; categories: OsuMapCategory[] }
    >();

    allMapsList.forEach((m) => {
      if (!mapsDataMap.has(m.id)) {
        mapsDataMap.set(m.id, {
          mapsetId: m.mapsetId,
          name: m.name,
          categories: [],
        });
      }
      const data = mapsDataMap.get(m.id)!;
      if (!data.categories.includes(m.category)) {
        data.categories.push(m.category);
      }
    });

    for (const [uid, mapsRecord] of Object.entries(allScores.value)) {
      if (uidsFilter && !uidsFilter.includes(uid)) continue;

      const userInfo = allUsersMap.get(uid);
      if (!userInfo) continue;

      for (const [mapIdStr, modsRecord] of Object.entries(mapsRecord)) {
        const mapIdNum = Number(mapIdStr);
        if (mapIdsFilter && !mapIdsFilter.includes(mapIdNum)) continue;

        const mapData = mapsDataMap.get(mapIdNum);
        if (!mapData) continue;

        for (const [modKey, scoreData] of Object.entries(modsRecord)) {
          flatScores.push({
            uidWithMapIdAndMods: `${uid}-${mapIdNum}-${modKey}`,
            uid,
            user: userInfo,
            mapId: mapIdNum,
            mapsetId: mapData.mapsetId,
            mapCategories: mapData.categories,
            mapName: mapData.name,
            mods: modKey as OsuScoreMod,
            date: scoreData.date,
            rank: scoreData.rank,
            score: scoreData.score,
            accuracy: scoreData.accuracy,
            combo: scoreData.combo,
            points: scoreData.points,
          });
        }
      }
    }

    return flatScores;
  };

  const loadAllScores = async () => {
    if (isLoaded.value) return;
    if (loadPromise) return loadPromise;

    const chunksCount = metaStore.metaConfig?.chunks?.scores ?? 1;

    loadPromise = (async () => {
      try {
        const rawDataArray = await loadAllScoresFromFirebase(chunksCount);

        const parsedScores: IAllScores = {};

        for (const rawData of rawDataArray) {
          if (!rawData) continue;

          for (const [uid, mapsRecord] of Object.entries(rawData)) {
            parsedScores[uid] ??= {};

            for (const [mapId, modsRecord] of Object.entries(mapsRecord)) {
              parsedScores[uid][mapId] ??= {};

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
        }
        allScores.value = parsedScores;
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

    const newChunksCount = await uploadScoresToFirebase(
      uid,
      formattedForFirebase
    );
    if (newChunksCount && metaStore.metaConfig) {
      metaStore.metaConfig.chunks.scores = newChunksCount;
    }

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
    getFlatScoresTableData,
    loadAllScores,
    uploadScores,
  };
});
