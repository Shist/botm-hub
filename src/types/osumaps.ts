export enum OsuMapCategory {
  NM1 = "nm1",
  NM2 = "nm2",
  NM3 = "nm3",
  NM4 = "nm4",
  NM5 = "nm5",
  NM6 = "nm6",
  NM7 = "nm7",
  HD1 = "hd1",
  HD2 = "hd2",
  HD3 = "hd3",
  HR1 = "hr1",
  HR2 = "hr2",
  HR3 = "hr3",
  DT1 = "dt1",
  DT2 = "dt2",
  DT3 = "dt3",
  DT4 = "dt4",
  FM1 = "fm1",
  FM2 = "fm2",
  FM3 = "fm3",
  TB = "tb",
}

export interface IOsuMap {
  id: number;
  mapsetId: number;
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

export function isOsuMapCategory(value: string): value is OsuMapCategory {
  return Object.values(OsuMapCategory).includes(value as OsuMapCategory);
}
