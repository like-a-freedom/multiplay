import { capitalize, numberWord } from '@/domain/learning/numberWords'

/** Screen-reader phrasing for multiplication expressions in Russian (DESIGN.md). */
export function spokenExpression(smaller: number, larger: number): string {
  return `${capitalize(numberWord(smaller))} умножить на ${numberWord(larger)}`
}
