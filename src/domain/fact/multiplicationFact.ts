/**
 * A multiplication fact (CONTEXT.md): a pair of factors and their product.
 * Factor order does not matter; the id is `min:max`.
 */

export interface MultiplicationFact {
  readonly id: string
  readonly factors: readonly [smaller: number, larger: number]
  readonly product: number
}

/** Fact id of an unordered pair in the `min:max` format. */
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

/** A factor that has a direct one-line hint rule: 0, 1, 2, 5, 10. */
export function isSimpleFactor(factor: number): boolean {
  return factor === 0 || factor === 1 || factor === 2 || factor === 5 || factor === 10
}

/** A simple fact has at least one simple factor; otherwise it is a hard fact. */
export function isSimpleFact(fact: MultiplicationFact): boolean {
  return isSimpleFactor(fact.factors[0]) || isSimpleFactor(fact.factors[1])
}

/** Builds a fact from an id in the `min:max` format. */
export function factFromId(id: string): MultiplicationFact {
  const [a, b] = id.split(':').map(Number)
  return makeFact(a, b)
}

/** Every fact: factors 0–10 inclusive, 66 unique unordered pairs. */
export function allFacts(): readonly MultiplicationFact[] {
  const facts: MultiplicationFact[] = []
  for (let a = 0; a <= 10; a += 1) {
    for (let b = a; b <= 10; b += 1) {
      facts.push(makeFact(a, b))
    }
  }
  return facts
}
