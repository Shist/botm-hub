export type ISeasonalEvent =
  | "halloween"
  | "new_year"
  | "april_fools"
  | "valentines"
  | "osu_bday"
  | null;

export interface IFloatingParticle {
  id: number;
  left: number;
  duration: number;
  delay: number;
  size: number;
  opacity: number;
  driftDuration: number;
}
