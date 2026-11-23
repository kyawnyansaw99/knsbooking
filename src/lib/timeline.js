import { DAY_END_HOUR, DAY_START_HOUR } from './time.js';

// Shared geometry for horizontal day timelines (business hours → 0–100%).
const DAY_START = DAY_START_HOUR * 60;
const SPAN = (DAY_END_HOUR - DAY_START_HOUR) * 60;

export const HOURS = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);

export function pct(minutes) {
  return Math.min(100, Math.max(0, ((minutes - DAY_START) / SPAN) * 100));
}
