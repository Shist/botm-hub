export type ISeasonalEvent =
  | "halloween"
  | "new_year"
  | "april_fools"
  | "valentines"
  | "osu_bday"
  | null;

export interface ISeasonalSettings {
  valCorners: boolean;
  valHearts: boolean;
  aprilClowns: boolean;
  aprilCursor: boolean;
  osuPeppy: boolean;
  osuCursor: boolean;
  halloweenPumpkins: boolean;
  newYearBranches: boolean;
  newYearSnow: boolean;
}

export interface IFloatingParticle {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  driftDuration: number;
}
