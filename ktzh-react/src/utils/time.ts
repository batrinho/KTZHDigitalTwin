export function fmtTime(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}
