/**
 * Star positions for the constellation: 66 facts across three orbits
 * (DESIGN.md, the knowledge map).
 */

export interface StarPosition {
  readonly x: number
  readonly y: number
}

export function constellationPositions(count: number, size = 320): readonly StarPosition[] {
  const center = size / 2
  const radii = [size * 0.18, size * 0.3, size * 0.42]
  // Allocate by circumference so the inner ring is as airy as the outer one.
  const innerCount = Math.round(count * 0.18)
  const middleCount = Math.round(count * 0.33)
  const counts = [innerCount, middleCount, count - innerCount - middleCount]
  const positions: StarPosition[] = []

  for (let orbit = 0; orbit < radii.length; orbit += 1) {
    for (let step = 0; step < counts[orbit]; step += 1) {
      const angle = (step / counts[orbit]) * Math.PI * 2 - Math.PI / 2 + orbit * 0.35
      positions.push({
        x: center + radii[orbit] * Math.cos(angle),
        y: center + radii[orbit] * Math.sin(angle),
      })
    }
  }
  return positions
}
