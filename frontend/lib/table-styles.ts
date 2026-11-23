// Cell styles shared by every table. Text wraps so four columns fit a 375px screen;
// only wide tables pin their first column while scrolling sideways.
export const headCell =
  "whitespace-normal border-b border-border bg-card px-2.5 py-2 text-right align-bottom font-medium";
export const labelHead = `${headCell} text-left`;
export const labelCell = "h-11 whitespace-normal border-b border-border px-2.5 py-2 text-left font-medium";
export const numCell = "h-11 whitespace-normal border-b border-border px-2.5 py-2 text-right";
export const stickyLabelHead = `${headCell} sticky left-0 z-20 text-left`;
export const stickyLabel = `${labelCell} sticky left-0 z-10 bg-card whitespace-nowrap`;
