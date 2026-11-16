/**
 * Audio for the whole app: one director, playing through the browser, with every file taken from
 * the asset layer. A template calls `useScreenAudio` and the director does the rest.
 */
import { inject, type InjectionKey, type Ref, watch } from "vue";

import { resolveAsset } from "../asset-layer";
import { browserStorage } from "../browser-storage";
import type { Box } from "../selection/navigate";
import type { Selection } from "../selection/selection";
import type { Point } from "../selection/useHand";
import type { Template } from "../templates/screen";
import { createAudioDirector } from "./director";
import { handSounds, menuMusicId, selectionSounds, soundEffectId } from "./sounds";

export const audio = createAudioDirector({
  createSound: (url) => new Audio(url),
  storage: browserStorage(),
});
audio.unlockOnFirstInteraction(window);

/** A manifest id's file, or undefined if it cannot be resolved: sound never stops selecting. */
function fileOf(id: string): string | undefined {
  try {
    return resolveAsset(id);
  } catch {
    return undefined;
  }
}

function playAssets(ids: readonly string[]) {
  for (const id of ids) {
    const file = fileOf(id);
    if (file) audio.play(file);
  }
}

export interface ScreenAudio {
  /** The template whose music and effects play. It may change while the screen is up. */
  readonly template: () => Template;
  readonly selection: Ref<Selection>;
  readonly hand: Ref<Point>;
  /** Each slot's box on the stage, in slot order. */
  readonly slots: () => readonly Box[];
}

/** Provided as true around a screen that is only a preview, which makes no sound. */
export const SILENT_SCREEN: InjectionKey<boolean> = Symbol("silent screen");

/** Gives a screen its template's menu music and the sounds of selecting. */
export function useScreenAudio({ template, selection, hand, slots }: ScreenAudio) {
  if (inject(SILENT_SCREEN, false)) return { playBack: () => {} };

  watch(
    template,
    (current) => {
      const file = fileOf(menuMusicId(current));
      if (file) audio.setMusic(file);
    },
    { immediate: true },
  );
  watch(selection, (after, before) => playAssets(selectionSounds(template(), before, after)));
  watch(hand, (to, from) => playAssets(handSounds(template(), slots(), from, to)));

  return {
    /** Plays the sound of going back. */
    playBack: () => playAssets([soundEffectId(template(), "back")]),
  };
}
