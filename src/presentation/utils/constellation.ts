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
  const perOrbit = Math.ceil(count / radii.length)
  const positions: StarPosition[] = []

  for (let index = 0; index < count; index += 1) {
    const orbit = Math.floor(index / perOrbit)
    const step = index % perOrbit
    const angle = (step / perOrbit) * Math.PI * 2 - Math.PI / 2 + orbit * 0.35
    positions.push({
      x: center + radii[orbit] * Math.cos(angle),
      y: center + radii[orbit] * Math.sin(angle),
    })
  }
  return positions
}

/** Path of a small star centered on the origin. */
export const STAR_PATH = 'M 0 -7 L 2 -2.2 L 7 -2.2 L 3 1 L 4.4 6 L 0 3 L -4.4 6 L -3 1 L -7 -2.2 L -2 -2.2 Z'
