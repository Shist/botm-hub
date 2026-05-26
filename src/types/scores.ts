import { Timestamp } from "firebase/firestore/lite";
import { type IOsuMap } from "@/types/osumaps";

export const VALID_OSU_SCORE_MODS = [
  "nm",
  "hd",
  "hr",
  "dt",
  "ez",
  "fl",
  "hdhr",
  "flhd",
  "flhr",
  "flhdhr",
  "ezhd",
  "ezfl",
  "ezflhd",
] as const;

export type OsuScoreMod = (typeof VALID_OSU_SCORE_MODS)[number];

export interface IScore {
  date: Date;
  rank: string;
  score: number;
  accuracy: number;
  combo: number;
  points: number;
}

export type IMapScores = Partial<Record<OsuScoreMod, IScore>>;

export type IAllScores = Record<string, Record<string, IMapScores>>;

export type IFirebaseScoreRecord = [
  Timestamp,
  string,
  string,
  string,
  string,
  string,
];

export type IAllScoresFirebase = Record<
  string,
  Record<string, Record<string, IFirebaseScoreRecord>>
>;

export interface IOsuApiMatchScore {
  user_id: number | string;
  mods?: string[];
  score: number;
  max_combo: number;
  accuracy: number;
  passed: boolean;
  rank: string;
}

export interface IOsuApiBeatmapset {
  artist?: string;
  title?: string;
  covers?: {
    cover?: string;
  };
}

export interface IOsuApiBeatmap {
  version?: string;
  difficulty_rating?: number;
  beatmapset?: IOsuApiBeatmapset;
}

export interface IOsuApiGame {
  id: string | number;
  mode: string;
  scoring_type: string;
  beatmap_id: number;
  mods?: string[];
  beatmap?: IOsuApiBeatmap;
  scores?: IOsuApiMatchScore[];
}

export interface IOsuApiEvent {
  game?: IOsuApiGame;
}

export interface IOsuApiMapInfo {
  artist: string;
  title: string;
  version: string;
  coverUrl: string | null;
  fullName: string;
  stars: number;
}

export interface IOsuApiScore {
  gameId: string | number;
  mapId: number;
  mapInfo: IOsuApiMapInfo | null;
  mods: string[];
  score: number;
  combo: number;
  accuracy: number;
  passed: boolean;
  rank: string;
}

export interface IMpModalScore {
  gameId: string | number;
  score: number;
  accuracy: number;
  combo: number;
  rank: string;
  passed: boolean;
  percentage: number;
  isInsufficient: boolean;
  points: number;
  isSelected: boolean;
  isDbScore: boolean;
  mapId?: number;
  mods?: string[];
}

export interface IMpModalGroup {
  id: string;
  mapId: number;
  mods: string[];
  mapInfo: IOsuApiMapInfo | null;
  dbMapInfo: IOsuMap;
  stars: number;
  scores: IMpModalScore[];
}

export function isOsuScoreMod(value: string): value is OsuScoreMod {
  return VALID_OSU_SCORE_MODS.includes(value as OsuScoreMod);
}
