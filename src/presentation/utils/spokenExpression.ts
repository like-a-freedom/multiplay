import { capitalize, numberWord } from '@/domain/learning/numberWords'

/** Screen-reader phrasing of an expression in Russian (DESIGN.md): "Семь умножить на восемь". */
export function spokenExpression(smaller: number, larger: number): string {
  return `${capitalize(numberWord(smaller))} умножить на ${numberWord(larger)}`
}
