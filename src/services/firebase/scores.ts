import {
  getFirestore,
  doc,
  getDoc,
  runTransaction,
} from "firebase/firestore/lite";
import { CHUNKS_LIMITS } from "@/constants";
import {
  type IAllScoresFirebase,
  type IFirebaseScoreRecord,
} from "@/types/scores";
import { type IMetaConfig } from "@/types/meta";

async function loadAllScoresFromFirebase(
  chunksCount: number
): Promise<IAllScoresFirebase[]> {
  const db = getFirestore();
  const promises = [];

  for (let k = 1; k <= chunksCount; k++) {
    const scoresDocRef = doc(db, "scores", `scores${k}`);
    promises.push(getDoc(scoresDocRef));
  }

  try {
    const snapshots = await Promise.all(promises);
    return snapshots.map((snap) =>
      snap.exists() ? (snap.data() as IAllScoresFirebase) : {}
    );
  } catch (error) {
    console.error("Ошибка при загрузке всех скоров:", error);
    return [];
  }
}

async function uploadScoresToFirebase(
  uid: string,
  formattedScores: Record<string, Record<string, IFirebaseScoreRecord>>
): Promise<number | null> {
  const db = getFirestore();
  const metaRef = doc(db, "global", "meta");
  try {
    let updatedChunksCount: number | null = null;
    await runTransaction(db, async (transaction) => {
      const metaSnap = await transaction.get(metaRef);
      const metaData = (
        metaSnap.exists() ? metaSnap.data() : {}
      ) as IMetaConfig;
      let currentChunkNum = metaData.chunks?.scores ?? 1;

      let targetChunkRef = doc(db, "scores", `scores${currentChunkNum}`);
      const chunkSnap = await transaction.get(targetChunkRef);
      let targetChunkData = (
        chunkSnap.exists() ? chunkSnap.data() : {}
      ) as IAllScoresFirebase;

      let currentScoreCount = 0;
      for (const i in targetChunkData) {
        for (const j in targetChunkData[i]) {
          currentScoreCount += Object.keys(targetChunkData[i][j] ?? {}).length;
        }
      }

      let newScoresCount = 0;
      for (const fsKey in formattedScores) {
        newScoresCount += Object.keys(formattedScores[fsKey] ?? {}).length;
      }

      if (currentScoreCount + newScoresCount > CHUNKS_LIMITS.SCORES) {
        currentChunkNum++;
        updatedChunksCount = currentChunkNum;
        targetChunkRef = doc(db, "scores", `scores${currentChunkNum}`);
        targetChunkData = {};

        transaction.update(metaRef, { "chunks.scores": currentChunkNum });
      }

      const currentUserScores = { ...(targetChunkData[uid] ?? {}) };

      for (const [mapId, modsRecord] of Object.entries(formattedScores)) {
        currentUserScores[mapId] ??= {};

        for (const [modKey, scoreRecord] of Object.entries(modsRecord)) {
          currentUserScores[mapId][modKey] = scoreRecord;
        }
      }

      targetChunkData[uid] = currentUserScores;
      transaction.set(targetChunkRef, targetChunkData);
    });
    return updatedChunksCount;
  } catch (error) {
    console.error("Ошибка при сохранении скоров в транзакции:", error);
    throw error;
  }
}

export { loadAllScoresFromFirebase, uploadScoresToFirebase };
