import { getFirestore, doc, getDoc } from "firebase/firestore/lite";
import { type IAllScoresFirebase } from "@/types/scores";

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

export { loadAllScoresFromFirebase };
