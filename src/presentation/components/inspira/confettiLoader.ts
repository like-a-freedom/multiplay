/** Lazy boundary: the celebration renderer is not part of the card-session bundle. */
export function loadConfetti() {
  return import('canvas-confetti')
}
