import {
  getFirestore,
  doc,
  getDoc,
  runTransaction,
} from "firebase/firestore/lite";
import {
  type IAllScoresFirebase,
  type IFirebaseScoreRecord,
} from "@/types/scores";

async function loadAllScoresFromFirebase(): Promise<IAllScoresFirebase | null> {
  const db = getFirestore();
  const scoresDocRef = doc(db, "scores", "allScores");

  try {
    const snap = await getDoc(scoresDocRef);
    if (!snap.exists()) return null;

    return snap.data() as IAllScoresFirebase;
  } catch (error) {
    console.error("Ошибка при загрузке всех скоров:", error);
    return null;
  }
}

async function uploadScoresToFirebase(
  uid: string,
  formattedScores: Record<string, Record<string, IFirebaseScoreRecord>>
): Promise<void> {
  const db = getFirestore();
  const scoresDocRef = doc(db, "scores", "allScores");

  try {
    await runTransaction(db, async (transaction) => {
      const scoresDoc = await transaction.get(scoresDocRef);

      const currentScoresData = (
        scoresDoc.exists() ? scoresDoc.data() : {}
      ) as IAllScoresFirebase;

      const currentUserScores = { ...(currentScoresData[uid] ?? {}) };

      for (const [mapId, modsRecord] of Object.entries(formattedScores)) {
        currentUserScores[mapId] ??= {};

        for (const [modKey, scoreRecord] of Object.entries(modsRecord)) {
          currentUserScores[mapId][modKey] = scoreRecord;
        }
      }

      currentScoresData[uid] = currentUserScores;

      transaction.set(scoresDocRef, currentScoresData);
    });
  } catch (error) {
    console.error("Ошибка при сохранении скоров в транзакции:", error);
    throw error;
  }
}

export { loadAllScoresFromFirebase, uploadScoresToFirebase };
