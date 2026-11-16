/**
 * The audio director: the one thing that makes sound. It stays silent until the visitor first
 * interacts with the page, as browsers block sound before that, then loops the menu track and
 * plays effects on request. Muting silences both, and is remembered between visits.
 */
import { ref, watch } from "vue";

/** The part of an `HTMLAudioElement` the director uses. */
export interface Sound {
  loop: boolean;
  play(): Promise<void> | void;
  pause(): void;
}

/** The part of `localStorage` the director uses. */
export type MuteStorage = Pick<Storage, "getItem" | "setItem">;

export interface AudioDirectorOptions {
  createSound: (url: string) => Sound;
  /** Where the mute setting is kept between visits. Without it, every visit starts unmuted. */
  storage?: MuteStorage;
}

const MUTED_KEY = "audio-muted";

export type AudioDirector = ReturnType<typeof createAudioDirector>;

export function createAudioDirector({ createSound, storage }: AudioDirectorOptions) {
  let unlocked = false;
  /** The current track. Its sound is missing when the track could not be loaded. */
  let music: { url: string; sound: Sound | undefined } | undefined;

  const muted = ref(readMuted(storage));
  watch(
    muted,
    (now) => {
      writeMuted(storage, now);
      const sound = music?.sound;
      if (!sound) return;
      if (now) sound.pause();
      else if (unlocked) start(sound);
    },
    { flush: "sync" },
  );

  // Missing or broken audio is skipped: sound must never get in the way of selecting.
  function make(url: string): Sound | undefined {
    try {
      return createSound(url);
    } catch {
      return undefined;
    }
  }

  function start(sound: Sound) {
    try {
      void Promise.resolve(sound.play()).catch(() => {});
    } catch {
      // Skipped.
    }
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    if (music?.sound && !muted.value) start(music.sound);
  }

  /** Unlocks on the first press or key on `target`, the page. */
  function unlockOnFirstInteraction(target: EventTarget) {
    const events = ["pointerdown", "keydown"];
    const once = () => {
      for (const event of events) target.removeEventListener(event, once, true);
      unlock();
    };
    for (const event of events) target.addEventListener(event, once, true);
  }

  /** Loops a track in place of the current one. The same track carries on uninterrupted. */
  function setMusic(url: string) {
    if (music?.url === url) return;
    music?.sound?.pause();
    const sound = make(url);
    if (sound) sound.loop = true;
    music = { url, sound };
    if (sound && unlocked && !muted.value) start(sound);
  }

  /** Plays an effect once. */
  function play(url: string) {
    if (!unlocked || muted.value) return;
    const sound = make(url);
    if (sound) start(sound);
  }

  return { muted, unlock, unlockOnFirstInteraction, setMusic, play };
}

// Storage can be missing or throw, as in a private window; the setting is then not remembered.
function readMuted(storage: MuteStorage | undefined): boolean {
  try {
    return storage?.getItem(MUTED_KEY) === "true";
  } catch {
    return false;
  }
}

function writeMuted(storage: MuteStorage | undefined, muted: boolean) {
  try {
    storage?.setItem(MUTED_KEY, String(muted));
  } catch {
    // Not remembered, but still muted for this visit.
  }
}
