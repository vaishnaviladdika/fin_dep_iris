export const SEPTEMBER_CSV_DAYS = [
  { day: 5, file: 'september5.csv' },
  { day: 6, file: 'september6.csv' },
  { day: 7, file: 'september7.csv' },
  { day: 8, file: 'september 8.csv' },
  { day: 9, file: 'september 9.csv' },
  { day: 10, file: 'september 10.csv.csv' },
  { day: 11, file: 'september11.csv' }, // ✅ FIXED
];

export function getCsvUrl(filename) {
  return `/${encodeURIComponent(filename)}`;
}