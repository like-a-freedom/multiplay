/**
 * Факт умножения (CONTEXT.md): пара множителей и их произведение.
 * Перестановка множителей представляет тот же факт, ID — `min:max`.
 */

export interface MultiplicationFact {
  readonly id: string
  readonly factors: readonly [smaller: number, larger: number]
  readonly product: number
}

/** ID факта для неупорядоченной пары: `min(a,b):max(a,b)`. */
export function factId(a: number, b: number): string {
  return a <= b ? `${a}:${b}` : `${b}:${a}`
}

export function makeFact(a: number, b: number): MultiplicationFact {
  const smaller = Math.min(a, b)
  const larger = Math.max(a, b)
  return {
    id: factId(a, b),
    factors: [smaller, larger],
    product: a * b,
  }
}

/** Простой множитель: разбирается стратегией равных групп (0, 1, 2, 5, 10). */
export function isSimpleFactor(factor: number): boolean {
  return factor === 0 || factor === 1 || factor === 2 || factor === 5 || factor === 10
}

/** Простой факт: хотя бы один множитель простой; иначе — трудный. */
export function isSimpleFact(fact: MultiplicationFact): boolean {
  return isSimpleFactor(fact.factors[0]) || isSimpleFactor(fact.factors[1])
}

/** Факт по ID `min:max`. */
export function factFromId(id: string): MultiplicationFact {
  const [a, b] = id.split(':').map(Number)
  return makeFact(a, b)
}

/** Каталог всех фактов: множители 0–10 включительно, 66 уникальных неупорядоченных пар. */
export function allFacts(): readonly MultiplicationFact[] {
  const facts: MultiplicationFact[] = []
  for (let a = 0; a <= 10; a += 1) {
    for (let b = a; b <= 10; b += 1) {
      facts.push(makeFact(a, b))
    }
  }
  return facts
}
