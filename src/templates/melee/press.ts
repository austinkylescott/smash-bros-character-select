/**
 * The one motion Melee's 3D hand makes: when it picks up or drops a token, it tips its fingertip
 * into the screen and comes back. Posed from the seconds since the token changed hands, so a
 * still scene, always posed at 0, never moves.
 */

/** How long one press lasts, down and back up. */
export const PRESS_SECONDS = 0.22;
/** How far the glove tips into the screen at the bottom of a press, in radians. */
const MOST_TILT = 0.55;

export interface PressPose {
  /** How far the glove tips its fingertip into the screen, in radians. */
  readonly tilt: number;
  /** How far down the press is, from 0 at rest to 1 at its deepest. */
  readonly press: number;
}

export function pressPose(elapsed: number): PressPose {
  if (!(elapsed > 0 && elapsed < PRESS_SECONDS)) return { tilt: 0, press: 0 };
  const press = Math.sin((Math.PI * elapsed) / PRESS_SECONDS);
  return { tilt: MOST_TILT * press, press };
}
