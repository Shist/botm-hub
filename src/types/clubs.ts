import { Timestamp } from "firebase/firestore/lite";
import { OsuMapCategory } from "@/types/osumaps";
import { type OsuScoreMod } from "@/types/scores";

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

export function isBotmClub(value: string): value is BotmClub {
  return Object.values(BotmClub).includes(value as BotmClub);
}

export interface IClubFirebase {
  leaderUid: string | null;
  leaderMessage: string;
  members: Record<string, { joinedAt: Timestamp }>;
}

export interface IClubSkillsetRule {
  category: OsuMapCategory;
  allowedMods: OsuScoreMod[];
}

export interface IClubConfig {
  id: BotmClub;
  title: string;
  skillsets: IClubSkillsetRule[];
}
