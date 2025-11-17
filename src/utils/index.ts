export function getScrollbarWidth() {
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

export function fromTotalSecondsToLabel(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor((totalSeconds % 3600) % 60);
  return [hours, minutes, seconds]
    .map((item) => `${item}`.padStart(2, "0"))
    .join(":");
}
