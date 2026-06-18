import { Timestamp } from "firebase/firestore/lite";
import { type IAllUsersListItem } from "@/types/users";
import { type IOsuMap, OsuMapCategory } from "@/types/osumaps";
import { BotmClub } from "@/types/clubs";

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
}

export type IMapScores = Partial<Record<OsuScoreMod, IScore>>;

export type IAllScores = Record<string, Record<string, IMapScores>>;

export type IFirebaseScoreRecord = [Timestamp, string, string, string, string];

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
  created_at: string;
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
  date: Date;
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
  isSelected: boolean;
  isDbScore: boolean;
  date: Date;
}

export interface IScoreUploadPayload {
  mapId: number;
  mods: string[];
  score: IMpModalScore;
}

export interface IMpModalGroup {
  id: string;
  mapId: number;
  mods: string[];
  mapInfo: IOsuApiMapInfo | null;
  dbMapInfo: IOsuMap;
  scores: IMpModalScore[];
}

export interface ScoresTableHeader {
  key: string;
  title: string;
  minWidth?: string;
  align?: "start" | "center" | "end";
  sortable?: boolean;
  sort?:
    | ((a: number, b: number) => number)
    | ((a: string, b: string) => number)
    | ((a: Date, b: Date) => number)
    | ((a: { nick: string }, b: { nick: string }) => number);
}

export interface IScoreTableRow {
  uidWithMapIdAndMods: string;
  uid: string;
  user: IAllUsersListItem;
  mapId: number;
  mapsetId: number;
  mapCategories: OsuMapCategory[];
  mapName: string;
  mods: OsuScoreMod;
  date: Date;
  rank: string;
  score: number;
  accuracy: number;
  combo: number;
  basePoints: number;
  points: number;
  percentage: number;
}

export interface ILeaderboardTableRow {
  uid: string;
  user: IAllUsersListItem;
  searchString: string;
  rank?: number | string;
  totalPoints?: number;
  overallStats?: IStatBucket;
  aim?: number;
  aimStats?: IStatBucket;
  speed?: number;
  speedStats?: IStatBucket;
  tech?: number;
  techStats?: IStatBucket;
  reading?: number;
  readingStats?: IStatBucket;
  hidden?: number;
  hiddenStats?: IStatBucket;
  hardrock?: number;
  hardrockStats?: IStatBucket;
  points?: number;
  totalScores?: number;
  avgScore?: number;
  avgAcc?: number;
  avgCombo?: number;
  joinedTimestamp?: number;
}

export interface IParsedOsr {
  mode: number;
  version: number;
  beatmapMD5: string;
  playerName: string;
  replayMD5: string;
  count300: number;
  count100: number;
  count50: number;
  countGeki: number;
  countKatu: number;
  countMiss: number;
  totalScore: number;
  maxCombo: number;
  isPerfectCombo: boolean;
  modsFlag: number;
  parsedMods: string[];
  accuracy: number;
  date: Date;
  isScoreV2: boolean;
}

export interface IStatBucket {
  points: number;
  totalScores: number;
  sumScore: number;
  sumAcc: number;
  sumCombo: number;
  avgScore: number;
  avgAcc: number;
  avgCombo: number;
}

export interface IPlayerLeaderboardStats {
  uid: string;
  user: IAllUsersListItem;
  overall: IStatBucket;
  clubs: Record<BotmClub, IStatBucket>;
  skillsets: Record<OsuMapCategory, IStatBucket>;
}

export function isOsuScoreMod(value: string): value is OsuScoreMod {
  return VALID_OSU_SCORE_MODS.includes(value as OsuScoreMod);
}
