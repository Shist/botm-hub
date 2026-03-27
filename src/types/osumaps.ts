import type { LoadingState } from "@/types/global";

export enum OsuMapCategory {
  nm1 = "nm1",
  nm2 = "nm2",
  nm3 = "nm3",
  nm4 = "nm4",
  nm5 = "nm5",
  nm6 = "nm6",
  nm7 = "nm7",
  hd1 = "hd1",
  hd2 = "hd2",
  hd3 = "hd3",
  hr1 = "hr1",
  hr2 = "hr2",
  hr3 = "hr3",
  dt1 = "dt1",
  dt2 = "dt2",
  dt3 = "dt3",
  dt4 = "dt4",
  fm1 = "fm1",
  fm2 = "fm2",
  fm3 = "fm3",
  tb = "tb",
}

export interface IOsuMap {
  id: number;
  link: string;
  category: OsuMapCategory;
  name: string;
  mapper: string;
  starRate: number;
  duration: string;
  bpm: number;
  cs: number;
  ar: number;
  od: number;
  hp: number;
  comment: string;
}

export interface IOsuMapsCategoryState {
  mapsList: IOsuMap[];
  loadingState: LoadingState;
}
