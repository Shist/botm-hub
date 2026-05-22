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
}

export interface IClub {
  id: BotmClub;
  leaderUid: string | null;
  leaderMessage: string;
  members: Record<string, IClubMember>;
}

export interface IClubState {
  data: IClub | null;
  loadingState: LoadingState;
}

export function isBotmClub(value: string): value is BotmClub {
  return Object.values(BotmClub).includes(value as BotmClub);
}

export interface IClubFirebase {
  leaderUid: string | null;
  leaderMessage: string;
  members: Record<string, { joinedAt: Timestamp }>;
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
