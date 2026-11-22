import { describe, expect, it } from "vite-plus/test";

import { wiiUSlotLabel } from "./label";

// As the names are printed on the slots in docs/references/smash-4-wii-u/.
describe("a fighter's name on a Smash for Wii U slot", () => {
  it("is printed in capitals", () => {
    expect(wiiUSlotLabel("Mario")).toBe("MARIO");
    expect(wiiUSlotLabel("Zero Suit Samus")).toBe("ZERO SUIT SAMUS");
  });

  it("stays on one line however long, to be squeezed to fit", () => {
    expect(wiiUSlotLabel("Mr. Game & Watch")).toBe("MR. GAME & WATCH");
    expect(wiiUSlotLabel("Rosalina & Luma")).toBe("ROSALINA & LUMA");
  });

  it("leaves Mii and Wii Fit in their own case", () => {
    expect(wiiUSlotLabel("Mii")).toBe("Mii");
    expect(wiiUSlotLabel("Wii Fit Trainer")).toBe("Wii Fit TRAINER");
    expect(wiiUSlotLabel("Mii Brawler")).toBe("Mii BRAWLER");
  });
});
