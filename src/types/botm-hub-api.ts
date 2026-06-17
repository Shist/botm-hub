import { type IOsuApiEvent } from "@/types/scores";

export interface IVerifyPlayerResponse {
  isValid: boolean;
  reason?: "NOT_FOUND" | "NOT_BY";
  osuId?: number;
  nick?: string;
  error?: string;
}

export interface IFetchMatchResponse {
  events?: IOsuApiEvent[];
  error?: string;
}
