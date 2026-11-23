import { describe, expect, it } from "vite-plus/test";

import {
  type AccountRoster,
  type AccountServer,
  createAccountRosters,
  type FileId,
} from "./account";
import { addCustomFighter, addFighter, newRoster, type Roster } from "./roster";
import { createRosterStore, type RosterStorage } from "./store";

/** The site's server, as one account sees it, keeping what it is sent. */
function accountServer() {
  const saved = new Map<string, AccountRoster>();
  const files = new Map<FileId, string>();
  let refusing: string | undefined;
  const server = {
    uploads: [] as string[],
    discarded: [] as FileId[],
    files,
    /** Makes the server refuse the next rosters it is sent, as it does one breaking its rules. */
    refuse(problem: string) {
      refusing = problem;
    },
    /** The account's rosters as the server gives them, the latest saved first. */
    mine: (): AccountRoster[] => [...saved.values()].reverse(),
    async uploadImage(image) {
      const file = `file-${files.size + 1}` as FileId;
      files.set(file, image);
      server.uploads.push(image);
      return file;
    },
    async save(roster) {
      if (refusing) throw new Error(refusing);
      saved.delete(roster.id);
      saved.set(roster.id, {
        ...roster,
        fighters: roster.fighters.map((fighter) =>
          "portrait" in fighter
            ? {
                ...fighter,
                portrait: {
                  ...fighter.portrait,
                  image: `https://files.test/${fighter.portrait.file}`,
                },
              }
            : fighter,
        ),
      });
    },
    async add(roster) {
      if (saved.has(roster.id)) return false;
      await server.save(roster);
      return true;
    },
    async remove(id) {
      saved.delete(id);
    },
    async discardUploads(discarded) {
      server.discarded.push(...discarded);
    },
  } satisfies AccountServer & Record<string, unknown>;
  return server;
}

function browserStorage(): RosterStorage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
  };
}

const roster = (id: string, ...fighters: string[]): Roster =>
  fighters.reduce(addFighter, { ...newRoster(id), name: `Roster ${id}` });

const image = { image: "data:image/webp;base64,AAAA", width: 400, height: 200 };
const withGoku = (id: string) =>
  addCustomFighter(roster(id, "kirby"), "custom-goku", "Goku", image);

describe("rosters saved to an account from the browser", () => {
  it("come back from the account as they were saved", async () => {
    const server = accountServer();
    const rosters = createAccountRosters(server);

    await rosters.save(roster("r1", "kirby", "fox"));

    expect(rosters.received(server.mine())).toEqual([roster("r1", "kirby", "fox")]);
  });

  it("upload a fighter's image, and come back showing it from the server", async () => {
    const server = accountServer();
    const rosters = createAccountRosters(server);

    await rosters.save(withGoku("r1"));

    expect(server.uploads).toEqual([image.image]);
    const [back] = rosters.received(server.mine());
    expect(back).toEqual({
      ...withGoku("r1"),
      fighters: [
        { id: "kirby" },
        {
          ...withGoku("r1").fighters[1],
          portrait: {
            ...image,
            image: "https://files.test/file-1",
            slot: expect.anything(),
            panel: expect.anything(),
          },
        },
      ],
    });
  });

  it("upload an image only once, when a roster from the account is saved again", async () => {
    const server = accountServer();
    const rosters = createAccountRosters(server);
    await rosters.save(withGoku("r1"));
    const [back] = rosters.received(server.mine());

    await rosters.save({ ...back!, name: "Renamed" });

    expect(server.uploads).toHaveLength(1);
    expect(rosters.received(server.mine())[0]).toEqual({ ...back, name: "Renamed" });
  });

  it("refuse a roster that breaks the rules without sending it", async () => {
    const server = accountServer();
    const rosters = createAccountRosters(server);

    await expect(rosters.save({ ...withGoku("r1"), name: "" })).rejects.toThrow(
      "A roster needs a name.",
    );
    expect(server.uploads).toEqual([]);
  });

  it("give up the images uploaded for a roster the server refuses", async () => {
    const server = accountServer();
    const rosters = createAccountRosters(server);
    server.refuse("The site's server could not be reached. Try again later.");

    await expect(rosters.save(withGoku("r1"))).rejects.toThrow("could not be reached");
    expect(server.discarded).toEqual(["file-1"]);
  });

  it("refuse an image that is neither new nor from the account", async () => {
    const server = accountServer();
    const rosters = createAccountRosters(server);
    const elsewhere = addCustomFighter(roster("r1", "kirby"), "custom-goku", "Goku", {
      ...image,
      image: "https://elsewhere.test/goku.png",
    });

    await expect(rosters.save(elsewhere)).rejects.toThrow("image");
    expect(server.mine()).toEqual([]);
  });

  it("can be removed", async () => {
    const server = accountServer();
    const rosters = createAccountRosters(server);
    await rosters.save(roster("r1", "kirby"));
    await rosters.save(roster("r2", "fox"));

    await rosters.remove("r1");

    expect(rosters.received(server.mine())).toEqual([roster("r2", "fox")]);
  });
});

describe("moving the browser's rosters into an account on signing in", () => {
  it("moves each into the account, the latest saved still first, and out of the browser", async () => {
    const server = accountServer();
    const browser = createRosterStore(browserStorage());
    browser.save(roster("old", "kirby"));
    browser.save(withGoku("new"));

    await createAccountRosters(server).moveIn(browser);

    const rosters = createAccountRosters(server);
    expect(rosters.received(server.mine()).map(({ id }) => id)).toEqual(["new", "old"]);
    expect(browser.list()).toEqual([]);
  });

  it("moves nothing in twice, as when the move is tried again", async () => {
    const server = accountServer();
    const browser = createRosterStore(browserStorage());
    await createAccountRosters(server).save(roster("r1", "kirby", "fox"));
    browser.save(roster("r1", "kirby"));

    await createAccountRosters(server).moveIn(browser);

    expect(server.mine()).toEqual([roster("r1", "kirby", "fox")]);
    expect(browser.list()).toEqual([]);
  });

  it("keeps in the browser a roster the account would not take, and says why", async () => {
    const server = accountServer();
    const browser = createRosterStore(browserStorage());
    browser.save(roster("r1", "kirby"));
    server.refuse("The site's server could not be reached. Try again later.");

    await expect(createAccountRosters(server).moveIn(browser)).rejects.toThrow(
      "could not be reached",
    );
    expect(browser.list()).toEqual([roster("r1", "kirby")]);
  });
});
