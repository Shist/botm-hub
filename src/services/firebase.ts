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
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
} from "firebase/firestore/lite";
import {
  type IUserAdditionalInfo,
  type OsuMapCategory,
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

async function signUpUserToFirebase(
  email: string,
  password: string,
  additionalInfo: IUserAdditionalInfo
) {
  const auth = getAuth();

  const newUserInfo = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  if (!newUserInfo.user.uid) {
    return;
  }

  const db = getFirestore();

  await setDoc(doc(db, "users", newUserInfo.user.uid), {
    email,
    ...additionalInfo,
  });

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

async function loadMapsByCategoryFromFirebase(category: OsuMapCategory) {
  const db = getFirestore();
  const queryByCategory = query(
    collection(db, "maps"),
    where("category", "==", category),
    orderBy("starRate")
  );
  const mapsSnapshot = await getDocs(queryByCategory);

  const mapsArr: IOsuMap[] = mapsSnapshot.docs.map((doc) => {
    const mapData = doc.data();

    return {
      id: +doc.id,
      link: `https://osu.ppy.sh/b/${doc.id}`,
      ...(mapData as Omit<IOsuMap, "id" | "link">),
    };
  });

  return mapsArr;
}

export {
  onFirebaseAuthStateChanged,
  signUpUserToFirebase,
  signInUserToFirebase,
  signOutUserFromFirebase,
  loadUserInfoFromFirbase,
  loadMapsByCategoryFromFirebase,
};
