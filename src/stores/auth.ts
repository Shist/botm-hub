import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
  updateUserAdditionalInfoToFirebase,
  signUpUserToFirebase,
  signInUserToFirebase,
  signOutUserFromFirebase,
  loadUserInfoFromFirebase,
} from "@/services/firebase";
import {
  type IUser,
  type IUserLocalAdditionalInfo,
  type IUserFirebaseAdditionalInfo,
} from "@/types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<IUser | null>(null);

  const userAdditionalInfo = computed<IUserLocalAdditionalInfo | null>(() => {
    if (
      user.value?.additionalInfo === "loading" ||
      user.value?.additionalInfo === "loadingError"
    ) {
      return null;
    } else {
      return user.value?.additionalInfo ?? null;
    }
  });

  const setBaseUserInfo = (userUid: string, userEmail: string) => {
    if (user.value) {
      user.value.uid = userUid;
      user.value.email = userEmail;
    } else {
      user.value = {
        uid: userUid,
        email: userEmail,
        additionalInfo: "loading",
      };
    }
  };

  const setAdditionalUserInfo = (
    additionalInfoFields: IUserFirebaseAdditionalInfo | "loadingError"
  ) => {
    if (!user.value) return;

    if (additionalInfoFields === "loadingError") {
      user.value.additionalInfo = additionalInfoFields;
    } else {
      user.value.additionalInfo = {
        ...additionalInfoFields,
        skillsets: JSON.parse(additionalInfoFields.skillsets),
      };
    }
  };

  const signUpUser = async (
    email: string,
    password: string,
    partialInfo: Pick<IUserFirebaseAdditionalInfo, "nick" | "email">
  ) => {
    const fullAdditionalInfo: IUserFirebaseAdditionalInfo = {
      ...partialInfo,
      osuId: null,
      digitCategory: null,
      skillsets: "[]",
      isTrainer: false,
    };
    const authServerData = await signUpUserToFirebase(
      email,
      password,
      fullAdditionalInfo
    );

    if (authServerData) {
      setBaseUserInfo(authServerData.user.uid, authServerData.user.email ?? "");
      setAdditionalUserInfo(fullAdditionalInfo);
    }
  };

  const signInUser = async (email: string, password: string) => {
    const authServerData = await signInUserToFirebase(email, password);
    setBaseUserInfo(authServerData.user.uid, authServerData.user.email ?? "");

    try {
      const userInfo = await loadUserInfoFromFirebase();
      setAdditionalUserInfo(userInfo);
    } catch {
      setAdditionalUserInfo("loadingError");
    }
  };

  const signOutUser = async () => {
    user.value = null;

    await signOutUserFromFirebase();
  };

  const updateUserAdditionalInfo = async (
    additionalInfo: Omit<IUserFirebaseAdditionalInfo, "email" | "isTrainer">
  ) => {
    if (
      !user.value ||
      user.value.additionalInfo === "loading" ||
      user.value.additionalInfo === "loadingError"
    )
      return;
    const newUserInfo = {
      email: user.value.email,
      isTrainer: user.value.additionalInfo.isTrainer,
      ...additionalInfo,
    };
    await updateUserAdditionalInfoToFirebase(user.value.uid, newUserInfo);
    setAdditionalUserInfo(newUserInfo);
  };

  return {
    user,
    userAdditionalInfo,
    setBaseUserInfo,
    setAdditionalUserInfo,
    signUpUser,
    signInUser,
    signOutUser,
    updateUserAdditionalInfo,
  };
});
