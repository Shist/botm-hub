import { CATEGORY_MULTIPLIERS, MOD_SR_BONUSES } from "@/constants";
import { OsuMapCategory } from "@/types/osumaps";

export const getAdjustedStarRate = (
  baseStars: number,
  category: OsuMapCategory,
  mods: string[]
): number => {
  const catUpper = category.toUpperCase();
  if (!catUpper.startsWith("FM") && catUpper !== "TB") return baseStars;

  let extraStars = 0;
  if (mods.includes("FL")) extraStars += MOD_SR_BONUSES.FL;
  if (mods.includes("EZ")) extraStars += MOD_SR_BONUSES.EZ;
  if (mods.includes("HR")) extraStars += MOD_SR_BONUSES.HR;
  if (mods.includes("HD")) extraStars += MOD_SR_BONUSES.HD;

  return baseStars + extraStars;
};

export const getAdjustedScore = (rawScore: number, mods: string[]): number => {
  return mods.includes("EZ") ? Math.round(rawScore * 1.8) : rawScore;
};

export const getMaxScoreForMods = (mods: string[]): number => {
  let multiplier = 1.0;
  if (mods.includes("EZ")) multiplier *= 0.9;
  if (mods.includes("DT")) multiplier *= 1.2;
  if (mods.includes("HR")) multiplier *= 1.1;
  if (mods.includes("HD")) multiplier *= 1.06;
  if (mods.includes("FL")) multiplier *= 1.12;
  return 1000000 * multiplier;
};

export const calculateBasePoints = (
  percentage: number,
  stars: number
): number => {
  if (percentage < 60) return 0;
  const multiplier = 1 + Math.pow((percentage - 60) / 40, 2);
  return Math.pow(stars, 3) * multiplier;
};

export const calculateFinalCategoryPoints = (
  basePoints: number,
  category: OsuMapCategory
): number => {
  return basePoints * CATEGORY_MULTIPLIERS[category];
};
