import {
  getFirestore,
  doc,
  runTransaction,
  getDoc,
} from "firebase/firestore/lite";
import {
  type IAllTrainingsFirebaseIncomingItem,
  type IAllTrainingsFirebaseOutgoingItem,
} from "@/types/trainings";
import { type IMetaConfig } from "@/types/meta";
import { CHUNKS_LIMITS } from "@/constants";

async function loadAllTrainingsFromFirebase(
  chunksCount: number
): Promise<IAllTrainingsFirebaseIncomingItem[]> {
  const db = getFirestore();
  const promises = [];

  for (let k = 1; k <= chunksCount; k++) {
    promises.push(getDoc(doc(db, "trainings", `trainings${k}`)));
  }

  const allTrainings: IAllTrainingsFirebaseIncomingItem[] = [];
  try {
    const snapshots = await Promise.all(promises);
    snapshots.forEach((snap) => {
      if (snap.exists()) {
        const chunkData = snap.data()
          .allTrainings as IAllTrainingsFirebaseIncomingItem[];
        if (chunkData) allTrainings.push(...chunkData);
      }
    });

    return allTrainings.sort((a, b) => a.dateTime.seconds - b.dateTime.seconds);
  } catch (error) {
    console.error("Ошибка при загрузке качалок:", error);
    return [];
  }
}

async function mutateTrainingInChunks(
  trainingId: string,
  mutateFn: (arr: IAllTrainingsFirebaseOutgoingItem[], index: number) => void
) {
  const db = getFirestore();
  await runTransaction(db, async (transaction) => {
    const metaRef = doc(db, "global", "meta");
    const metaSnap = await transaction.get(metaRef);
    const chunksCount = metaSnap.exists()
      ? ((metaSnap.data() as IMetaConfig).chunks?.trainings ?? 1)
      : 1;

    const chunkRefs = Array.from({ length: chunksCount }, (_, i) =>
      doc(db, "trainings", `trainings${i + 1}`)
    );
    const chunkSnaps = await Promise.all(
      chunkRefs.map((ref) => transaction.get(ref))
    );

    let targetChunkIndex = -1;
    let targetItemIndex = -1;

    for (let i = 0; i < chunkSnaps.length; i++) {
      const snap = chunkSnaps[i];
      if (!snap?.exists()) continue;

      const trainingsArr = (snap.data().allTrainings ??
        []) as IAllTrainingsFirebaseIncomingItem[];
      const targetIndex = trainingsArr.findIndex((t) => t.id === trainingId);
      if (targetIndex !== -1) {
        targetChunkIndex = i;
        targetItemIndex = targetIndex;
        break;
      }
    }

    if (targetChunkIndex === -1) {
      throw new Error(`Качалочка с id = ${trainingId} не найдена в базе!`);
    }

    const targetArr: IAllTrainingsFirebaseOutgoingItem[] = (
      chunkSnaps[targetChunkIndex]?.data()?.allTrainings ?? []
    ).map((t: IAllTrainingsFirebaseIncomingItem) => ({
      ...t,
      dateTime: t.dateTime.toDate(),
    }));

    mutateFn(targetArr, targetItemIndex);
    const targetChunk = chunkRefs[targetChunkIndex];
    if (!targetChunk) {
      throw new Error(`В базе нет дока 'trainings${targetChunkIndex + 1}'!`);
    }
    transaction.update(targetChunk, { allTrainings: targetArr });
  });
}

async function uploadTrainingToFirebase(
  training: IAllTrainingsFirebaseOutgoingItem
): Promise<number | null> {
  const db = getFirestore();
  let updatedChunksCount: number | null = null;
  await runTransaction(db, async (transaction) => {
    const metaRef = doc(db, "global", "meta");
    const metaSnap = await transaction.get(metaRef);
    let chunksCount = metaSnap.exists()
      ? ((metaSnap.data() as IMetaConfig).chunks?.trainings ?? 1)
      : 1;

    let latestChunkRef = doc(db, "trainings", `trainings${chunksCount}`);
    const latestChunkSnap = await transaction.get(latestChunkRef);
    let latestArr = (
      latestChunkSnap.exists()
        ? (latestChunkSnap.data()?.allTrainings ?? [])
        : []
    ) as IAllTrainingsFirebaseOutgoingItem[];

    if (latestArr.length >= CHUNKS_LIMITS.TRAININGS) {
      chunksCount++;
      updatedChunksCount = chunksCount;
      latestChunkRef = doc(db, "trainings", `trainings${chunksCount}`);
      latestArr = [];
      transaction.update(metaRef, { "chunks.trainings": chunksCount });
    }

    latestArr.push(training);
    transaction.set(
      latestChunkRef,
      { allTrainings: latestArr },
      { merge: true }
    );
  });
  return updatedChunksCount;
}

async function updateTrainingToFirebase(
  training: IAllTrainingsFirebaseOutgoingItem
) {
  await mutateTrainingInChunks(training.id, (arr, index) => {
    arr[index] = training;
  });
}

async function deleteTrainingFromFirebase(trainingId: string) {
  await mutateTrainingInChunks(trainingId, (arr, index) => {
    arr.splice(index, 1);
  });
}

async function archiveTrainingInFirebase(trainingId: string, mpLinkId: number) {
  await mutateTrainingInChunks(trainingId, (arr, index) => {
    if (!arr[index]) return;
    arr[index].mpLinkId = mpLinkId;
    arr[index].isArchived = true;
  });
}

async function subscribeTrainingParticipantInFirebase(
  trainingId: string,
  playerUid: string
) {
  await mutateTrainingInChunks(trainingId, (arr, index) => {
    if (!arr[index]) return;
    const participantsUids = JSON.parse(
      arr[index].participantsUids
    ) as string[];
    if (participantsUids.includes(playerUid)) {
      throw new Error(`Пользователь с id = ${playerUid} уже зарегистрирован!`);
    }
    participantsUids.push(playerUid);
    arr[index].participantsUids = JSON.stringify(participantsUids);
  });
}

async function unsubscribeTrainingParticipantInFirebase(
  trainingId: string,
  playerUid: string
) {
  await mutateTrainingInChunks(trainingId, (arr, index) => {
    if (!arr[index]) return;
    const participantsUids = JSON.parse(
      arr[index].participantsUids
    ) as string[];
    const participantIndex = participantsUids.findIndex(
      (pUid) => pUid === playerUid
    );
    if (participantIndex === -1) {
      throw new Error(`Пользователь с id = ${playerUid} не зарегистрирован!`);
    }
    participantsUids.splice(participantIndex, 1);
    arr[index].participantsUids = JSON.stringify(participantsUids);
  });
}

export {
  loadAllTrainingsFromFirebase,
  uploadTrainingToFirebase,
  updateTrainingToFirebase,
  deleteTrainingFromFirebase,
  archiveTrainingInFirebase,
  subscribeTrainingParticipantInFirebase,
  unsubscribeTrainingParticipantInFirebase,
};
