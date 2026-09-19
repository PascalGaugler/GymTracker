// Rounds to `decimals` places and drops trailing zeros: 88.10000000000001 → "88.1",
// 62.55 → "62.55", 80 → "80". Stored values can carry float drift from older
// records, so anything read back from the DB is formatted before it reaches the UI.
// Trimming keeps a whole 80 kg reading as "80" instead of padding it to "80.00".
export function formatDecimal(value: number, decimals: number): string {
  return String(Number(value.toFixed(decimals)))
}
