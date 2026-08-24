import { type IOsuApiEvent } from "@/types/scores";

export interface IVerifyPlayerResponse {
  isValid: boolean;
  reason?: "NOT_FOUND" | "NOT_BY";
  osuId?: number;
  nick?: string;
  error?: string;
}

export interface IOsuMatchUser {
  id: number;
  username: string;
}

export interface IFetchMatchResponse {
  match?: unknown;
  events?: IOsuApiEvent[];
  users?: IOsuMatchUser[];
  first_event_id?: number | null;
  latest_event_id?: number | null;
  error?: string;
}
