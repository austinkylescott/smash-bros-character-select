import { describe, expect, it } from "vite-plus/test";

import { brawlSlotLabel } from "./label";

// As the names are printed on the slots in docs/references/brawl/.
describe("a fighter's name on a Brawl slot", () => {
  it("is printed in capitals", () => {
    expect(brawlSlotLabel("Mario")).toEqual(["MARIO"]);
    expect(brawlSlotLabel("Pokémon Trainer")).toEqual(["POKÉMON", "TRAINER"]);
  });

  it("keeps names up to Toon Link's length on one line", () => {
    expect(brawlSlotLabel("Toon Link")).toEqual(["TOON LINK"]);
    expect(brawlSlotLabel("Ganondorf")).toEqual(["GANONDORF"]);
  });

  it("splits longer names over two lines, from Diddy Kong's length", () => {
    expect(brawlSlotLabel("Diddy Kong")).toEqual(["DIDDY", "KONG"]);
    expect(brawlSlotLabel("Mr. Game & Watch")).toEqual(["MR. GAME", "& WATCH"]);
  });

  it("keeps a long single word on one line, to be squeezed to fit", () => {
    expect(brawlSlotLabel("Jigglypuff")).toEqual(["JIGGLYPUFF"]);
  });
});
