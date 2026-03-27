import { Timestamp } from "firebase/firestore/lite";
import type { IAllUsersListItem } from "@/types/users";
import type { OsuMapCategory } from "@/types/osumaps";

export enum TrainingStatus {
  waiting = "waiting",
  inProgress = "in-progress",
  completed = "completed",
  archived = "archived",
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
