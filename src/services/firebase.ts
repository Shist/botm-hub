import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  type User as IFirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  query,
  where,
} from "firebase/firestore/lite";
import {
  type IUserAdditionalInfo,
  type OsuMapCategory,
  type IAllUsersListItem,
  type IOsuMap,
} from "@/types";

const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
});

const auth = getAuth(firebaseApp);

function onFirebaseAuthStateChanged(
  initFoo: (user: IFirebaseUser | null) => void
) {
  onAuthStateChanged(auth, initFoo);
}

async function updateUserAdditionalInfoToFirebase(
  userUid: string,
  userEmail: string,
  additionalInfo: IUserAdditionalInfo
) {
  const existingUser = await loadUserInfoFromFirbaseByNick(additionalInfo.nick);
  if (existingUser && existingUser.email !== userEmail) {
    throw new Error("Этот ник уже занят другим игроком!");
  }

  const db = getFirestore();
  const userDoc = doc(db, "users", userUid);
  await setDoc(userDoc, additionalInfo);

  const allUsersDocRef = doc(db, "users", "allUsers");
  const allUsersDoc = await getDoc(allUsersDocRef);
  const allUsers = (allUsersDoc.data()?.allUsers ?? []) as IAllUsersListItem[];
  const existingUserIndex = allUsers.findIndex((u) => u.uid === userUid);
  if (existingUserIndex === -1) {
    allUsers.push({
      uid: userUid,
      nick: additionalInfo.nick,
      digitCategory: additionalInfo.digitCategory,
      skillsets: additionalInfo.skillsets,
    });
  } else {
    (allUsers[existingUserIndex] as IAllUsersListItem).nick =
      additionalInfo.nick;
    (allUsers[existingUserIndex] as IAllUsersListItem).digitCategory =
      additionalInfo.digitCategory;
    (allUsers[existingUserIndex] as IAllUsersListItem).skillsets =
      additionalInfo.skillsets;
  }
  await updateDoc(allUsersDocRef, { allUsers: allUsers });
}

async function signUpUserToFirebase(
  email: string,
  password: string,
  additionalInfo: IUserAdditionalInfo
) {
  const auth = getAuth();

  const existingUser = await loadUserInfoFromFirbaseByNick(additionalInfo.nick);

  if (existingUser) {
    throw new Error("Пользователь с таким ником уже зарегистрирован!");
  }

  const newUserInfo = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  if (!newUserInfo.user.uid) {
    return;
  }

  await updateUserAdditionalInfoToFirebase(
    newUserInfo.user.uid,
    newUserInfo.user.email ?? "",
    additionalInfo
  );

  return newUserInfo;
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

async function loadUserInfoFromFirbase(): Promise<IUserAdditionalInfo> {
  const db = getFirestore();

  const userDataDoc = doc(db, "users", `${auth.currentUser?.uid}`);

  const userDocSnapshot = await getDoc(userDataDoc);
  const userDocData = userDocSnapshot.data() as IUserAdditionalInfo;

  return userDocData;
}

async function loadUserInfoFromFirbaseByNick(
  nick: string
): Promise<IUserAdditionalInfo | null> {
  const db = getFirestore();
  const usersRef = collection(db, "users");
  const queryByNick = query(usersRef, where("nick", "==", nick));

  const querySnapshot = await getDocs(queryByNick);

  const userDocSnapshot = querySnapshot.docs[0];

  if (!userDocSnapshot) return null;

  return userDocSnapshot.data() as IUserAdditionalInfo;
}

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

export {
  onFirebaseAuthStateChanged,
  updateUserAdditionalInfoToFirebase,
  signUpUserToFirebase,
  signInUserToFirebase,
  signOutUserFromFirebase,
  loadUserInfoFromFirbase,
  loadMapsByCategoryFromFirebase,
  uploadMapsToFirebase,
};
