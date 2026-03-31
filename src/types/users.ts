import { type Ref } from "vue";
import { OsuMapCategory } from "@/types/osumaps";

export enum DigitCategory {
  fourDigit = "4-digit",
  fiveDigit = "5-digit",
  sixDigit = "6-digit",
}

export interface IUserAdditionalInfoBase {
  email: string;
  osuId: string | null;
  nick: string;
  digitCategory: DigitCategory | null;
  isTrainer: boolean;
  isRedactor: boolean;
}

export interface IUserLocalAdditionalInfo extends IUserAdditionalInfoBase {
  skillsets: OsuMapCategory[];
}

export interface IUserFirebaseAdditionalInfo extends IUserAdditionalInfoBase {
  skillsets: string;
}

export interface IUser {
  uid: string;
  email: string;
  additionalInfo: IUserLocalAdditionalInfo | "loading" | "loadingError";
}

export interface IAllUsersListItem
  extends Omit<IUserFirebaseAdditionalInfo, "email"> {
  uid: string;
}

export interface ISignUpStateRef {
  email: Ref<string>;
  nick: Ref<string>;
  password: Ref<string>;
  repeatPassword: Ref<string>;
}

export interface IUnregisteredUser {
  osuId: string;
  nick: string;
}

export function isRegisteredPlayer(
  player: IAllUsersListItem | IUnregisteredUser | null
): player is IAllUsersListItem {
  return player !== null && "uid" in player;
}

export interface IPlayerSlot {
  localId: string;
  isRegistered: boolean;
  registeredPlayer: IAllUsersListItem | null;
  unregisteredPlayer: IUnregisteredUser | null;
}
