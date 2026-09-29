import { capitalize, numberWord } from '@/domain/learning/numberWords'

/** Озвучивание примера для скринридера: «Семь умножить на восемь» (DESIGN.md). */
export function spokenExpression(smaller: number, larger: number): string {
  return `${capitalize(numberWord(smaller))} умножить на ${numberWord(larger)}`
}
