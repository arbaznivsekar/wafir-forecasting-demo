// The only place numbers and dates are turned into text. Values keep the 2 decimals stored in data.json.

const MINUS = "−";

const number = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1,234.50 (a real minus sign for negatives). */
export function num(n: number): string {
  return number.format(n).replace("-", MINUS);
}

/** +2.32 / −0.02 */
export function signed(n: number): string {
  return n > 0 ? `+${num(n)}` : num(n);
}

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** 1,234 (whole units). */
export const int = (n: number): string => whole.format(n);

const oneDecimal = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** 12.4 (forecasts are stored to one decimal). */
export const dec1 = (n: number): string => oneDecimal.format(n);

/** Boxes as a number: whole when it is a whole box count, one decimal after a short delivery. */
export const boxCount = (n: number): string => (Number.isInteger(n) ? int(n) : dec1(n));

/** "1 box" or "13 boxes". */
export const boxLabel = (n: number): string => `${boxCount(n)} ${n === 1 ? "box" : "boxes"}`;

export const pct = (n: number): string => `${num(n)}%`;
export const pts = (n: number): string => `${signed(n)} pts`;
export const kwd = (n: number): string => `KWD ${num(n)}`;

export function range(min: number, max: number, fmt: (n: number) => string): string {
  return `${fmt(min)} to ${fmt(max)}`;
}

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const dayWithWeekday = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

// "YYYY-MM-DD" is read as UTC so the label never shifts with the visitor's timezone.
const toDate = (iso: string): Date => new Date(`${iso}T00:00:00Z`);

export const shortDate = (iso: string): string => day.format(toDate(iso));
export const longDate = (iso: string): string => dayWithWeekday.format(toDate(iso));
