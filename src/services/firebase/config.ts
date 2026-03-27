import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  type User as IFirebaseUser,
} from "firebase/auth";

const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
});

const firebaseAuth = getAuth(firebaseApp);

function onFirebaseAuthStateChanged(
  initFoo: (user: IFirebaseUser | null) => void
) {
  onAuthStateChanged(firebaseAuth, initFoo);
}

export { firebaseAuth, onFirebaseAuthStateChanged };
