import {
  getFirestore,
  doc,
  runTransaction,
  getDoc,
} from "firebase/firestore/lite";
import { CHUNKS_LIMITS } from "@/constants";
import {
  type IAllTournamentsFirebaseIncomingItem,
  type IAllTournamentsFirebaseOutgoingItem,
} from "@/types/tournaments";
import { type IMetaConfig } from "@/types/meta";

async function loadAllTournamentsFromFirebase(
  chunksCount: number
): Promise<IAllTournamentsFirebaseIncomingItem[]> {
  const db = getFirestore();
  const promises = [];

  for (let k = 1; k <= chunksCount; k++) {
    promises.push(getDoc(doc(db, "tournaments", `tournaments${k}`)));
  }

  const allTournaments: IAllTournamentsFirebaseIncomingItem[] = [];
  try {
    const snapshots = await Promise.all(promises);
    snapshots.forEach((snap) => {
      if (snap.exists()) {
        const chunkData = snap.data()
          .allTournaments as IAllTournamentsFirebaseIncomingItem[];
        if (chunkData) allTournaments.push(...chunkData);
      }
    });

    return allTournaments.sort(
      (a, b) => a.datesInfo.startDate.seconds - b.datesInfo.startDate.seconds
    );
  } catch (error) {
    console.error("Ошибка при загрузке турниров:", error);
    return [];
  }
}

async function mutateTournamentInChunks(
  tournamentId: string,
  mutateFn: (arr: IAllTournamentsFirebaseOutgoingItem[], index: number) => void
) {
  const db = getFirestore();
  await runTransaction(db, async (transaction) => {
    const metaRef = doc(db, "global", "meta");
    const metaSnap = await transaction.get(metaRef);
    const chunksCount = metaSnap.exists()
      ? ((metaSnap.data() as IMetaConfig).chunks?.tournaments ?? 1)
      : 1;

    const chunkRefs = Array.from({ length: chunksCount }, (_, i) =>
      doc(db, "tournaments", `tournaments${i + 1}`)
    );
    const chunkSnaps = await Promise.all(
      chunkRefs.map((ref) => transaction.get(ref))
    );

    let targetChunkIndex = -1;
    let targetItemIndex = -1;

    for (let i = 0; i < chunkSnaps.length; i++) {
      const snap = chunkSnaps[i];
      if (!snap?.exists()) continue;

      const tournamentsArr = (snap.data().allTournaments ??
        []) as IAllTournamentsFirebaseIncomingItem[];
      const targetIndex = tournamentsArr.findIndex(
        (t) => t.id === tournamentId
      );
      if (targetIndex !== -1) {
        targetChunkIndex = i;
        targetItemIndex = targetIndex;
        break;
      }
    }

    if (targetChunkIndex === -1) {
      throw new Error(`Турнир с id = ${tournamentId} не найден в базе!`);
    }

    const targetArr: IAllTournamentsFirebaseOutgoingItem[] = (
      chunkSnaps[targetChunkIndex]?.data()?.allTournaments ?? []
    ).map((t: IAllTournamentsFirebaseIncomingItem) => ({
      ...t,
      datesInfo: {
        startDate: t.datesInfo.startDate.toDate(),
        endDate: t.datesInfo.endDate.toDate(),
      },
    }));

    mutateFn(targetArr, targetItemIndex);
    const targetChunk = chunkRefs[targetChunkIndex];
    if (!targetChunk) {
      throw new Error(`В базе нет дока 'tournaments${targetChunkIndex + 1}'!`);
    }
    transaction.update(targetChunk, { allTournaments: targetArr });
  });
}

async function uploadTournamentToFirebase(
  tournament: IAllTournamentsFirebaseOutgoingItem
): Promise<number | null> {
  const db = getFirestore();
  let updatedChunksCount: number | null = null;
  await runTransaction(db, async (transaction) => {
    const metaRef = doc(db, "global", "meta");
    const metaSnap = await transaction.get(metaRef);
    let chunksCount = metaSnap.exists()
      ? ((metaSnap.data() as IMetaConfig).chunks?.tournaments ?? 1)
      : 1;

    let latestChunkRef = doc(db, "tournaments", `tournaments${chunksCount}`);
    const latestChunkSnap = await transaction.get(latestChunkRef);
    let latestArr = (
      latestChunkSnap.exists()
        ? (latestChunkSnap.data()?.allTournaments ?? [])
        : []
    ) as IAllTournamentsFirebaseOutgoingItem[];

    if (latestArr.length >= CHUNKS_LIMITS.TOURNAMENTS) {
      chunksCount++;
      updatedChunksCount = chunksCount;
      latestChunkRef = doc(db, "tournaments", `tournaments${chunksCount}`);
      latestArr = [];
      transaction.update(metaRef, { "chunks.tournaments": chunksCount });
    }

    latestArr.push(tournament);
    transaction.set(
      latestChunkRef,
      { allTournaments: latestArr },
      { merge: true }
    );
  });
  return updatedChunksCount;
}

async function updateTournamentToFirebase(
  tournament: IAllTournamentsFirebaseOutgoingItem
) {
  await mutateTournamentInChunks(tournament.id, (arr, index) => {
    arr[index] = tournament;
  });
}

async function deleteTournamentFromFirebase(tournamentId: string) {
  await mutateTournamentInChunks(tournamentId, (arr, index) => {
    arr.splice(index, 1);
  });
}

async function archiveTournamentInFirebase(tournamentId: string) {
  await mutateTournamentInChunks(tournamentId, (arr, index) => {
    if (!arr[index]) return;
    arr[index].isArchived = true;
  });
}

export {
  loadAllTournamentsFromFirebase,
  uploadTournamentToFirebase,
  updateTournamentToFirebase,
  deleteTournamentFromFirebase,
  archiveTournamentInFirebase,
};
