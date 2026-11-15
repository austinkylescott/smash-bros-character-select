import { describe, expect, it } from "vite-plus/test";

import { ultimateGrid } from "../templates/ultimate/grid";
import { neighbour } from "./navigate";

// The full Ultimate screen: 86 fighters and the random slot, 13 to a row, with a short last row
// of nine centred under the rest. Index 78 (Steve) opens it under the third column.
const { slots } = ultimateGrid(87);

describe("moving between slots with the arrow keys", () => {
  it("moves left and right in reading order, running on to the next row", () => {
    expect(neighbour(slots, 0, "right")).toBe(1);
    expect(neighbour(slots, 12, "right")).toBe(13);
    expect(neighbour(slots, 13, "left")).toBe(12);
  });

  it("stays put at either end of the grid", () => {
    expect(neighbour(slots, 0, "left")).toBe(0);
    expect(neighbour(slots, 86, "right")).toBe(86);
    expect(neighbour(slots, 0, "up")).toBe(0);
    expect(neighbour(slots, 78, "down")).toBe(78);
  });

  it("moves up and down a column", () => {
    expect(neighbour(slots, 0, "down")).toBe(13);
    expect(neighbour(slots, 14, "up")).toBe(1);
  });

  it("moves into the short last row to the slot right below", () => {
    expect(neighbour(slots, 67, "down")).toBe(78);
    expect(neighbour(slots, 78, "up")).toBe(67);
  });

  it("moves down from beyond the end of the short last row to its nearest slot", () => {
    expect(neighbour(slots, 65, "down")).toBe(78);
    expect(neighbour(slots, 77, "down")).toBe(86);
  });

  it("moves between half-offset rows to the nearest slot", () => {
    // The starter screen: rows of 5 and 4, the second half a slot in.
    const starter = ultimateGrid(9).slots;

    expect(neighbour(starter, 5, "up")).toBe(0);
    expect(neighbour(starter, 4, "down")).toBe(8);
  });
});
