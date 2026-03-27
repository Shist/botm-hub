import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type UserCredential,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  runTransaction,
  getDoc,
} from "firebase/firestore/lite";
import { firebaseAuth } from "@/services/firebase/config";
import {
  type IUserFirebaseAdditionalInfo,
  type IAllUsersListItem,
} from "@/types/users";

async function updateUserAdditionalInfoToFirebase(
  userUid: string,
  additionalInfo: IUserFirebaseAdditionalInfo
) {
  const db = getFirestore();
  await runTransaction(db, async (transaction) => {
    const userDocRef = doc(db, "users", userUid);
    const allUsersDocRef = doc(db, "users", "allUsers");

    const allUsersDoc = await transaction.get(allUsersDocRef);
    const allUsers = (allUsersDoc.data()?.allUsers ??
      []) as IAllUsersListItem[];

    if (additionalInfo.osuId !== null) {
      const isOsuIdTakenByAnotherUser = allUsers.some(
        (u) => u.osuId === additionalInfo.osuId && u.uid !== userUid
      );
      if (isOsuIdTakenByAnotherUser) {
        const user = allUsers.find((u) => u.osuId === additionalInfo.osuId);
        throw new Error(`Этот osu! ID уже занят игроком ${user?.nick}`);
      }
    }
    const isNickTakenByAnotherUser = allUsers.some(
      (u) => u.nick === additionalInfo.nick && u.uid !== userUid
    );
    if (isNickTakenByAnotherUser) {
      throw new Error("Этот ник уже занят другим игроком!");
    }

    const existingUserIndex = allUsers.findIndex((u) => u.uid === userUid);
    if (existingUserIndex === -1) {
      allUsers.push({
        uid: userUid,
        osuId: additionalInfo.osuId,
        nick: additionalInfo.nick,
        digitCategory: additionalInfo.digitCategory,
        skillsets: additionalInfo.skillsets,
        isTrainer: additionalInfo.isTrainer,
        isRedactor: additionalInfo.isRedactor,
      });
    } else {
      (allUsers[existingUserIndex] as IAllUsersListItem).osuId =
        additionalInfo.osuId;
      (allUsers[existingUserIndex] as IAllUsersListItem).nick =
        additionalInfo.nick;
      (allUsers[existingUserIndex] as IAllUsersListItem).digitCategory =
        additionalInfo.digitCategory;
      (allUsers[existingUserIndex] as IAllUsersListItem).skillsets =
        additionalInfo.skillsets;
    }

    allUsers.sort((a, b) => (a.uid > b.uid ? 1 : a.uid < b.uid ? -1 : 0));

    transaction.set(userDocRef, additionalInfo);
    transaction.update(allUsersDocRef, { allUsers });
  });
}

async function signUpUserToFirebase(
  email: string,
  password: string,
  additionalInfo: IUserFirebaseAdditionalInfo
) {
  const auth = getAuth();
  let newUserInfo: UserCredential | null = null;

  try {
    newUserInfo = await createUserWithEmailAndPassword(auth, email, password);

    if (!newUserInfo.user.uid) {
      throw new Error(
        "Не удалось получить UID пользователя после создания аккаунта"
      );
    }

    await updateUserAdditionalInfoToFirebase(
      newUserInfo.user.uid,
      additionalInfo
    );

    return newUserInfo;
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

async function loadUserInfoFromFirebase(): Promise<IUserFirebaseAdditionalInfo> {
  const db = getFirestore();

  const userDataDoc = doc(db, "users", `${firebaseAuth.currentUser?.uid}`);

  const userDocSnapshot = await getDoc(userDataDoc);
  const userDocData = userDocSnapshot.data() as IUserFirebaseAdditionalInfo;

  return userDocData;
}

async function loadAllUsersFromFirebase(): Promise<IAllUsersListItem[]> {
  const db = getFirestore();

  const allUsersDoc = doc(db, "users", "allUsers");

  const allUsersSnapshot = await getDoc(allUsersDoc);
  const allUsersDocData = allUsersSnapshot.data();
  const allUsers = allUsersDocData?.allUsers as IAllUsersListItem[];

  return allUsers.sort((a, b) => a.nick.localeCompare(b.nick));
}

export {
  updateUserAdditionalInfoToFirebase,
  signUpUserToFirebase,
  signInUserToFirebase,
  signOutUserFromFirebase,
  loadUserInfoFromFirebase,
  loadAllUsersFromFirebase,
};
