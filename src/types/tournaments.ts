import { Timestamp } from "firebase/firestore/lite";
import type { IAllUsersListItem, IUnregisteredUser } from "@/types/users";

export const ACHIEVED_PLACES = [
  "1",
  "2",
  "3",
  "4",
  "3-4",
  "5-6",
  "7-8",
  "5-8",
  "9-12",
  "5-12",
  "13-16",
  "9-16",
  "17-22",
  "17-24",
  "9-24",
  "23-28",
  "29-32",
  "25-32",
  "17-32",
  "33-64",
  "17-64",
  "33+",
  "65+",
] as const;
export const ACHIEVED_STAGES = [
  "Grand Finals",
  "Finals",
  "Semifinals",
  "Quarterfinals",
  "Round of 16",
  "Round of 32",
  "Groups Stage",
  "Swiss Stage 3",
  "Swiss Stage 2",
  "Swiss Stage 1",
  "DNQ",
] as const;
export const TOURNAMENT_FORMATS = ["4v4", "3v3", "2v2", "1v1"] as const;
export const TOURNAMENT_TEAM_SIZES = [8, 4, 3, 2, 1] as const;

export enum TournamentStatus {
  announced = "announced",
  active = "active",
  completed = "completed",
  archived = "archived",
}

export type AchievedPlaceType = (typeof ACHIEVED_PLACES)[number];
export type AchievedStageType = (typeof ACHIEVED_STAGES)[number];
export type TournamentFormat = (typeof TOURNAMENT_FORMATS)[number];
export type TournamentTeamSize = (typeof TOURNAMENT_TEAM_SIZES)[number];

export interface IRosterInfo<RegisteredUserInfoType> {
  id: string;
  teamName: string;
  players: (RegisteredUserInfoType | IUnregisteredUser | null)[];
  collabImgLink: string | null;
  rosterRevealLink: string | null;
  achievedPlace: AchievedPlaceType | null;
  achievedStage: AchievedStageType | null;
}

export interface IAllTournamentsItemBase {
  id: string;
  redactorUid: string;
  title: string;
  rankRange: string;
  description: string;
  format: TournamentFormat;
  teamSize: TournamentTeamSize;
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
