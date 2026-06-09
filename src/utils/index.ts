import { VALID_MODS_FOR_CATEGORY } from "@/constants";
import { type IFirebaseError } from "@/types/global";
import { OsuMapCategory } from "@/types/osumaps";
import { isOsuScoreMod } from "@/types/scores";

export function getFirebaseErrorMsg(error: IFirebaseError | Error): string {
  if (!("code" in error)) {
    return error.message;
  }
  switch (error.code) {
    case "auth/invalid-email":
      return "Указанный вами адрес электронной почты не зарегистрирован!";
    case "auth/missing-password":
      return "Вы не указали пароль!";
    case "auth/invalid-credential":
      return "Указанные вами учетные данные неверны. Перепроверь указанный адрес электронной почты и пароль!";
    case "auth/email-already-in-use":
      return "Указанный вами адрес электронной почты уже зарегистрирован. Войди или зарегистрируй другой.";
    default:
      return error.message;
  }
}

export function getScrollbarWidth(): number {
  const scrollDiv = document.createElement("div");
  scrollDiv.className = "scrollbar-measure";
  document.body.appendChild(scrollDiv);

  const width = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);

  return width;
}

export function fromDurationToSeconds(duration: string): number {
  const durationArr = duration.split(":").reverse().map(Number);
  const seconds =
    (durationArr[0] ?? 0) +
    60 * (durationArr[1] ?? 0) +
    3600 * (durationArr[2] ?? 0);
  return seconds;
}

export function fromTotalSecondsToLabel(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor((totalSeconds % 3600) % 60);
  return [hours, minutes, seconds]
    .map((item) => `${item}`.padStart(2, "0"))
    .join(":");
}

export function getLeftAmountLabel(amount: number): string {
  if (amount === 0) return "Нет игроков";
  let ending = "ов";
  const lastDigit = amount % 10;
  if (lastDigit === 1) ending = "";
  else if ([2, 3, 4].includes(lastDigit)) ending = "а";
  const lastTwoDigits = amount % 100;
  if ([11, 12, 13, 14].includes(lastTwoDigits)) ending = "ов";
  return `${amount} игрок${ending}`;
}

export function getCurrentDateIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentTimeIso(date: Date): string {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function isFirstTimeBeforeSecond(t1: string, t2: string): boolean {
  const [h1, min1] = t1.split(":").map(Number);
  const [h2, min2] = t2.split(":").map(Number);

  if (
    h1 === undefined ||
    h2 === undefined ||
    min1 === undefined ||
    min2 === undefined
  )
    return false;

  if (h1 < h2) return true;
  if (h1 > h2) return false;

  return min1 < min2;
}

export function fromMinsToDurationLabel(mins: number) {
  const resultArr: string[] = [];
  const hours = Math.floor(mins / 60);
  if (hours) resultArr.push(`${hours} ч`);
  const minutes = mins % 60;
  if (minutes) resultArr.push(`${minutes} мин`);
  return resultArr.join(" ");
}

export function fromSecondsToDurationLabel(totalSeconds: number): string {
  const SECONDS_IN_DAY = 86400;

  const days = Math.floor(totalSeconds / SECONDS_IN_DAY);
  const remainingSeconds = totalSeconds % SECONDS_IN_DAY;

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = Math.floor(remainingSeconds % 60);

  const timeString = [
    `${hours.toString().padStart(2, "0")}`,
    `${minutes.toString().padStart(2, "0")}`,
    `${seconds.toString().padStart(2, "0")}`,
  ].join(":");

  if (days > 0) {
    const mod10 = days % 10;
    const mod100 = days % 100;

    let dayWord = "дней";
    if (mod10 === 1 && mod100 !== 11) {
      dayWord = "день";
    } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
      dayWord = "дня";
    }

    return `${days} ${dayWord}, ${timeString}`;
  }

  return timeString;
}

export function pluralizeRu(
  count: number,
  words: [string, string, string]
): string {
  const cases = [2, 0, 1, 1, 1, 2];
  const caseIndex = count % 10 < 5 ? Math.abs(count % 10) : 5;
  const wordIndex =
    count % 100 > 4 && count % 100 < 20 ? 2 : (cases[caseIndex] ?? 2);
  return words[wordIndex] ?? "";
}

export function getMembershipDurationLabel(startDate: Date | null): string {
  if (!startDate) return "Дата неизвестна";

  const now = new Date();
  if (startDate > now) return "Меньше дня";

  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const weeks = Math.floor(days / 7);
  days = days % 7;

  const parts = [];
  if (years > 0)
    parts.push(`${years} ${pluralizeRu(years, ["год", "года", "лет"])}`);
  if (months > 0)
    parts.push(
      `${months} ${pluralizeRu(months, ["месяц", "месяца", "месяцев"])}`
    );
  if (weeks > 0)
    parts.push(
      `${weeks} ${pluralizeRu(weeks, ["неделю", "недели", "недель"])}`
    );
  if (days > 0)
    parts.push(`${days} ${pluralizeRu(days, ["день", "дня", "дней"])}`);

  if (parts.length === 0) return "Меньше дня";
  return parts.join(", ");
}

export function formatModsList(mods: string[]): string {
  return mods.map((modStr) => modStr.toUpperCase()).join(", ");
}

export function formatMapRank(rank: string): string {
  if (rank === "SH") return "S";
  if (rank === "X" || rank === "SS") return "SS";
  if (rank === "XH" || rank === "SSH") return "SS";
  return rank;
}

export const isValidModCombinationForCategory = (
  playedMods: string[],
  category: OsuMapCategory
): boolean => {
  const cleanedMods = playedMods
    .map((m) => m.toUpperCase())
    .filter((m) => m !== "NM" && m !== "NF" && m !== "SO")
    .sort();

  const modKey = (
    cleanedMods.length > 0 ? cleanedMods.join("") : "nm"
  ).toLowerCase();

  const allowedMods = VALID_MODS_FOR_CATEGORY[category];

  if (!allowedMods || !isOsuScoreMod(modKey)) return false;

  return allowedMods.includes(modKey);
};

export const hexToRgbString = (hex: string): string | null => {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6 && cleanHex.length !== 8) return null;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;

  return `${r}, ${g}, ${b}`;
};

export const getContrastInfo = (hex: string) => {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    return { isLight: false, isExtremelyLight: false, isExtremelyDark: false };
  }

  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  return {
    isLight: yiq >= 128,
    isExtremelyLight: yiq >= 240,
    isExtremelyDark: yiq <= 20,
  };
};
