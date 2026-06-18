import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { Timestamp } from "firebase/firestore/lite";
import {
  loadAllScoresFromFirebase,
  uploadScoresToFirebase,
} from "@/services/firebase/scores";
import { useMetaStore } from "@/stores/meta";
import { useUsersStore } from "@/stores/users";
import { useOsumapsStore } from "@/stores/osumaps";
import {
  getMaxScoreForMods,
  calculateBasePoints,
  calculateFinalCategoryPoints,
} from "@/utils/scores-calcs";
import {
  MAPS_CATEGORIES,
  CLUB_SETTINGS,
  VALID_MODS_FOR_CATEGORY,
} from "@/constants";
import { OsuMapCategory, isOsuMapCategory } from "@/types/osumaps";
import {
  type IAllScores,
  type IFirebaseScoreRecord,
  type IScoreUploadPayload,
  type IScoreTableRow,
  type OsuScoreMod,
  type IStatBucket,
  type IPlayerLeaderboardStats,
  isOsuScoreMod,
} from "@/types/scores";
import { BotmClub } from "@/types/clubs";

const createEmptyStatBucket = (): IStatBucket => ({
  points: 0,
  totalScores: 0,
  sumScore: 0,
  sumAcc: 0,
  sumCombo: 0,
  avgScore: 0,
  avgAcc: 0,
  avgCombo: 0,
});

export const useScoresStore = defineStore("scores", () => {
  const metaStore = useMetaStore();
  const osumapsStore = useOsumapsStore();
  const usersStore = useUsersStore();

  const allScores = ref<IAllScores>({});
  const isLoaded = ref(false);
  let loadPromise: Promise<void> | null = null;

  const leaderboardsData = computed<IPlayerLeaderboardStats[]>(() => {
    const statsMap = new Map<string, IPlayerLeaderboardStats>();

    usersStore.users.forEach((u) => {
      const clubsBuckets = {} as Record<BotmClub, IStatBucket>;
      Object.values(BotmClub).forEach((club) => {
        clubsBuckets[club] = createEmptyStatBucket();
      });

      const skillsetsBuckets = {} as Record<OsuMapCategory, IStatBucket>;
      Object.keys(MAPS_CATEGORIES).forEach((category) => {
        if (isOsuMapCategory(category)) {
          skillsetsBuckets[category] = createEmptyStatBucket();
        }
      });

      statsMap.set(u.uid, {
        uid: u.uid,
        user: u,
        overall: createEmptyStatBucket(),
        clubs: clubsBuckets,
        skillsets: skillsetsBuckets,
      });
    });

    const allMapsList = Object.values(osumapsStore.osumaps).flat();

    const mapsDataMap = new Map<number, Record<OsuMapCategory, number>>();
    allMapsList.forEach((m) => {
      if (!mapsDataMap.has(m.id)) {
        mapsDataMap.set(m.id, {} as Record<OsuMapCategory, number>);
      }
      mapsDataMap.get(m.id)![m.category] = m.starRate ?? 0;
    });

    for (const [uid, mapsRecord] of Object.entries(allScores.value)) {
      const userStats = statsMap.get(uid);
      if (!userStats) continue;

      for (const [mapIdStr, modsRecord] of Object.entries(mapsRecord)) {
        const mapIdNum = Number(mapIdStr);
        const mapCategoriesInfo = mapsDataMap.get(mapIdNum);
        if (!mapCategoriesInfo) continue;

        for (const [modKey, scoreData] of Object.entries(modsRecord)) {
          const modsArray =
            modKey === "nm"
              ? ["NM"]
              : (modKey.toUpperCase().match(/.{1,2}/g) ?? []);

          const maxScore = getMaxScoreForMods(modsArray);
          const percentage =
            maxScore > 0 ? (scoreData.score / maxScore) * 100 : 0;

          let maxOverallPoints = 0;
          const clubMaxPoints = new Map<BotmClub, number>();

          const addStatsToBucket = (bucket: IStatBucket, pts: number) => {
            bucket.points += pts;
            bucket.totalScores++;
            bucket.sumScore += scoreData.score;
            bucket.sumAcc += scoreData.accuracy;
            bucket.sumCombo += scoreData.combo;
          };

          Object.entries(mapCategoriesInfo).forEach(([catStr, stars]) => {
            const category = catStr as OsuMapCategory;
            const allowedMods = VALID_MODS_FOR_CATEGORY[category];

            if (isOsuScoreMod(modKey) && allowedMods.includes(modKey)) {
              const currentBasePoints = calculateBasePoints(percentage, stars);
              const finalCategoryPoints = calculateFinalCategoryPoints(
                currentBasePoints,
                category,
                modsArray
              );

              addStatsToBucket(
                userStats.skillsets[category],
                finalCategoryPoints
              );

              if (finalCategoryPoints > maxOverallPoints) {
                maxOverallPoints = finalCategoryPoints;
              }

              Object.values(CLUB_SETTINGS).forEach((clubConfig) => {
                const rule = clubConfig.skillsets.find(
                  (s) => s.category === category
                );
                if (rule && rule.allowedMods.includes(modKey)) {
                  const currentClubMax = clubMaxPoints.get(clubConfig.id) ?? 0;
                  if (finalCategoryPoints > currentClubMax) {
                    clubMaxPoints.set(clubConfig.id, finalCategoryPoints);
                  }
                }
              });
            }
          });

          addStatsToBucket(userStats.overall, maxOverallPoints);

          for (const [clubId, maxClubPoints] of clubMaxPoints.entries()) {
            addStatsToBucket(userStats.clubs[clubId], maxClubPoints);
          }
        }
      }
    }

    const result = Array.from(statsMap.values()).map((stats) => {
      const finalizeBucket = (bucket: IStatBucket) => {
        if (bucket.totalScores > 0) {
          bucket.points = Math.round(bucket.points * 100) / 100;
          bucket.avgScore = Math.round(bucket.sumScore / bucket.totalScores);
          bucket.avgAcc = Number(
            (bucket.sumAcc / bucket.totalScores).toFixed(2)
          );
          bucket.avgCombo = Math.round(bucket.sumCombo / bucket.totalScores);
        }
      };

      finalizeBucket(stats.overall);
      Object.values(stats.clubs).forEach(finalizeBucket);
      Object.values(stats.skillsets).forEach(finalizeBucket);

      return stats;
    });

    return result.sort((a, b) => b.overall.points - a.overall.points);
  });

  const getFlatScoresTableData = (
    uidsFilter?: string[],
    mapIdsFilter?: number[]
  ): IScoreTableRow[] => {
    const flatScores: IScoreTableRow[] = [];
    const allUsersMap = new Map(usersStore.users.map((u) => [u.uid, u]));
    const allMapsList = Object.values(osumapsStore.osumaps).flat();
    const mapsDataMap = new Map<
      number,
      {
        mapsetId: number;
        name: string;
        categories: { category: OsuMapCategory; stars: number }[];
      }
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
      if (!data.categories.find((c) => c.category === m.category)) {
        data.categories.push({ category: m.category, stars: m.starRate ?? 0 });
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
          const scoreNum = scoreData.score;
          const modsArray =
            modKey === "nm"
              ? ["NM"]
              : (modKey.toUpperCase().match(/.{1,2}/g) ?? []);

          const maxScore = getMaxScoreForMods(modsArray);
          const percentage = maxScore > 0 ? (scoreNum / maxScore) * 100 : 0;

          let maxFinalPoints = 0;
          let bestBasePoints = 0;

          if (mapData.categories.length > 0) {
            mapData.categories.forEach((catInfo) => {
              const allowedMods = VALID_MODS_FOR_CATEGORY[catInfo.category];
              if (isOsuScoreMod(modKey) && allowedMods.includes(modKey)) {
                const currentBasePts = calculateBasePoints(
                  percentage,
                  catInfo.stars
                );
                const finalPts = calculateFinalCategoryPoints(
                  currentBasePts,
                  catInfo.category,
                  modsArray
                );

                if (finalPts > maxFinalPoints) {
                  maxFinalPoints = finalPts;
                  bestBasePoints = currentBasePts;
                }
              }
            });
          }

          flatScores.push({
            uidWithMapIdAndMods: `${uid}-${mapIdNum}-${modKey}`,
            uid,
            user: userInfo,
            mapId: mapIdNum,
            mapsetId: mapData.mapsetId,
            mapCategories: mapData.categories.map((c) => c.category),
            mapName: mapData.name,
            mods: modKey as OsuScoreMod,
            date: scoreData.date,
            rank: scoreData.rank,
            score: scoreData.score,
            accuracy: scoreData.accuracy,
            combo: scoreData.combo,
            basePoints: bestBasePoints,
            points: maxFinalPoints,
            percentage: percentage,
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

  const uploadScores = async (
    uid: string,
    newScores: IScoreUploadPayload[]
  ) => {
    if (!uid || newScores.length === 0) return;

    const formattedForFirebase: Record<
      string,
      Record<string, IFirebaseScoreRecord>
    > = {};

    newScores.forEach(({ mapId, mods, score }) => {
      const mapIdStr = String(mapId);
      const rawModKey = (
        mods && mods.length ? mods.join("") : "nm"
      ).toLowerCase();

      if (isOsuScoreMod(rawModKey)) {
        formattedForFirebase[mapIdStr] ??= {};

        const scoreDate =
          score.date instanceof Date ? score.date : new Date(score.date);
        const scoreTimestamp = Timestamp.fromDate(scoreDate);
        const accToSave = Math.round(score.accuracy * 10000) / 100;

        formattedForFirebase[mapIdStr][rawModKey] = [
          scoreTimestamp,
          score.rank,
          String(score.score),
          String(accToSave),
          String(score.combo),
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

    newScores.forEach(({ mapId, mods, score }) => {
      const mapIdStr = String(mapId);
      const rawModKey = (
        mods && mods.length ? mods.join("") : "nm"
      ).toLowerCase();

      if (isOsuScoreMod(rawModKey)) {
        allScores.value[uid] ??= {};
        const userScores = allScores.value[uid];
        userScores[mapIdStr] ??= {};
        const mapScores = userScores[mapIdStr];

        const accToSave = Math.round(score.accuracy * 10000) / 100;

        mapScores[rawModKey] = {
          date: score.date instanceof Date ? score.date : new Date(score.date),
          rank: score.rank,
          score: score.score,
          accuracy: accToSave,
          combo: score.combo,
        };
      }
    });
  };

  return {
    allScores,
    leaderboardsData,
    isLoaded,
    getFlatScoresTableData,
    loadAllScores,
    uploadScores,
  };
});
