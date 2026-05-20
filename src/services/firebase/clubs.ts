import {
  getFirestore,
  doc,
  getDoc,
  runTransaction,
  Timestamp,
  updateDoc,
} from "firebase/firestore/lite";
import { type IClub, type IClubFirebase, BotmClub } from "@/types/clubs";
import { type IAllUsersListItem } from "@/types/users";

export async function loadClubByIdFromFirebase(
  clubId: BotmClub
): Promise<IClub | null> {
  const db = getFirestore();
  const clubRef = doc(db, "clubs", clubId);

  try {
    const clubSnap = await getDoc(clubRef);

    if (!clubSnap.exists()) {
      throw new Error(`Клуб ${clubId} не найден в базе данных`);
    }

    const data = clubSnap.data() as IClubFirebase;
    return {
      id: clubId,
      leaderMessage: data.leaderMessage ?? "",
      members: (data.members ?? []).map((m) => ({
        uid: m.uid,
        joinedAt: m.joinedAt ? m.joinedAt.toDate() : null,
        leftAt: m.leftAt ? m.leftAt.toDate() : null,
        isActive: m.isActive,
      })),
    };
  } catch (error) {
    console.error(`Ошибка при загрузке данных для клуба ${clubId}:`, error);
    return null;
  }
}

export async function updateLeaderMessageInFirebase(
  clubId: BotmClub,
  newMessage: string
) {
  const db = getFirestore();
  const clubRef = doc(db, "clubs", clubId);
  await updateDoc(clubRef, { leaderMessage: newMessage });
}

export async function toggleClubMembershipInFirebase(
  clubId: BotmClub,
  userUid: string,
  isJoining: boolean
) {
  const db = getFirestore();

  await runTransaction(db, async (transaction) => {
    const clubRef = doc(db, "clubs", clubId);
    const userRef = doc(db, "users", userUid);
    const allUsersRef = doc(db, "users", "allUsers");

    const [clubDoc, userDoc, allUsersDoc] = await Promise.all([
      transaction.get(clubRef),
      transaction.get(userRef),
      transaction.get(allUsersRef),
    ]);

    if (!clubDoc.exists())
      throw new Error("Документ клубов почему-то не найден в базе...");
    if (!userDoc.exists())
      throw new Error("Документ юзера почему-то не найден в базе...");
    if (!allUsersDoc.exists())
      throw new Error("Документ всех юзеров почему-то не найден в базе...");

    const clubData = clubDoc.data() as IClubFirebase;
    const members = clubData.members ?? [];
    const memberIndex = members.findIndex((m) => m.uid === userUid);

    if (memberIndex !== -1 && members[memberIndex]) {
      if (isJoining) {
        members[memberIndex].isActive = true;
        members[memberIndex].joinedAt = Timestamp.now();
        members[memberIndex].leftAt = null;
      } else {
        members[memberIndex].isActive = false;
        members[memberIndex].joinedAt = null;
        members[memberIndex].leftAt = Timestamp.now();
      }
    } else {
      members.push({
        uid: userUid,
        joinedAt: Timestamp.now(),
        leftAt: null,
        isActive: true,
      });
    }
    transaction.update(clubRef, { members });

    const userData = userDoc.data();
    const joinedClubs = JSON.parse(userData.joinedClubs ?? "[]") as BotmClub[];
    const clubIndex = joinedClubs.findIndex((jClubId) => jClubId === clubId);

    if (isJoining) {
      if (clubIndex === -1) joinedClubs.push(clubId);
    } else {
      joinedClubs.splice(clubIndex, 1);
    }
    transaction.update(userRef, { joinedClubs: JSON.stringify(joinedClubs) });

    const allUsersData = allUsersDoc.data().allUsers as IAllUsersListItem[];
    const userIndex = allUsersData.findIndex((u) => u.uid === userUid);

    if (userIndex !== -1 && allUsersData[userIndex]) {
      allUsersData[userIndex].joinedClubs = JSON.stringify(joinedClubs);
      transaction.update(allUsersRef, { allUsers: allUsersData });
    }
  });
}
