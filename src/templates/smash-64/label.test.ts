import { describe, expect, it } from "vite-plus/test";

import { smash64SlotLabel } from "./label";

// As the names are printed on the slots in docs/references/smash-64/.
describe("a fighter's name on a Smash 64 slot", () => {
  it("is printed in capitals", () => {
    expect(smash64SlotLabel("Luigi")).toBe("LUIGI");
    expect(smash64SlotLabel("Pikachu")).toBe("PIKACHU");
    expect(smash64SlotLabel("Dark Samus")).toBe("DARK SAMUS");
  });

  it("prints Donkey Kong as the game does: DK", () => {
    expect(smash64SlotLabel("Donkey Kong")).toBe("DK");
  });

  it("shortens a long name's first word to its initial, as C.FALCON", () => {
    expect(smash64SlotLabel("Captain Falcon")).toBe("C.FALCON");
    expect(smash64SlotLabel("Pokémon Trainer")).toBe("P.TRAINER");
    expect(smash64SlotLabel("Mr. Game & Watch")).toBe("M.GAME & WATCH");
  });

  it("stays on one line however long, to be squeezed to fit, as JIGGLYPUFF is", () => {
    expect(smash64SlotLabel("Jigglypuff")).toBe("JIGGLYPUFF");
    expect(smash64SlotLabel("Corrinocorrinoo")).toBe("CORRINOCORRINOO");
  });
});
