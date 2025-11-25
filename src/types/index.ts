import { type Ref } from "vue";
import { Timestamp } from "firebase/firestore/lite";

export enum LoadingState {
  NOT_LOADED,
  LOADING,
  LOADED,
  ERROR,
}

export enum OsuMapCategory {
  nm1 = "nm1",
  nm2 = "nm2",
  nm3 = "nm3",
  nm4 = "nm4",
  nm5 = "nm5",
  nm6 = "nm6",
  nm7 = "nm7",
  hd1 = "hd1",
  hd2 = "hd2",
  hd3 = "hd3",
  hr1 = "hr1",
  hr2 = "hr2",
  hr3 = "hr3",
  dt1 = "dt1",
  dt2 = "dt2",
  dt3 = "dt3",
  dt4 = "dt4",
  fm1 = "fm1",
  fm2 = "fm2",
  fm3 = "fm3",
  tb = "tb",
}

export enum DigitCategory {
  fourDigit = "4-digit",
  fiveDigit = "5-digit",
  sixDigit = "6-digit",
}

export enum TrainingStatus {
  waiting = "waiting",
  inProgress = "in-progress",
  completed = "completed",
  archived = "archived",
}

export interface IUserAdditionalInfoBase {
  email: string;
  osuId: string | null;
  nick: string;
  digitCategory: DigitCategory | null;
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

export interface IOsuMap {
  id: number;
  link: string;
  category: OsuMapCategory;
  name: string;
  mapper: string;
  starRate: number;
  duration: string;
  bpm: number;
  cs: number;
  ar: number;
  od: number;
  hp: number;
  comment: string;
}

export interface IOsuMapsCategoryState {
  mapsList: IOsuMap[];
  loadingState: LoadingState;
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

export interface IAllTrainingsItemBase {
  id: string;
  title: string;
  durationMins: number;
  description: string;
  mpLink: string | null;
  isArchived: boolean;
}

export interface IAllTrainingsFirebaseItemBase extends IAllTrainingsItemBase {
  trainerUid: string;
  skillsets: string;
  participantsUids: string;
}

export interface IAllTrainingsFirebaseIncomingItem
  extends IAllTrainingsFirebaseItemBase {
  dateTime: Timestamp;
}

export interface IAllTrainingsFirebaseOutgoingItem
  extends IAllTrainingsFirebaseItemBase {
  dateTime: Date;
}

export interface IAllTrainingsListItem extends IAllTrainingsItemBase {
  trainerNick: string;
  skillsets: OsuMapCategory[];
  dateTime: Date;
  participants: IAllUsersListItem[];
}
