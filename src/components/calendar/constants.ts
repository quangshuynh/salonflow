/** Visible window of the day timeline, in hours (24h clock). */
export const DAY_START_HOUR = 8;
export const DAY_END_HOUR = 19;

/** Pixel height of one hour row in the timeline grid. */
export const HOUR_HEIGHT_PX = 64;

export const TIMELINE_HEIGHT_PX =
  (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT_PX;

/** Minutes since the start of the visible window. */
export function minutesIntoDay(date: Date): number {
  return (date.getHours() - DAY_START_HOUR) * 60 + date.getMinutes();
}

export function minutesToOffsetPx(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT_PX;
}
