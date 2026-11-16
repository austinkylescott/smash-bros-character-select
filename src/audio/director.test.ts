import { describe, expect, it } from "vite-plus/test";

import { createAudioDirector, type Sound } from "./director";

/** A fake audio backend: every sound it made, and whether each is playing. */
function fakeAudio() {
  const sounds: (Sound & { url: string; playing: boolean })[] = [];
  const createSound = (url: string) => {
    const sound = {
      url,
      loop: false,
      playing: false,
      play() {
        sound.playing = true;
        return Promise.resolve();
      },
      pause() {
        sound.playing = false;
      },
    };
    sounds.push(sound);
    return sound;
  };
  const playing = () => sounds.filter((sound) => sound.playing).map((sound) => sound.url);
  return { sounds, createSound, playing };
}

function memoryStorage(initial: Record<string, string> = {}) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  };
}

describe("the audio director", () => {
  it("plays nothing before the first interaction", () => {
    const audio = fakeAudio();
    const director = createAudioDirector({ createSound: audio.createSound });

    director.setMusic("menu.ogg");
    director.play("drop.wav");

    expect(audio.playing()).toEqual([]);
  });

  it("starts the music looping on the first interaction", () => {
    const audio = fakeAudio();
    const director = createAudioDirector({ createSound: audio.createSound });
    const page = new EventTarget();
    director.unlockOnFirstInteraction(page);

    director.setMusic("menu.ogg");
    page.dispatchEvent(new Event("pointerdown"));

    expect(audio.playing()).toEqual(["menu.ogg"]);
    expect(audio.sounds[0]!.loop).toBe(true);
  });

  it("swaps the track when the template changes, and keeps it playing when it does not", () => {
    const audio = fakeAudio();
    const director = createAudioDirector({ createSound: audio.createSound });
    director.unlock();

    director.setMusic("ultimate.ogg");
    director.setMusic("melee.ogg");
    director.setMusic("melee.ogg");

    expect(audio.playing()).toEqual(["melee.ogg"]);
    expect(audio.sounds.map((sound) => sound.url)).toEqual(["ultimate.ogg", "melee.ogg"]);
  });

  it("silences music and effects while muted, and resumes the music on unmute", () => {
    const audio = fakeAudio();
    const director = createAudioDirector({ createSound: audio.createSound });
    director.unlock();
    director.setMusic("menu.ogg");

    director.muted.value = true;
    director.play("drop.wav");
    expect(audio.playing()).toEqual([]);

    director.muted.value = false;
    expect(audio.playing()).toEqual(["menu.ogg"]);
  });

  it("carries on quietly when a sound cannot be made or refuses to play", async () => {
    const broken = createAudioDirector({
      createSound: () => {
        throw new Error("no audio here");
      },
    });
    broken.unlock();
    expect(() => broken.setMusic("menu.ogg")).not.toThrow();
    expect(() => broken.play("drop.wav")).not.toThrow();

    const refusing = createAudioDirector({
      createSound: () => ({
        loop: false,
        play: () => Promise.reject(new Error("NotAllowedError")),
        pause() {},
      }),
    });
    refusing.unlock();
    refusing.play("drop.wav");
    refusing.setMusic("menu.ogg");
    // An unhandled rejection would fail the run once the microtasks settle.
    await new Promise((resolve) => setTimeout(resolve));
  });

  it("remembers being muted on the next visit", () => {
    const storage = memoryStorage();
    const first = createAudioDirector({ createSound: fakeAudio().createSound, storage });
    first.muted.value = true;

    const audio = fakeAudio();
    const next = createAudioDirector({ createSound: audio.createSound, storage });
    next.unlock();
    next.setMusic("menu.ogg");

    expect(next.muted.value).toBe(true);
    expect(audio.playing()).toEqual([]);
  });
});
