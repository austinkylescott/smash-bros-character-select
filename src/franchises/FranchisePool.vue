<script setup lang="ts">
/**
 * Pulling fighters from a franchise: search for one, pick it, and its cast lands in the pool, 100
 * at a time. Picking a character fetches the site's own copy of its image and hands it on to be
 * added to the roster. When a pull comes back empty or fails, it points to adding a fighter by hand.
 */
import { ref, shallowRef } from "vue";

import { type UploadedImage, uploadImage } from "../portraits/upload";
import {
  type CastMember,
  type Franchise,
  franchiseSources,
  loadMore,
  type Pool,
  POOL_STEP,
  pullCast,
} from ".";

defineProps<{
  /** The ids of the fighters already in the roster. */
  picked: ReadonlySet<string>;
  /** Whether the roster has no room for another fighter. */
  full: boolean;
}>();

const emit = defineEmits<{
  /** A character picked from the pool, with the site's own copy of its image. */
  pick: [member: CastMember, copy: UploadedImage];
  /** A character taken back out of the roster. */
  remove: [id: string];
  /** The user is to add a fighter by name and image, starting with this name. */
  addManually: [name: string];
}>();

const message = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const query = ref("");
const franchises = shallowRef<readonly Franchise[]>();
const searching = ref(false);
const searchProblem = ref("");
/** Counts searches and pulls, so only the latest one's answer is shown. */
let asked = 0;

async function search() {
  const wanted = query.value.trim();
  if (!wanted) return;
  const ask = ++asked;
  searching.value = true;
  searchProblem.value = "";
  try {
    const found = await franchiseSources.searchFranchises(wanted);
    if (ask === asked) franchises.value = found;
  } catch (error) {
    if (ask === asked) {
      franchises.value = undefined;
      searchProblem.value = message(error, "The search did not work.");
    }
  } finally {
    if (ask === asked) searching.value = false;
  }
}

const pool = shallowRef<Pool>();
/** The franchise being pulled, before its cast lands. */
const pulling = shallowRef<Franchise>();
const pullProblem = ref("");
const loadingMore = ref(false);

async function pull(franchise: Franchise) {
  const ask = ++asked;
  pulling.value = franchise;
  pool.value = undefined;
  pullProblem.value = "";
  importProblem.value = "";
  try {
    const pulled = await pullCast(franchiseSources, franchise);
    if (ask === asked) pool.value = pulled;
  } catch (error) {
    if (ask === asked) pullProblem.value = message(error, "The cast could not be pulled.");
  } finally {
    if (ask === asked) pulling.value = undefined;
  }
}

async function more() {
  const from = pool.value;
  if (!from || loadingMore.value) return;
  loadingMore.value = true;
  pullProblem.value = "";
  try {
    const grown = await loadMore(franchiseSources, from);
    if (pool.value === from) pool.value = grown;
  } catch (error) {
    if (pool.value === from) pullProblem.value = message(error, "No more of the cast came back.");
  } finally {
    loadingMore.value = false;
  }
}

/** The character whose image is being fetched. */
const importing = ref<string>();
const importProblem = ref("");

async function pick(member: CastMember) {
  if (!member.image) {
    // There is no image to copy, so the user brings one.
    emit("addManually", member.name);
    return;
  }
  importing.value = member.id;
  importProblem.value = "";
  try {
    const { bytes, type } = await franchiseSources.image(member.image);
    emit("pick", member, await uploadImage(new Blob([bytes], { type })));
  } catch (error) {
    importProblem.value = `${member.name}'s image could not be brought in. ${message(error, "")}`;
  } finally {
    importing.value = undefined;
  }
}
</script>

<template>
  <section class="pool" aria-labelledby="from-franchise">
    <h2 id="from-franchise">From a franchise</h2>
    <form class="search" role="search" @submit.prevent="search">
      <label>
        <span>Anime or manga <span class="hint">(from AniList)</span></span>
        <input v-model="query" type="search" maxlength="100" />
      </label>
      <button type="submit" :disabled="!query.trim() || searching">Search</button>
    </form>

    <p v-if="searching" class="hint" role="status">Searching&hellip;</p>
    <div v-else-if="searchProblem" class="problems" role="alert">
      <p>{{ searchProblem }}</p>
      <button type="button" class="link" @click="emit('addManually', '')">
        Add a fighter yourself instead
      </button>
    </div>
    <div v-else-if="franchises && franchises.length === 0" class="hint" role="status">
      <p>Nothing by that name. Try another spelling, or</p>
      <button type="button" class="link" @click="emit('addManually', '')">
        add a fighter yourself
      </button>
    </div>
    <ul v-else-if="franchises" class="franchises">
      <li v-for="franchise in franchises" :key="franchise.id">
        <button
          type="button"
          :aria-pressed="(pulling ?? pool?.franchise)?.id === franchise.id"
          @click="pull(franchise)"
        >
          <img v-if="franchise.image" :src="franchise.image" alt="" loading="lazy" />
          <span v-else class="no-image" aria-hidden="true" />
          <span class="title">{{ franchise.name }}</span>
          <span class="hint">{{ franchise.detail }}</span>
        </button>
      </li>
    </ul>

    <p v-if="pulling" class="hint" role="status">Pulling the cast of {{ pulling.name }}&hellip;</p>
    <div v-if="pullProblem" class="problems" role="alert">
      <p>{{ pullProblem }}</p>
      <button type="button" class="link" @click="emit('addManually', '')">
        Add a fighter yourself instead
      </button>
    </div>

    <template v-if="pool">
      <h3>
        The pool: {{ pool.franchise.name }}
        <span class="hint">{{ pool.members.length }}{{ pool.more ? "+" : "" }} fighters</span>
      </h3>
      <div v-if="pool.members.length === 0" class="hint" role="status">
        <p>No cast came back for {{ pool.franchise.name }}.</p>
        <button type="button" class="link" @click="emit('addManually', '')">
          Add its fighters yourself
        </button>
      </div>
      <template v-else>
        <p v-if="full" class="hint">
          The roster is full. Remove a fighter to make room for another.
        </p>
        <div v-if="importProblem" class="problems" role="alert">
          <p>{{ importProblem }}</p>
          <button type="button" class="link" @click="emit('addManually', '')">
            Add the fighter yourself with another image
          </button>
        </div>
        <ul class="picker">
          <li v-for="member in pool.members" :key="member.id">
            <button
              type="button"
              :aria-pressed="picked.has(member.id)"
              :aria-busy="importing === member.id"
              :disabled="importing !== undefined || (!picked.has(member.id) && full)"
              :title="member.image ? undefined : 'No image: add one yourself'"
              @click="picked.has(member.id) ? emit('remove', member.id) : pick(member)"
            >
              <img v-if="member.image" :src="member.image" alt="" loading="lazy" />
              <span v-else class="no-image" aria-hidden="true">?</span>
              <span>{{ importing === member.id ? "Bringing in…" : member.name }}</span>
            </button>
          </li>
        </ul>
        <button v-if="pool.more" type="button" class="more" :disabled="loadingMore" @click="more">
          {{ loadingMore ? "Loading…" : `Load ${POOL_STEP} more` }}
        </button>
      </template>
    </template>
  </section>
</template>

<style scoped>
.pool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h2,
h3,
p {
  margin: 0;
}

h2 {
  font-size: 20px;
  font-weight: 700;
}

h3 {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
  font-size: 18px;
}

.hint {
  color: #c9c9c9;
  font-size: 14px;
  font-weight: 400;
}

.problems {
  color: #ff8a80;
}

.search {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

label {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  font-weight: 700;
}

input[type="search"] {
  width: 100%;
  min-height: 44px;
  padding: 8px 12px;
  border: 2px solid #3a3a3a;
  border-radius: 8px;
  background: #161616;
  color: #fff;
  font: inherit;
  font-weight: 400;
}

button {
  min-width: 44px;
  min-height: 44px;
  padding: 0 12px;
  border: 2px solid #3a3a3a;
  border-radius: 8px;
  background: #161616;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

button:hover:not(:disabled) {
  border-color: #fff;
  background: #222;
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

:is(button, input):focus-visible {
  outline: 3px solid #ffcf1a;
  outline-offset: 2px;
}

button[aria-pressed="true"] {
  border-color: #ffcf1a;
  background: #3b3000;
}

button.link {
  min-height: 44px;
  padding: 0;
  border: 0;
  background: none;
  color: #ffcf1a;
  font-weight: 400;
  text-decoration: underline;
}

button.link:hover:not(:disabled) {
  background: none;
}

.franchises {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  list-style: none;
}

.franchises button {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  grid-template-rows: auto auto;
  column-gap: 10px;
  align-items: center;
  width: 100%;
  padding: 6px 10px;
  text-align: left;
}

.franchises img,
.franchises .no-image {
  grid-row: span 2;
  width: 36px;
  height: 52px;
  border-radius: 4px;
  object-fit: cover;
  background: #222;
}

.franchises .title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 6px;
  max-height: 560px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  list-style: none;
}

.picker button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  padding: 6px;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.2;
}

.picker img,
.picker .no-image {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 2 / 3;
  border-radius: 4px;
  object-fit: cover;
  background: #222;
  color: #a8a8a8;
  font-size: 28px;
}

.more {
  align-self: flex-start;
}
</style>
