import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore/lite";
import {
  OsuMapCategory,
  type IOsuMap,
  type IUploadMapLog,
} from "@/types/osumaps";

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

async function uploadMapsToFirebase(
  maps: Omit<IOsuMap, "link">[]
): Promise<IUploadMapLog[]> {
  const db = getFirestore();
  const logs: IUploadMapLog[] = [];
  let hasAnyChanges = false;

  const categorizedMaps: Partial<
    Record<OsuMapCategory, Omit<IOsuMap, "link" | "category">[]>
  > = {};

  maps.forEach((map) => {
    const category = map.category;
    if (!categorizedMaps[category]) categorizedMaps[category] = [];
    const { category: _, ...mapInfo } = map;
    categorizedMaps[category]!.push(mapInfo);
  });

  for (const category in categorizedMaps) {
    const mapsToUpload = categorizedMaps[category as OsuMapCategory] ?? [];
    if (!mapsToUpload.length) continue;

    const categoryDocRef = doc(db, "maps", category);

    try {
      const categoryDoc = await getDoc(categoryDocRef);
      const currentMaps = (categoryDoc.data()?.maps ?? []) as Omit<
        IOsuMap,
        "link" | "category"
      >[];

      let isCategoryChanged = false;
      const updatedMapsArray = [...currentMaps];

      for (const newMap of mapsToUpload) {
        const existingIndex = updatedMapsArray.findIndex(
          (m) => m.id === newMap.id
        );
        const existingMap = updatedMapsArray[existingIndex];
        const logMapName = `[ID: ${newMap.id}] ${newMap.name}`;

        if (existingIndex !== -1 && existingMap) {
          const oldComment = existingMap.comment ?? "";
          const newCommentPart = (newMap.comment ?? "").trim();

          if (!newCommentPart) {
            logs.push({
              mapName: logMapName,
              type: "updated",
              message: `[${category.toUpperCase()}] Карта уже существует, а новый комментарий пуст. Пропущена.`,
            });
            continue;
          }

          const existingTags = oldComment
            .split(";")
            .map((t) => t.trim())
            .filter(Boolean);

          if (existingTags.includes(newCommentPart)) {
            logs.push({
              mapName: logMapName,
              type: "updated",
              message: `[${category.toUpperCase()}] Карта уже содержит комментарий "${newCommentPart}". Пропущена.`,
            });
            continue;
          }

          const mergedComment = oldComment
            ? `${oldComment}; ${newCommentPart}`
            : newCommentPart;

          updatedMapsArray[existingIndex] = {
            ...existingMap,
            comment: mergedComment,
          };

          isCategoryChanged = true;
          hasAnyChanges = true;

          logs.push({
            mapName: logMapName,
            type: "updated",
            message: `[${category.toUpperCase()}] Обновлён комментарий: "${oldComment}" ➔ "${mergedComment}"`,
          });
        } else {
          updatedMapsArray.push(newMap);
          isCategoryChanged = true;
          hasAnyChanges = true;

          logs.push({
            mapName: logMapName,
            type: "added",
            message: `[${category.toUpperCase()}] Успешно добавлена новая карта!`,
          });
        }
      }

      if (isCategoryChanged) {
        await updateDoc(categoryDocRef, { maps: updatedMapsArray });
      }
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Ошибка БД";
      logs.push({
        mapName: `Категория ${category}`,
        type: "error",
        message: `Ошибка при обработке категории: ${errorMsg}`,
      });
    }
  }

  if (hasAnyChanges) {
    try {
      const metaDocRef = doc(db, "global", "meta");
      await updateDoc(metaDocRef, {
        mapsUpdatedAt: Timestamp.now(),
      });
      logs.push({
        mapName: "Метаданные системы",
        type: "added",
        message: "Таймстемп mapsUpdatedAt в /global/meta успешно обновлён!",
      });
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Ошибка БД";
      logs.push({
        mapName: "Метаданные системы",
        type: "error",
        message: `Не удалось обновить mapsUpdatedAt: ${errorMsg}`,
      });
    }
  }

  return logs;
}

export { loadAllMapsFromFirebase, uploadMapsToFirebase };
