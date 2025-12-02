import { type IFirebaseError } from "@/types";

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
      return "Указанные вами учетные данные неверны. Перепроверьте указанный адрес электронной почты и пароль!";
    case "auth/email-already-in-use":
      return "Указанный вами адрес электронной почты уже зарегистрирован. Войдите или зарегистрируйте другой.";
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
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor((totalSeconds % 3600) % 60);
  return [
    `${hours.toString().padStart(2, "0")}`,
    `${minutes.toString().padStart(2, "0")}`,
    `${seconds.toString().padStart(2, "0")}`,
  ].join(":");
}
