import { Timestamp } from "firebase/firestore/lite";
import { LoadingState } from "@/types/global";
import { OsuMapCategory } from "@/types/osumaps";

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
  joinedAt: Date | null;
  leftAt: Date | null;
  isActive: boolean;
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
  members: {
    uid: string;
    joinedAt: Timestamp | null;
    leftAt: Timestamp | null;
    isActive: boolean;
  }[];
}

export type AllowedModType =
  | ""
  | "hd"
  | "hr"
  | "dt"
  | "ez"
  | "fl"
  | "hdhr"
  | "flhd"
  | "flhr"
  | "flhdhr"
  | "ezhd"
  | "ezfl"
  | "ezflhd";

export interface IClubSkillsetRule {
  category: OsuMapCategory;
  allowedMods: AllowedModType[];
}

export interface IClubConfig {
  id: BotmClub;
  title: string;
  skillsets: IClubSkillsetRule[];
}
