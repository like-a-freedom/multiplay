/** Озвучивание примера для скринридера: «Семь умножить на восемь» (DESIGN.md). */

const NUMBER_WORDS: Record<number, string> = {
  0: 'Ноль',
  1: 'Один',
  2: 'Два',
  3: 'Три',
  4: 'Четыре',
  5: 'Пять',
  6: 'Шесть',
  7: 'Семь',
  8: 'Восемь',
  9: 'Девять',
  10: 'Десять',
}

export function spokenExpression(smaller: number, larger: number): string {
  return `${NUMBER_WORDS[smaller] ?? smaller} умножить на ${NUMBER_WORDS[larger] ?? larger}`
}
