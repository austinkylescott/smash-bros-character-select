import { describe, expect, it } from "vite-plus/test";

import { meleeSlotLabel } from "./label";

// As the names are printed on the slots in docs/references/melee/.
describe("a fighter's name on a Melee slot", () => {
  it("is printed in capitals", () => {
    expect(meleeSlotLabel("Mario")).toEqual(["MARIO"]);
  });

  it("keeps names up to Young Link's length on one line", () => {
    expect(meleeSlotLabel("Ganondorf")).toEqual(["GANONDORF"]);
    expect(meleeSlotLabel("Young Link")).toEqual(["YOUNG LINK"]);
  });

  it("splits longer names over two lines, as Ice Climbers", () => {
    expect(meleeSlotLabel("Ice Climbers")).toEqual(["ICE", "CLIMBERS"]);
    expect(meleeSlotLabel("Mr. Game & Watch")).toEqual(["MR. GAME", "& WATCH"]);
  });

  it("keeps a long single word on one line, to be squeezed to fit", () => {
    expect(meleeSlotLabel("Jigglypuffington")).toEqual(["JIGGLYPUFFINGTON"]);
  });
});
