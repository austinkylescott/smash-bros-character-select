/**
 * What a character select screen sounds like: which of a template's sounds play when the
 * selection changes or the hand moves. Shared by every template; each game supplies its own
 * recordings, named by asset id.
 */
import { hasAsset } from "../asset-layer";
import type { Box } from "../selection/navigate";
import { isReady, RANDOM, type Selection } from "../selection/selection";
import type { Point } from "../selection/useHand";
import type { Template } from "../templates/screen";

/** The six effects every template has (approved on #12). */
export type SoundEffect =
  | "hand-move"
  | "token-pick-up"
  | "token-drop"
  | "panel-toggle"
  | "back"
  | "ready-to-fight";

export const menuMusicId = (template: Template) => `${template}/music/menu`;

export const soundEffectId = (template: Template, effect: SoundEffect) =>
  `${template}/sound-effect/${effect}`;

/** The announcer's call for a fighter, or undefined for one the game has no line for. */
function announcerCallId(template: Template, fighter: string): string | undefined {
  const id = `${template}/announcer-line/${fighter}`;
  return hasAsset(id) ? id : undefined;
}

/** The asset ids to play, in order, for a change from `before` to `after` in a template. */
export function selectionSounds(template: Template, before: Selection, after: Selection): string[] {
  const effect = (name: SoundEffect) => soundEffectId(template, name);
  const sounds: string[] = [];

  const switched =
    before.panels.length !== after.panels.length ||
    after.panels.some((panel, index) => panel.kind !== before.panels[index]!.kind);
  if (switched) sounds.push(effect("panel-toggle"));

  if (after.held !== null && after.held !== before.held) sounds.push(effect("token-pick-up"));

  // A held token sent home, as Escape does, rather than dropped or taken off with its panel.
  const sentHome = before.held !== null && after.held === null && !switched;
  if (sentHome && after.panels[before.held!]?.pick === null) sounds.push(effect("back"));

  after.panels.forEach((panel, index) => {
    const was = before.panels[index];
    if (!was || was.kind !== panel.kind || was.pick !== null || panel.pick === null) return;
    sounds.push(effect("token-drop"));
    // Only official fighters have a call, and only in the games they were in.
    const call = panel.pick === RANDOM ? undefined : announcerCallId(template, panel.pick.fighter);
    if (call) sounds.push(call);
  });

  if (isReady(after) && !isReady(before)) sounds.push(effect("ready-to-fight"));

  return sounds;
}

/** The slot a point on the stage is over, or -1 off the grid. */
function slotUnder(slots: readonly Box[], { x, y }: Point): number {
  return slots.findIndex(
    (slot) => x >= slot.x && x < slot.x + slot.width && y >= slot.y && y < slot.y + slot.height,
  );
}

/** The asset ids to play as the hand moves from one point to another, by any input. */
export function handSounds(
  template: Template,
  slots: readonly Box[],
  from: Point,
  to: Point,
): string[] {
  const slot = slotUnder(slots, to);
  return slot !== -1 && slot !== slotUnder(slots, from)
    ? [soundEffectId(template, "hand-move")]
    : [];
}
