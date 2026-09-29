const NUMBER_WORDS = [
  'ноль',
  'один',
  'два',
  'три',
  'четыре',
  'пять',
  'шесть',
  'семь',
  'восемь',
  'девять',
  'десять',
]

export function numberWord(value: number): string {
  return NUMBER_WORDS[value] ?? String(value)
}

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}
