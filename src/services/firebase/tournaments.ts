import {
  getFirestore,
  doc,
  runTransaction,
  getDoc,
  arrayUnion,
} from "firebase/firestore/lite";
import {
  type IAllTournamentsFirebaseIncomingItem,
  type IAllTournamentsFirebaseOutgoingItem,
} from "@/types/tournaments";

async function loadAllTournamentsFromFirebase(): Promise<
  IAllTournamentsFirebaseIncomingItem[]
> {
  const db = getFirestore();

  const allTournamentsDoc = doc(db, "tournaments", "allTournaments");

  const allTournamentsSnapshot = await getDoc(allTournamentsDoc);
  const allTournamentsDocData = allTournamentsSnapshot.data();
  const allTournaments =
    allTournamentsDocData?.allTournaments as IAllTournamentsFirebaseIncomingItem[];

  return allTournaments.sort(
    (a, b) => a.datesInfo.startDate.seconds - b.datesInfo.startDate.seconds
  );
}

async function uploadTournamentToFirebase(
  tournament: IAllTournamentsFirebaseOutgoingItem
) {
  const db = getFirestore();

  const allTournamentsDocRef = doc(db, "tournaments", "allTournaments");

  await runTransaction(db, async (transaction) => {
    transaction.update(allTournamentsDocRef, {
      allTournaments: arrayUnion(tournament),
    });
  });
}

async function updateTournamentToFirebase(
  tournament: IAllTournamentsFirebaseOutgoingItem
) {
  const db = getFirestore();
  await runTransaction(db, async (transaction) => {
    const allTournamentsDocRef = doc(db, "tournaments", "allTournaments");

    const allTournamentsDoc = await transaction.get(allTournamentsDocRef);
    const allTournaments: IAllTournamentsFirebaseOutgoingItem[] = (
      (allTournamentsDoc.data()?.allTournaments ??
        []) as IAllTournamentsFirebaseIncomingItem[]
    ).map((t) => ({
      ...t,
      datesInfo: {
        startDate: t.datesInfo.startDate.toDate(),
        endDate: t.datesInfo.endDate.toDate(),
      },
    }));

    const existingTournamentIndex = allTournaments.findIndex(
      (t) => t.id === tournament.id
    );
    if (existingTournamentIndex === -1) {
      throw new Error(`Турнир с id = ${tournament.id} не найден в базе!`);
    }
    allTournaments[existingTournamentIndex] = tournament;

    transaction.update(allTournamentsDocRef, { allTournaments });
  });
}

async function deleteTournamentFromFirebase(tournamentId: string) {
  const db = getFirestore();
  await runTransaction(db, async (transaction) => {
    const allTournamentsDocRef = doc(db, "tournaments", "allTournaments");

    const allTournamentsDoc = await transaction.get(allTournamentsDocRef);
    const allTournaments: IAllTournamentsFirebaseOutgoingItem[] = (
      (allTournamentsDoc.data()?.allTournaments ??
        []) as IAllTournamentsFirebaseIncomingItem[]
    ).map((t) => ({
      ...t,
      datesInfo: {
        startDate: t.datesInfo.startDate.toDate(),
        endDate: t.datesInfo.endDate.toDate(),
      },
    }));

    const existingTournamentIndex = allTournaments.findIndex(
      (t) => t.id === tournamentId
    );
    if (existingTournamentIndex === -1) {
      throw new Error(`Турнир с id = ${tournamentId} не найден в базе!`);
    }
    allTournaments.splice(existingTournamentIndex, 1);

    transaction.update(allTournamentsDocRef, { allTournaments });
  });
}

async function archiveTournamentInFirebase(tournamentId: string) {
  const db = getFirestore();
  await runTransaction(db, async (transaction) => {
    const allTournamentsDocRef = doc(db, "tournaments", "allTournaments");

    const allTournamentsDoc = await transaction.get(allTournamentsDocRef);
    const allTournaments: IAllTournamentsFirebaseOutgoingItem[] = (
      (allTournamentsDoc.data()?.allTournaments ??
        []) as IAllTournamentsFirebaseIncomingItem[]
    ).map((t) => ({
      ...t,
      datesInfo: {
        startDate: t.datesInfo.startDate.toDate(),
        endDate: t.datesInfo.endDate.toDate(),
      },
    }));

    const existingTournamentIndex = allTournaments.findIndex(
      (t) => t.id === tournamentId
    );
    if (existingTournamentIndex === -1) {
      throw new Error(`Турнир с id = ${tournamentId} не найден в базе!`);
    }
    if (allTournaments[existingTournamentIndex]) {
      allTournaments[existingTournamentIndex].isArchived = true;
    }

    transaction.update(allTournamentsDocRef, { allTournaments });
  });
}

export {
  loadAllTournamentsFromFirebase,
  uploadTournamentToFirebase,
  updateTournamentToFirebase,
  deleteTournamentFromFirebase,
  archiveTournamentInFirebase,
};
