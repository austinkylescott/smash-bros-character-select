import { describe, expect, it } from "vite-plus/test";

import { PRESS_SECONDS, pressPose } from "./press";

const rest = { tilt: 0, press: 0 };

describe("how Melee's hand tilts and presses on picking up or dropping a token", () => {
  it("rests at the moment the token changes hands", () => {
    expect(pressPose(0)).toEqual(rest);
  });

  it("is pressed furthest halfway through", () => {
    const half = pressPose(PRESS_SECONDS / 2);
    expect(half.press).toBeCloseTo(1);
    expect(half.tilt).toBeGreaterThan(0);
  });

  it("is on its way down, then back up, either side of halfway", () => {
    const early = pressPose(PRESS_SECONDS / 4).press;
    const late = pressPose((PRESS_SECONDS * 3) / 4).press;
    expect(early).toBeGreaterThan(0);
    expect(early).toBeLessThan(1);
    expect(late).toBeGreaterThan(0);
    expect(late).toBeLessThan(1);
  });

  it("is back at rest once the press is over, and stays there", () => {
    expect(pressPose(PRESS_SECONDS)).toEqual(rest);
    expect(pressPose(60)).toEqual(rest);
  });

  it("rests before any press, as when nothing has changed hands yet", () => {
    expect(pressPose(Number.POSITIVE_INFINITY)).toEqual(rest);
    expect(pressPose(-1)).toEqual(rest);
  });
});
