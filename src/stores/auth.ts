import { ref, computed } from "vue";
import { defineStore } from "pinia";
import {
  updateUserAdditionalInfoToFirebase,
  signUpUserToFirebase,
  signInUserToFirebase,
  signOutUserFromFirebase,
  resetUserPasswordInFirebase,
  loadUserInfoFromFirebase,
} from "@/services/firebase/users";
import { useMetaStore } from "@/stores/meta";
import {
  type IUser,
  type IUserLocalAdditionalInfo,
  type IUserFirebaseAdditionalInfo,
} from "@/types/users";

export const useAuthStore = defineStore("auth", () => {
  const metaStore = useMetaStore();

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
    const result = await signUpUserToFirebase(email, password, partialInfo);

    if (result) {
      if (result.newChunksCount && metaStore.metaConfig) {
        metaStore.metaConfig.chunks.users = result.newChunksCount;
      }

      setBaseUserInfo(
        result.authData.user.uid,
        result.authData.user.email ?? ""
      );
      const userInfo = await loadUserInfoFromFirebase();
      setAdditionalUserInfo(userInfo);
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

  const resetUserPassword = async (email: string) => {
    await resetUserPasswordInFirebase(email);
  };

  const updateUserAdditionalInfo = async (
    additionalInfo: Pick<
      IUserFirebaseAdditionalInfo,
      | "osuId"
      | "nick"
      | "digitCategory"
      | "profileThemeColor"
      | "profileBannerUrl"
      | "skillsets"
      | "profileDescription"
    >
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
      isRedactor: user.value.additionalInfo.isRedactor,
      ...additionalInfo,
    };
    const newChunksCount = await updateUserAdditionalInfoToFirebase(
      user.value.uid,
      newUserInfo
    );
    if (newChunksCount && metaStore.metaConfig) {
      metaStore.metaConfig.chunks.users = newChunksCount;
    }
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
    resetUserPassword,
    updateUserAdditionalInfo,
  };
});
