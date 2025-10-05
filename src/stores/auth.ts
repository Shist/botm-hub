import { ref } from "vue";
import { defineStore } from "pinia";
import {
  signUpUserToFirebase,
  signInUserToFirebase,
  signOutUserFromFirebase,
  loadUserInfoFromFirbase,
} from "@/services/firebase";
import { type IUser, type IUserAdditionalInfo } from "@/types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<IUser | null>(null);

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
    additionalInfoFields: IUserAdditionalInfo | "loadingError"
  ) => {
    if (user.value) {
      user.value.additionalInfo = additionalInfoFields;
    }
  };

  const signUpUser = async (
    email: string,
    password: string,
    additionalInfo: IUserAdditionalInfo
  ) => {
    const authServerData = await signUpUserToFirebase(
      email,
      password,
      additionalInfo
    );

    if (authServerData) {
      setBaseUserInfo(authServerData.user.uid, authServerData.user.email ?? "");
      setAdditionalUserInfo(additionalInfo);
    }
  };

  const signInUser = async (email: string, password: string) => {
    const authServerData = await signInUserToFirebase(email, password);

    setBaseUserInfo(authServerData.user.uid, authServerData.user.email ?? "");

    loadUserInfoFromFirbase()
      .then((userInfo) => {
        setAdditionalUserInfo(userInfo);
      })
      .catch(() => {
        setAdditionalUserInfo("loadingError");
      });
  };

  const signOutUser = async () => {
    user.value = null;

    await signOutUserFromFirebase();
  };

  return {
    user,
    setBaseUserInfo,
    setAdditionalUserInfo,
    signUpUser,
    signInUser,
    signOutUser,
  };
});
