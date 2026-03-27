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

export enum TournamentStatus {
  announced = "announced",
  active = "active",
  completed = "completed",
  archived = "archived",
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
  trainerUid: string;
  durationMins: number;
  description: string;
  mpLinkId: number | null;
  isArchived: boolean;
}

export interface IAllTrainingsFirebaseItemBase extends IAllTrainingsItemBase {
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
  skillsets: OsuMapCategory[];
  dateTime: Date;
  participants: IAllUsersListItem[];
}

export interface IUnregisteredUser {
  osuId: string;
  nick: string;
}

export function isRegisteredPlayer(
  player: IAllUsersListItem | IUnregisteredUser
): player is IAllUsersListItem {
  return "uid" in player;
}

export interface IRosterInfo<RegisteredUserInfoType> {
  id: string;
  teamName: string;
  players: (RegisteredUserInfoType | IUnregisteredUser)[];
  collabImgLink: string | null;
  rosterRevealLink: string | null;
  achievedPlace:
    | "1"
    | "2"
    | "3"
    | "4"
    | "3-4"
    | "5-6"
    | "7-8"
    | "5-8"
    | "9-12"
    | "5-12"
    | "13-16"
    | "9-16"
    | "17-24"
    | "9-24"
    | "25-32"
    | "17-32"
    | "33-64"
    | "17-64"
    | "33+"
    | "65+"
    | null;
  achievedStage:
    | "Grand Finals"
    | "Finals"
    | "Semifinals"
    | "Quarterfinals"
    | "Round of 16"
    | "Round of 32"
    | "Groups Stage"
    | "Swiss Stage 3"
    | "Swiss Stage 2"
    | "Swiss Stage 1"
    | "DNQ"
    | null;
}

export interface IAllTournamentsItemBase {
  id: string;
  redactorUid: string;
  title: string;
  rankRange: string;
  description: string;
  format: "4v4" | "3v3" | "2v2" | "1v1";
  teamSize: 8 | 4 | 3 | 2 | 1;
  isDoubleElimination: boolean;
  forumPostLink: string | null;
  mainSheetLink: string | null;
  challongeLink: string | null;
  twitchFirstLink: string | null;
  twitchSecondLink: string | null;
  isArchived: boolean;
}

export interface IAllTournamentsFirebaseItemBase
  extends IAllTournamentsItemBase {
  rostersInfo: IRosterInfo<string>[];
}

export interface IAllTournamentsFirebaseIncomingItem
  extends IAllTournamentsFirebaseItemBase {
  datesInfo: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
}

export interface ITournamentDatesInfo {
  startDate: Date;
  endDate: Date;
}

export interface IAllTournamentsFirebaseOutgoingItem
  extends IAllTournamentsFirebaseItemBase {
  datesInfo: ITournamentDatesInfo;
}

export interface IAllTournamentsListItem extends IAllTournamentsItemBase {
  rostersInfo: IRosterInfo<IAllUsersListItem>[];
  datesInfo: ITournamentDatesInfo;
}
