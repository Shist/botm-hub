import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore/lite";
import { type OsuMapCategory, type IOsuMap } from "@/types/osumaps";

async function loadMapsByCategoryFromFirebase(
  category: OsuMapCategory
): Promise<IOsuMap[]> {
  const db = getFirestore();
  const mapsCategoryRef = doc(db, "maps", category);

  try {
    const categoryDocSnapshot = await getDoc(mapsCategoryRef);
    const mapsArr: Omit<IOsuMap, "link" | "category">[] =
      categoryDocSnapshot.data()?.maps ?? [];

    const formattedMapsArr: IOsuMap[] = mapsArr.map((map) => {
      return {
        link: `https://osu.ppy.sh/b/${map.id}`,
        category,
        ...map,
      };
    });

    return formattedMapsArr;
  } catch (error) {
    console.error(`Ошибка при загрузке карт для категории ${category}:`, error);
    return [];
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

export { loadMapsByCategoryFromFirebase, uploadMapsToFirebase };
