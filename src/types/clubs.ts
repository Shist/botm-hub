import { Timestamp } from "firebase/firestore/lite";
import { LoadingState } from "@/types/global";

export enum BotmClub {
  AIM = "aim",
  SPEED = "speed",
  TECH = "tech",
  READING = "reading",
  HIDDEN = "hidden",
  HARDROCK = "hardrock",
}

export interface IClubMember {
  uid: string;
  joinedAt: Date;
}

export interface IClub {
  id: BotmClub;
  leaderMessage: string;
  members: IClubMember[];
}

export interface IClubState {
  data: IClub | null;
  loadingState: LoadingState;
}

export function isBotmClub(value: string): value is BotmClub {
  return Object.values(BotmClub).includes(value as BotmClub);
}

export interface IClubFirebase {
  leaderMessage: string;
  members: { uid: string; joinedAt: Timestamp }[];
}
