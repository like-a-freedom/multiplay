/** Формат даты для экранов: `YYYY-MM-DD` → `дд.мм.гггг`. */
export function formatDateRu(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}
