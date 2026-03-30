import {
  getFirestore,
  doc,
  runTransaction,
  getDoc,
  arrayUnion,
} from "firebase/firestore/lite";
import {
  type IAllTrainingsFirebaseIncomingItem,
  type IAllTrainingsFirebaseOutgoingItem,
} from "@/types/trainings";

async function loadAllTrainingsFromFirebase(): Promise<
  IAllTrainingsFirebaseIncomingItem[]
> {
  const db = getFirestore();

  const allTrainingsDoc = doc(db, "trainings", "allTrainings");

  const allTrainingsSnapshot = await getDoc(allTrainingsDoc);
  const allTrainingsDocData = allTrainingsSnapshot.data();
  const allTrainings: IAllTrainingsFirebaseIncomingItem[] =
    allTrainingsDocData?.allTrainings;

  return allTrainings.sort((a, b) => a.dateTime.seconds - b.dateTime.seconds);
}

async function uploadTrainingToFirebase(
  training: IAllTrainingsFirebaseOutgoingItem
) {
  const db = getFirestore();

  const allTrainingsDocRef = doc(db, "trainings", "allTrainings");

  await runTransaction(db, async (transaction) => {
    transaction.update(allTrainingsDocRef, {
      allTrainings: arrayUnion(training),
    });
  });
}

async function updateTrainingToFirebase(
  training: IAllTrainingsFirebaseOutgoingItem
) {
  const db = getFirestore();
  await runTransaction(db, async (transaction) => {
    const allTrainingsDocRef = doc(db, "trainings", "allTrainings");

    const allTrainingsDoc = await transaction.get(allTrainingsDocRef);
    const allTrainings: IAllTrainingsFirebaseOutgoingItem[] = (
      allTrainingsDoc.data()?.allTrainings ?? []
    ).map((t: IAllTrainingsFirebaseIncomingItem) => ({
      ...t,
      dateTime: t.dateTime.toDate(),
    }));

    const existingTrainingIndex = allTrainings.findIndex(
      (t) => t.id === training.id
    );
    if (existingTrainingIndex === -1) {
      throw new Error(`Качалочка с id = ${training.id} не найдена в базе!`);
    }
    allTrainings[existingTrainingIndex] = training;

    transaction.update(allTrainingsDocRef, { allTrainings });
  });
}

async function deleteTrainingFromFirebase(trainingId: string) {
  const db = getFirestore();
  await runTransaction(db, async (transaction) => {
    const allTrainingsDocRef = doc(db, "trainings", "allTrainings");

    const allTrainingsDoc = await transaction.get(allTrainingsDocRef);
    const allTrainings: IAllTrainingsFirebaseOutgoingItem[] = (
      allTrainingsDoc.data()?.allTrainings ?? []
    ).map((t: IAllTrainingsFirebaseIncomingItem) => ({
      ...t,
      dateTime: t.dateTime.toDate(),
    }));

    const existingTrainingIndex = allTrainings.findIndex(
      (t) => t.id === trainingId
    );
    if (existingTrainingIndex === -1) {
      throw new Error(`Качалочка с id = ${trainingId} не найдена в базе!`);
    }
    allTrainings.splice(existingTrainingIndex, 1);

    transaction.update(allTrainingsDocRef, { allTrainings });
  });
}

async function archiveTrainingInFirebase(trainingId: string, mpLinkId: number) {
  const db = getFirestore();
  await runTransaction(db, async (transaction) => {
    const allTrainingsDocRef = doc(db, "trainings", "allTrainings");

    const allTrainingsDoc = await transaction.get(allTrainingsDocRef);
    const allTrainings: IAllTrainingsFirebaseOutgoingItem[] = (
      allTrainingsDoc.data()?.allTrainings ?? []
    ).map((t: IAllTrainingsFirebaseIncomingItem) => ({
      ...t,
      dateTime: t.dateTime.toDate(),
    }));

    const existingTrainingIndex = allTrainings.findIndex(
      (t) => t.id === trainingId
    );
    if (existingTrainingIndex === -1) {
      throw new Error(`Качалочка с id = ${trainingId} не найдена в базе!`);
    }
    if (allTrainings[existingTrainingIndex]) {
      allTrainings[existingTrainingIndex].mpLinkId = mpLinkId;
      allTrainings[existingTrainingIndex].isArchived = true;
    }

    transaction.update(allTrainingsDocRef, { allTrainings });
  });
}

async function subscribeTrainingParticipantInFirebase(
  trainingId: string,
  playerUid: string
) {
  const db = getFirestore();
  await runTransaction(db, async (transaction) => {
    const allTrainingsDocRef = doc(db, "trainings", "allTrainings");

    const allTrainingsDoc = await transaction.get(allTrainingsDocRef);
    const allTrainings: IAllTrainingsFirebaseOutgoingItem[] = (
      allTrainingsDoc.data()?.allTrainings ?? []
    ).map((t: IAllTrainingsFirebaseIncomingItem) => ({
      ...t,
      dateTime: t.dateTime.toDate(),
    }));

    const existingTrainingIndex = allTrainings.findIndex(
      (t) => t.id === trainingId
    );
    if (existingTrainingIndex === -1) {
      throw new Error(`Качалочка с id = ${trainingId} не найдена в базе!`);
    }
    if (allTrainings[existingTrainingIndex]) {
      const participantsUids = JSON.parse(
        allTrainings[existingTrainingIndex].participantsUids
      ) as string[];
      if (participantsUids.includes(playerUid)) {
        throw new Error(
          `Пользователь с id = ${playerUid} уже зарегистрирован в качалочке с id = ${trainingId}!`
        );
      }
      participantsUids.push(playerUid);
      allTrainings[existingTrainingIndex].participantsUids =
        JSON.stringify(participantsUids);
    }

    transaction.update(allTrainingsDocRef, { allTrainings });
  });
}

async function unsubscribeTrainingParticipantInFirebase(
  trainingId: string,
  playerUid: string
) {
  const db = getFirestore();
  await runTransaction(db, async (transaction) => {
    const allTrainingsDocRef = doc(db, "trainings", "allTrainings");

    const allTrainingsDoc = await transaction.get(allTrainingsDocRef);
    const allTrainings: IAllTrainingsFirebaseOutgoingItem[] = (
      allTrainingsDoc.data()?.allTrainings ?? []
    ).map((t: IAllTrainingsFirebaseIncomingItem) => ({
      ...t,
      dateTime: t.dateTime.toDate(),
    }));

    const existingTrainingIndex = allTrainings.findIndex(
      (t) => t.id === trainingId
    );
    if (existingTrainingIndex === -1) {
      throw new Error(`Качалочка с id = ${trainingId} не найдена в базе!`);
    }
    if (allTrainings[existingTrainingIndex]) {
      const participantsUids = JSON.parse(
        allTrainings[existingTrainingIndex].participantsUids
      ) as string[];
      const existingParticipantIndex = participantsUids.findIndex(
        (pUid) => pUid === playerUid
      );
      if (existingParticipantIndex === -1) {
        throw new Error(
          `Пользователь с id = ${playerUid} не зарегистрирован в качалочке с id = ${trainingId}!`
        );
      }
      participantsUids.splice(existingParticipantIndex, 1);
      allTrainings[existingTrainingIndex].participantsUids =
        JSON.stringify(participantsUids);
    }

    transaction.update(allTrainingsDocRef, { allTrainings });
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
