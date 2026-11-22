import { describe, expect, it } from "vite-plus/test";

import { SMASH_3DS_LAYOUT } from "./layout";
import { PANEL_COUNT, smash3dsCards, smash3dsTokenHome } from "./panels";

describe("Smash for 3DS player cards", () => {
  const cards = smash3dsCards();
  const { bottomScreen } = SMASH_3DS_LAYOUT;

  it("puts four cards side by side across the touch screen, as the game does", () => {
    expect(cards).toHaveLength(PANEL_COUNT);
    // Measured from the 320x240 touch screen reference, tripled: 2 to 318 across.
    expect(cards[0]!.x).toBeCloseTo(bottomScreen.x + 6);
    expect(cards[3]!.x + cards[3]!.width).toBeCloseTo(bottomScreen.x + 954);
    for (const [index, card] of cards.entries()) {
      expect(card.y).toBe(cards[0]!.y);
      if (index > 0) expect(card.x).toBeGreaterThan(cards[index - 1]!.x + cards[index - 1]!.width);
    }
  });

  it("keeps the cards on the touch screen, below the top screen", () => {
    for (const card of cards) {
      expect(card.y).toBeGreaterThan(SMASH_3DS_LAYOUT.topScreen.height);
      expect(card.y + card.height).toBeLessThan(bottomScreen.y + bottomScreen.height);
    }
  });

  it("rests each token inside its own card", () => {
    for (const card of cards) {
      const { x, y } = smash3dsTokenHome(card);
      expect(x).toBeGreaterThan(card.x);
      expect(x).toBeLessThan(card.x + card.width);
      expect(y).toBeGreaterThan(card.y);
      expect(y).toBeLessThan(card.y + card.height);
    }
  });
});
