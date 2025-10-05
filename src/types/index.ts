import { type Ref } from "vue";

export interface IUserAdditionalInfo {
  nick: string;
}

export interface IUser {
  uid: string;
  email: string;
  additionalInfo:
    | {
        [key in keyof IUserAdditionalInfo]: IUserAdditionalInfo[keyof IUserAdditionalInfo];
      }
    | "loading"
    | "loadingError";
}

export interface ISignUpStateRef {
  email: Ref<string>;
  nick: Ref<string>;
  password: Ref<string>;
  repeatPassword: Ref<string>;
}

export interface IFirebaseError extends Error {
  code: string;
}
