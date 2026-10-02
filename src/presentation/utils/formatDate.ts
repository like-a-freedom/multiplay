/** Localized date format for screens: year-month-day to day-month-year. */
export function formatDateRu(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}
