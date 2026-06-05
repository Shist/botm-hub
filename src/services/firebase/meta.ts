import { getFirestore, doc, getDoc } from "firebase/firestore/lite";
import { type IMetaConfig } from "@/types/meta";

async function loadMetaFromFirebase(): Promise<IMetaConfig | null> {
  const db = getFirestore();
  const metaRef = doc(db, "global", "meta");

  try {
    const snap = await getDoc(metaRef);
    if (!snap.exists()) return null;
    return snap.data() as IMetaConfig;
  } catch (error) {
    console.error("Ошибка при загрузке meta-конфига:", error);
    return null;
  }
}

export { loadMetaFromFirebase };
