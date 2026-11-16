/**
 * A roster a user makes: what it holds and the rules for editing it. Every edit gives back a new
 * roster and leaves the old one as it was. An edit the rules forbid gives back the same roster.
 */
import { isOfficialFighter, officialFighter, type OfficialRoster } from "../official";
import { templateName } from "../templates/catalogue";
import type { Template } from "../templates/screen";

export interface RosterFighter {
  /** An official fighter's id. */
  readonly id: string;
  /** The name shown in place of the fighter's own, when the user has edited it. */
  readonly name?: string;
}

export interface Roster {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly defaultTemplate: Template;
  readonly randomSlot: boolean;
  readonly fighters: readonly RosterFighter[];
}

/** The most fighters a roster holds. It needs at least one to be saved. */
export const MAX_FIGHTERS = 120;

/** A roster started from scratch. It has no fighters yet, so it cannot be saved as it is. */
export const newRoster = (id: string): Roster => ({
  id,
  name: "New roster",
  description: "",
  defaultTemplate: "ultimate",
  randomSlot: true,
  fighters: [],
});

/** A roster started as a copy of an official one, free to edit. */
export const copyOfOfficial = (id: string, official: OfficialRoster): Roster => ({
  id,
  name: `Copy of ${templateName(official.game)}`,
  description: "",
  defaultTemplate: official.game,
  randomSlot: official.randomSlot,
  fighters: official.fighters.map((fighter) => ({ id: fighter.id })),
});

const has = (roster: Roster, fighterId: string) =>
  roster.fighters.some((fighter) => fighter.id === fighterId);

/** Whether a fighter can join: it is an official fighter, not already in, and there is room. */
export const canAddFighter = (roster: Roster, fighterId: string): boolean =>
  isOfficialFighter(fighterId) && !has(roster, fighterId) && roster.fighters.length < MAX_FIGHTERS;

/** Adds a fighter at the end. */
export function addFighter(roster: Roster, fighterId: string): Roster {
  if (!canAddFighter(roster, fighterId)) return roster;
  return { ...roster, fighters: [...roster.fighters, { id: fighterId }] };
}

/** Takes a fighter out. */
export const removeFighter = (roster: Roster, fighterId: string): Roster => ({
  ...roster,
  fighters: roster.fighters.filter((fighter) => fighter.id !== fighterId),
});

/** Moves a fighter to a place in the order, counted from 0. A place past either end is that end. */
export function moveFighter(roster: Roster, fighterId: string, to: number): Roster {
  const from = roster.fighters.findIndex((fighter) => fighter.id === fighterId);
  if (from === -1) return roster;

  const fighters = [...roster.fighters];
  const [moved] = fighters.splice(from, 1);
  fighters.splice(Math.max(0, Math.min(to, fighters.length)), 0, moved!);
  return { ...roster, fighters };
}

/**
 * Sets the name a fighter is shown with. A blank name, or the fighter's own, gives the fighter its
 * own name back.
 */
export function nameFighter(roster: Roster, fighterId: string, name: string): Roster {
  const shown = name.trim();
  const own = isOfficialFighter(fighterId) ? officialFighter(fighterId).name : "";
  const named: RosterFighter =
    shown && shown !== own ? { id: fighterId, name: shown } : { id: fighterId };
  return {
    ...roster,
    fighters: roster.fighters.map((fighter) => (fighter.id === fighterId ? named : fighter)),
  };
}

/** Everything that stops a roster being saved. An empty list means it can be. */
export function rosterProblems(roster: Roster): string[] {
  const problems: string[] = [];
  if (!roster.name.trim()) problems.push("A roster needs a name.");
  if (roster.fighters.length < 1) problems.push("A roster needs at least one fighter.");
  if (roster.fighters.length > MAX_FIGHTERS)
    problems.push(`A roster holds at most ${MAX_FIGHTERS} fighters.`);
  if (new Set(roster.fighters.map((fighter) => fighter.id)).size < roster.fighters.length)
    problems.push("A roster holds each fighter once.");
  return problems;
}
