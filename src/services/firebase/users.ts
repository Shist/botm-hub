import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type UserCredential,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  runTransaction,
  getDoc,
} from "firebase/firestore/lite";
import { firebaseAuth } from "@/services/firebase/config";
import { CHUNKS_LIMITS } from "@/constants";
import {
  type IUserFirebaseAdditionalInfo,
  type IAllUsersListItem,
} from "@/types/users";
import { type IMetaConfig } from "@/types/meta";

async function updateUserAdditionalInfoToFirebase(
  userUid: string,
  additionalInfo: IUserFirebaseAdditionalInfo
): Promise<number | null> {
  const db = getFirestore();
  let updatedChunksCount: number | null = null;
  await runTransaction(db, async (transaction) => {
    const metaRef = doc(db, "global", "meta");
    const metaSnap = await transaction.get(metaRef);
    const metaData = (metaSnap.exists() ? metaSnap.data() : {}) as IMetaConfig;
    let chunksCount = metaData.chunks?.users ?? 1;

    const chunkRefs = Array.from({ length: chunksCount }, (_, i) =>
      doc(db, "users", `users${i + 1}`)
    );
    const chunkSnaps = await Promise.all(
      chunkRefs.map((ref) => transaction.get(ref))
    );

    let userFoundInChunkIndex = -1;
    let existingUserIndex = -1;

    for (let i = 0; i < chunkSnaps.length; i++) {
      const snap = chunkSnaps[i];
      if (!snap?.exists()) continue;
      const usersInChunk = snap.data().allUsers as IAllUsersListItem[];

      if (additionalInfo.osuId !== null) {
        const isOsuIdTaken = usersInChunk.some(
          (u) => u.osuId === additionalInfo.osuId && u.uid !== userUid
        );
        if (isOsuIdTaken) {
          const user = usersInChunk.find(
            (u) => u.osuId === additionalInfo.osuId
          );
          throw new Error(`Этот osu! ID уже занят игроком ${user?.nick}`);
        }
      }
      const isNickTaken = usersInChunk.some(
        (u) =>
          u.nick.toLowerCase() === additionalInfo.nick.toLowerCase() &&
          u.uid !== userUid
      );
      if (isNickTaken) throw new Error("Этот ник уже занят другим игроком!");

      const foundIndex = usersInChunk.findIndex((u) => u.uid === userUid);
      if (foundIndex !== -1) {
        userFoundInChunkIndex = i;
        existingUserIndex = foundIndex;
      }
    }

    const userDocRef = doc(db, "users", userUid);

    if (userFoundInChunkIndex !== -1) {
      const targetChunkRef = chunkRefs[userFoundInChunkIndex];
      if (!targetChunkRef) {
        throw new Error(`В базе нет дока 'users${userFoundInChunkIndex + 1}'!`);
      }
      const targetChunkData = chunkSnaps[userFoundInChunkIndex]?.data()
        ?.allUsers as IAllUsersListItem[];

      targetChunkData[existingUserIndex] = {
        uid: userUid,
        osuId: additionalInfo.osuId,
        nick: additionalInfo.nick,
        profileDescription: additionalInfo.profileDescription,
        digitCategory: additionalInfo.digitCategory,
        skillsets: additionalInfo.skillsets,
        isTrainer: additionalInfo.isTrainer,
        isRedactor: additionalInfo.isRedactor,
      };

      targetChunkData.sort((a, b) =>
        a.uid > b.uid ? 1 : a.uid < b.uid ? -1 : 0
      );
      transaction.update(targetChunkRef, { allUsers: targetChunkData });
    } else {
      let latestChunkRef = chunkRefs[chunksCount - 1];
      if (!latestChunkRef) {
        throw new Error(`В базе нет дока 'users${chunksCount}'!`);
      }
      let latestChunkData = (
        chunkSnaps[chunksCount - 1]?.exists()
          ? (chunkSnaps[chunksCount - 1]?.data()?.allUsers ?? [])
          : []
      ) as IAllUsersListItem[];

      if (latestChunkData.length >= CHUNKS_LIMITS.USERS) {
        chunksCount++;
        updatedChunksCount = chunksCount;
        latestChunkRef = doc(db, "users", `users${chunksCount}`);
        latestChunkData = [];
        transaction.update(metaRef, { "chunks.users": chunksCount });
      }

      latestChunkData.push({
        uid: userUid,
        osuId: additionalInfo.osuId,
        nick: additionalInfo.nick,
        profileDescription: additionalInfo.profileDescription,
        digitCategory: additionalInfo.digitCategory,
        skillsets: additionalInfo.skillsets,
        isTrainer: additionalInfo.isTrainer,
        isRedactor: additionalInfo.isRedactor,
      });

      latestChunkData.sort((a, b) =>
        a.uid > b.uid ? 1 : a.uid < b.uid ? -1 : 0
      );
      transaction.set(
        latestChunkRef,
        { allUsers: latestChunkData },
        { merge: true }
      );
    }

    transaction.set(userDocRef, additionalInfo);
  });
  return updatedChunksCount;
}

async function signUpUserToFirebase(
  email: string,
  password: string,
  partialInfo: Pick<IUserFirebaseAdditionalInfo, "nick" | "email">
): Promise<{ authData: UserCredential; newChunksCount: number | null }> {
  const auth = getAuth();
  let newUserInfo: UserCredential | null = null;

  try {
    newUserInfo = await createUserWithEmailAndPassword(auth, email, password);

    if (!newUserInfo.user.uid) {
      throw new Error(
        "Не удалось получить UID пользователя после создания аккаунта"
      );
    }

    const fullAdditionalInfo: IUserFirebaseAdditionalInfo = {
      ...partialInfo,
      osuId: null,
      profileDescription: null,
      digitCategory: null,
      skillsets: "[]",
      isTrainer: false,
      isRedactor: false,
    };

    const newChunksCount = await updateUserAdditionalInfoToFirebase(
      newUserInfo.user.uid,
      fullAdditionalInfo
    );

    return { authData: newUserInfo, newChunksCount };
  } catch (error) {
    if (newUserInfo) await newUserInfo.user.delete();
    throw error;
  }
}

async function signInUserToFirebase(email: string, password: string) {
  const auth = getAuth();

  const userInfo = await signInWithEmailAndPassword(auth, email, password);

  return userInfo;
}

async function signOutUserFromFirebase() {
  const auth = getAuth();

  await signOut(auth);
}

async function resetUserPasswordInFirebase(email: string) {
  const auth = getAuth();
  await sendPasswordResetEmail(auth, email);
}

async function loadUserInfoFromFirebase(): Promise<IUserFirebaseAdditionalInfo> {
  const db = getFirestore();

  const userDataDoc = doc(db, "users", `${firebaseAuth.currentUser?.uid}`);

  const userDocSnapshot = await getDoc(userDataDoc);
  const userDocData = userDocSnapshot.data() as IUserFirebaseAdditionalInfo;

  return userDocData;
}

async function loadAllUsersFromFirebase(
  chunksCount: number
): Promise<IAllUsersListItem[]> {
  const db = getFirestore();
  const promises = [];

  for (let k = 1; k <= chunksCount; k++) {
    promises.push(getDoc(doc(db, "users", `users${k}`)));
  }

  const allUsers: IAllUsersListItem[] = [];
  try {
    const snapshots = await Promise.all(promises);
    snapshots.forEach((snap) => {
      if (snap.exists()) {
        const chunkUsers = snap.data().allUsers as IAllUsersListItem[];
        if (chunkUsers) allUsers.push(...chunkUsers);
      }
    });

    return allUsers.sort((a, b) => a.nick.localeCompare(b.nick));
  } catch (error) {
    console.error("Ошибка при загрузке пользователей:", error);
    return [];
  }
}

export {
  updateUserAdditionalInfoToFirebase,
  signUpUserToFirebase,
  signInUserToFirebase,
  signOutUserFromFirebase,
  resetUserPasswordInFirebase,
  loadUserInfoFromFirebase,
  loadAllUsersFromFirebase,
};
