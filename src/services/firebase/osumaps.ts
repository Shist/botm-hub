import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore/lite";
import { OsuMapCategory, type IOsuMap } from "@/types/osumaps";

async function loadAllMapsFromFirebase(): Promise<IOsuMap[]> {
  const db = getFirestore();
  const mapsColRef = collection(db, "maps");
  const allMaps: IOsuMap[] = [];

  try {
    const snapshot = await getDocs(mapsColRef);

    snapshot.docs.forEach((docSnap) => {
      const category = docSnap.id as OsuMapCategory;
      const mapsArr: Omit<IOsuMap, "link" | "category">[] =
        docSnap.data().maps ?? [];

      mapsArr.forEach((map) => {
        allMaps.push({
          link: `https://osu.ppy.sh/b/${map.id}`,
          category,
          ...map,
        });
      });
    });

    return allMaps;
  } catch (error) {
    console.error("Ошибка при загрузке всех карт:", error);
    throw error;
  }
}

async function uploadMapsToFirebase(maps: Omit<IOsuMap, "link">[]) {
  const db = getFirestore();

  const categorizedMaps: Partial<
    Record<OsuMapCategory, Omit<IOsuMap, "link" | "category">[]>
  > = {};
  maps.forEach((map) => {
    const category = map.category;
    if (!categorizedMaps[category]) categorizedMaps[category] = [];
    const { category: _, ...mapInfo } = map;
    categorizedMaps[category].push(mapInfo);
  });

  for (const category in categorizedMaps) {
    const mapsToUpload = categorizedMaps[category as OsuMapCategory] ?? [];

    const categoryDocRef = doc(db, "maps", category);
    const categoryDoc = await getDoc(categoryDocRef);
    const categoryMaps = (categoryDoc.data()?.maps ?? []) as Omit<
      IOsuMap,
      "link" | "category"
    >[];

    for (const map of mapsToUpload) {
      const mapId = map.id;

      if (categoryMaps.some((m) => m.id === mapId)) {
        console.error(
          `[${category}] Карта с ID = ${mapId} уже существует. Пропуск...`
        );
        continue;
      }

      try {
        await updateDoc(categoryDocRef, { maps: arrayUnion(map) });
        console.log(`[${category}] Карта с ID = ${mapId} успешно добавлена`);
      } catch (error) {
        console.error(
          `[${category}] Ошибка при добавлении карты с ID = ${mapId}:`,
          error
        );
      }
    }
  }
}

export { loadAllMapsFromFirebase, uploadMapsToFirebase };
