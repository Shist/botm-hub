import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteField,
  serverTimestamp,
} from "firebase/firestore/lite";
import { type IClubFirebase, BotmClub } from "@/types/clubs";

export async function loadAllClubsFromFirebase(): Promise<Record<
  string,
  IClubFirebase
> | null> {
  const db = getFirestore();
  const clubsRef = doc(db, "clubs", "allClubs");

  try {
    const snap = await getDoc(clubsRef);
    if (!snap.exists()) return null;
    return snap.data() as Record<string, IClubFirebase>;
  } catch (error) {
    console.error(`Ошибка при загрузке клубов:`, error);
    return null;
  }
}

export async function updateLeaderMessageInFirebase(
  clubId: BotmClub,
  newMessage: string
) {
  const db = getFirestore();
  const clubRef = doc(db, "clubs", "allClubs");
  await updateDoc(clubRef, { [`${clubId}.leaderMessage`]: newMessage });
}

export async function toggleClubMembershipInFirebase(
  clubId: BotmClub,
  userUid: string,
  isJoining: boolean
) {
  const db = getFirestore();
  const clubRef = doc(db, "clubs", "allClubs");

  const fieldPath = `${clubId}.members.${userUid}`;

  if (isJoining) {
    await updateDoc(clubRef, {
      [fieldPath]: { joinedAt: serverTimestamp() },
    });
  } else {
    await updateDoc(clubRef, {
      [fieldPath]: deleteField(),
    });
  }
}
