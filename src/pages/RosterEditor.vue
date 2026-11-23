<script setup lang="ts">
/**
 * The roster editor: starts a new roster or opens a saved one, and edits its details and
 * fighters beside a live preview of its screen. Nothing is kept until it is saved.
 */
import "@fontsource/rubik/400.css";
import "@fontsource/rubik/700.css";
import "@fontsource/rubik/900.css";

import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";

import type { Game } from "../asset-layer/manifest";
import { type CastMember, pickFromPool } from "../franchises";
import FranchisePool from "../franchises/FranchisePool.vue";
import { officialFighter, officialFighters, officialRosters } from "../official";
import CropEditor from "../portraits/CropEditor.vue";
import { type UploadedImage, uploadImage } from "../portraits/upload";
import { myRoster, newRosterId, rostersKeptIn, rostersKnown, saveRoster } from "../rosters";
import {
  addCustomFighter,
  addFighter,
  canAddFighter,
  copyOfOfficial,
  type CropKind,
  cropFighter,
  type CustomFighter,
  isCustomFighter,
  MAX_FIGHTERS,
  moveFighter,
  nameFighter,
  newRoster,
  removeFighter,
  type Roster,
  rosterProblems,
} from "../rosters/roster";
import type { Crop } from "../portraits/crop";
import { followLink, replaceWith } from "../routes/navigation";
import { HOME_LINK, rosterEditorLink, rosterScreenLink } from "../routes/route";
import {
  type AvailableTemplate,
  availableTemplates,
  showableTemplate,
  templateName,
} from "../templates/catalogue";
import { screenRoster } from "../templates/screen";
import FighterPortrait from "../templates/FighterPortrait.vue";
import TemplateScreen from "../templates/TemplateScreen.vue";
import RosterMissing from "./RosterMissing.vue";

const props = defineProps<{
  /** The saved roster to edit. Without one, the editor starts a new roster. */
  id?: string;
  /** The official roster a new roster starts as a copy of. Without one, it starts empty. */
  copyOf?: Game;
}>();

const savedNow = () => (props.id === undefined ? undefined : myRoster(props.id));
const startNew = () =>
  props.copyOf
    ? copyOfOfficial(newRosterId(), officialRosters[props.copyOf])
    : newRoster(newRosterId());

/** The roster as last saved, if it has been. */
const saved = shallowRef(savedNow());
/** Whether the roster to edit may yet turn up, as the account's rosters are still loading. */
const waiting = computed(() => props.id !== undefined && !saved.value && !rostersKnown.value);
const missing = computed(() => props.id !== undefined && !saved.value && rostersKnown.value);
/** The roster as it was opened or last saved, which the edits are measured against. */
const opened = shallowRef(saved.value ?? startNew());
const draft = shallowRef(opened.value);
/** Why the last save did not happen, when the browser would not store the roster. */
const failure = ref("");
const edit = (change: (roster: Roster) => Roster) => {
  draft.value = change(draft.value);
  failure.value = "";
};
const set = (fields: Partial<Roster>) => edit((roster) => ({ ...roster, ...fields }));

const problems = computed(() => rosterProblems(draft.value));
const edited = computed(() => JSON.stringify(draft.value) !== JSON.stringify(opened.value));
/** A new roster is worth saving before it is edited: a copy of an official one is whole already. */
const savable = computed(() => problems.value.length === 0 && (edited.value || !saved.value));
const full = computed(() => draft.value.fighters.length >= MAX_FIGHTERS);
const pickedIds = computed(() => new Set(draft.value.fighters.map((fighter) => fighter.id)));

/** Whether a save is under way, which saving to an account takes a moment for. */
const saving = ref(false);
async function save() {
  const sent = draft.value;
  saving.value = true;
  try {
    await saveRoster(sent);
  } catch (error) {
    failure.value = error instanceof Error ? error.message : "The roster could not be saved.";
    return;
  } finally {
    saving.value = false;
  }
  // The roster as kept, which in an account shows its images from the server.
  const kept = myRoster(sent.id) ?? sent;
  saved.value = opened.value = kept;
  // Edits made while it was saving stay, still to be saved.
  if (draft.value === sent) draft.value = kept;
  // A new roster now has a link of its own, so a reload opens it rather than starting another.
  if (props.id === undefined) replaceWith(rosterEditorLink(sent.id));
}

// Leaving throws edits away, so the visitor is asked first: by the browser before a reload or a
// closed tab, and here before one of the editor's own links is followed.
const askBeforeUnload = (event: BeforeUnloadEvent) => {
  if (edited.value) event.preventDefault();
};
onMounted(() => window.addEventListener("beforeunload", askBeforeUnload));
onBeforeUnmount(() => window.removeEventListener("beforeunload", askBeforeUnload));
function leave(event: MouseEvent) {
  if (edited.value && !confirm("Leave without saving? The changes will be lost."))
    event.preventDefault();
  else followLink(event);
}

const defaultTemplate = computed(() => showableTemplate(draft.value.defaultTemplate));
/** The template the preview shows. It follows the default template until another is picked. */
const previewed = ref<AvailableTemplate>();
const previewTemplate = computed(() => previewed.value ?? defaultTemplate.value);
function setDefaultTemplate(template: AvailableTemplate) {
  set({ defaultTemplate: template });
  previewed.value = undefined;
}

/** The roster's fighters as shown: displayed names, and portraits from the previewed template. */
const shown = computed(() => screenRoster(draft.value, previewTemplate.value).fighters);
/** A fighter as the roster holds it. */
const inDraft = (id: string) => draft.value.fighters.find((fighter) => fighter.id === id);
/** The name a fighter's name field falls back to: an official fighter's own, or the one given. */
function ownName(id: string) {
  const fighter = inDraft(id);
  return fighter && isCustomFighter(fighter) ? fighter.name : officialFighter(id).name;
}

/**
 * The name being typed. The field shows it as typed until it is left; meanwhile the roster takes
 * each keystroke, and a cleared field gives the fighter its own name back.
 */
const typing = ref<{ readonly id: string; readonly text: string }>();
function typeName(id: string, text: string) {
  typing.value = { id, text };
  edit((roster) => nameFighter(roster, id, text));
}

/** The fighter being dragged to a new place in the order. */
const dragged = ref<string>();
function startDrag(id: string, event: DragEvent) {
  dragged.value = id;
  // Some browsers start a drag only when it carries something.
  event.dataTransfer?.setData("text/plain", id);
}
function dragOver(index: number) {
  const id = dragged.value;
  if (id !== undefined) edit((roster) => moveFighter(roster, id, index));
}

/** Every official fighter, to pick from, with the ones whose names match the search. */
const picker = screenRoster({ fighters: officialFighters, randomSlot: false }, "ultimate").fighters;
const search = ref("");
const picks = computed(() => {
  const wanted = search.value.trim().toLowerCase();
  return picker
    .filter((fighter) => fighter.name.toLowerCase().includes(wanted))
    .map((fighter) => ({
      ...fighter,
      picked: pickedIds.value.has(fighter.id),
      addable: canAddFighter(draft.value, fighter.id),
    }));
});
const togglePick = (id: string, picked: boolean) =>
  edit((roster) => (picked ? removeFighter(roster, id) : addFighter(roster, id)));

/** A fighter being added by name and image: the name typed, and the image once it is taken in. */
const newName = ref("");
const upload = shallowRef<UploadedImage>();
/** Why the chosen file was not taken, or that it is being read. */
const uploadProblem = ref("");
const reading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
async function chooseImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  upload.value = undefined;
  uploadProblem.value = "";
  if (!file) return;
  reading.value = true;
  try {
    upload.value = await uploadImage(file);
  } catch (error) {
    uploadProblem.value = error instanceof Error ? error.message : "That image could not be used.";
    clearFile();
  } finally {
    reading.value = false;
  }
}
const canAddOwn = computed(() => !!newName.value.trim() && !!upload.value && !full.value);
function addOwn() {
  if (!canAddOwn.value) return;
  const id = `custom-${newRosterId()}`;
  edit((roster) => addCustomFighter(roster, id, newName.value, upload.value!));
  resetAddOwn();
  // Its image starts centre-cropped; the crops open straight away for adjusting.
  cropping.value = id;
}
/** Takes a character from the pool into the roster, and opens its crops for adjusting. */
function pickPooled(member: CastMember, copy: UploadedImage) {
  edit((roster) => pickFromPool(roster, member, copy));
  if (pickedIds.value.has(member.id)) cropping.value = member.id;
}
/** Takes the user to the form for adding a fighter by name and image, with a name to start. */
const newNameInput = ref<HTMLInputElement | null>(null);
function addManually(name: string) {
  if (name) newName.value = name;
  newNameInput.value?.scrollIntoView({ behavior: "smooth", block: "center" });
  newNameInput.value?.focus({ preventScroll: true });
}
/** Empties the file field, so the same file can be chosen again. */
function clearFile() {
  if (fileInput.value) fileInput.value.value = "";
}
/** Empties the form for adding a fighter by name and image. */
function resetAddOwn() {
  newName.value = "";
  upload.value = undefined;
  uploadProblem.value = "";
  clearFile();
}

/** The fighter added by image whose crops are open for adjusting. */
const cropping = ref<string>();
const croppingFighter = computed((): CustomFighter | undefined => {
  const fighter = cropping.value === undefined ? undefined : inDraft(cropping.value);
  return fighter && isCustomFighter(fighter) ? fighter : undefined;
});
const recrop = (id: string, kind: CropKind, crop: Crop) =>
  edit((roster) => cropFighter(roster, id, kind, crop));

// The link may change to another roster while the editor is up, as Back and Forward do. A new
// roster's first save changes it to that roster's own link, which is no other roster.
watch(
  () => [props.id, props.copyOf],
  () => {
    if (props.id === draft.value.id) return;
    saved.value = savedNow();
    draft.value = opened.value = saved.value ?? startNew();
    previewed.value = undefined;
    failure.value = "";
    search.value = "";
    cropping.value = undefined;
    resetAddOwn();
  },
);

// A roster in the account can be opened once the account's rosters arrive.
watch(waiting, (still) => {
  if (still) return;
  saved.value = savedNow();
  if (saved.value) draft.value = opened.value = saved.value;
});
</script>

<template>
  <RosterMissing v-if="missing" />
  <main v-else-if="waiting" class="editor" aria-busy="true">
    <p class="hint" role="status">Opening the roster&hellip;</p>
  </main>

  <main v-else class="editor">
    <header>
      <a class="plain" :href="HOME_LINK" @click="leave">&larr; Home</a>
      <h1>{{ saved ? "Edit roster" : "New roster" }}</h1>
    </header>

    <div class="columns">
      <div class="controls">
        <section class="details" aria-labelledby="details">
          <h2 id="details">Details</h2>
          <label>
            Name
            <input
              type="text"
              maxlength="60"
              required
              :value="draft.name"
              @input="set({ name: ($event.target as HTMLInputElement).value })"
            />
          </label>
          <label>
            <span>Description <span class="hint">(optional)</span></span>
            <textarea
              rows="2"
              maxlength="280"
              :value="draft.description"
              @input="set({ description: ($event.target as HTMLTextAreaElement).value })"
            />
          </label>
          <label>
            Default template
            <select
              :value="defaultTemplate"
              @change="
                setDefaultTemplate(($event.target as HTMLSelectElement).value as AvailableTemplate)
              "
            >
              <option v-for="choice in availableTemplates" :key="choice" :value="choice">
                {{ templateName(choice) }}
              </option>
            </select>
          </label>
          <label class="check">
            <input
              type="checkbox"
              :checked="draft.randomSlot"
              @change="set({ randomSlot: ($event.target as HTMLInputElement).checked })"
            />
            Random slot
          </label>
        </section>

        <section aria-labelledby="fighters">
          <h2 id="fighters">
            Fighters
            <span class="count">{{ draft.fighters.length }} / {{ MAX_FIGHTERS }}</span>
          </h2>
          <p v-if="shown.length === 0" class="hint">
            No fighters yet. Pull some from a franchise, add your own, or pick from the official
            fighters below.
          </p>
          <ol v-else class="rows">
            <li
              v-for="(fighter, index) in shown"
              :key="fighter.id"
              :class="{ dragged: dragged === fighter.id }"
              @dragover.prevent="dragOver(index)"
              @drop.prevent
            >
              <span
                class="grip"
                draggable="true"
                aria-hidden="true"
                title="Drag to reorder"
                @dragstart="startDrag(fighter.id, $event)"
                @dragend="dragged = undefined"
                >&#x2807;</span
              >
              <span class="place">{{ index + 1 }}</span>
              <FighterPortrait class="thumb" :fighter="fighter" place="slot" />
              <input
                type="text"
                maxlength="40"
                :aria-label="`Displayed name for ${ownName(fighter.id)}`"
                :placeholder="ownName(fighter.id)"
                :value="typing?.id === fighter.id ? typing.text : fighter.name"
                @input="typeName(fighter.id, ($event.target as HTMLInputElement).value)"
                @blur="typing = undefined"
              />
              <button
                type="button"
                :aria-label="`Move ${fighter.name} earlier`"
                :disabled="index === 0"
                @click="edit((roster) => moveFighter(roster, fighter.id, index - 1))"
              >
                &uarr;
              </button>
              <button
                type="button"
                :aria-label="`Move ${fighter.name} later`"
                :disabled="index === shown.length - 1"
                @click="edit((roster) => moveFighter(roster, fighter.id, index + 1))"
              >
                &darr;
              </button>
              <button
                v-if="fighter.crops"
                type="button"
                class="crop-button"
                :aria-label="`Adjust the crops of ${fighter.name}`"
                :aria-expanded="cropping === fighter.id"
                @click="cropping = cropping === fighter.id ? undefined : fighter.id"
              >
                Crop
              </button>
              <span v-else aria-hidden="true" />
              <button
                type="button"
                :aria-label="`Remove ${fighter.name}`"
                @click="edit((roster) => removeFighter(roster, fighter.id))"
              >
                &times;
              </button>
            </li>
          </ol>

          <div v-if="croppingFighter" class="cropping" aria-live="polite">
            <h3>Crops for {{ croppingFighter.name }}</h3>
            <p class="hint">
              Drag each box, or focus it and use the arrow keys, to choose what shows in the grid
              and in the player panel.
            </p>
            <div class="crop-editors">
              <CropEditor
                label="Slot"
                :src="croppingFighter.portrait.image"
                :image="croppingFighter.portrait"
                :crop="croppingFighter.portrait.slot"
                @update:crop="recrop(croppingFighter.id, 'slot', $event)"
              />
              <CropEditor
                label="Player panel"
                :src="croppingFighter.portrait.image"
                :image="croppingFighter.portrait"
                :crop="croppingFighter.portrait.panel"
                @update:crop="recrop(croppingFighter.id, 'panel', $event)"
              />
            </div>
            <button type="button" @click="cropping = undefined">Done</button>
          </div>
        </section>

        <FranchisePool
          :picked="pickedIds"
          :full="full"
          @pick="pickPooled"
          @remove="(id) => edit((roster) => removeFighter(roster, id))"
          @add-manually="addManually"
        />

        <section aria-labelledby="own-fighter">
          <h2 id="own-fighter">Add your own fighter</h2>
          <form class="own" @submit.prevent="addOwn">
            <label>
              Name
              <input ref="newNameInput" v-model="newName" type="text" maxlength="40" />
            </label>
            <label>
              <span>
                Image
                <span class="hint">(PNG, JPEG, WebP or GIF, up to 10 MB)</span>
              </span>
              <input
                ref="fileInput"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                @change="chooseImage"
              />
            </label>
            <p v-if="uploadProblem" class="problems" role="alert">{{ uploadProblem }}</p>
            <p v-else-if="reading" class="hint" role="status">Reading the image&hellip;</p>
            <p v-else-if="full" class="hint">
              The roster is full. Remove a fighter to make room for another.
            </p>
            <button type="submit" :disabled="!canAddOwn">Add fighter</button>
          </form>
        </section>

        <section aria-labelledby="official-fighters">
          <h2 id="official-fighters">Official fighters</h2>
          <label>
            Search
            <input v-model="search" type="search" />
          </label>
          <p v-if="full" class="hint">
            The roster is full. Remove a fighter to make room for another.
          </p>
          <ul class="picker">
            <li v-for="fighter in picks" :key="fighter.id">
              <button
                type="button"
                :aria-pressed="fighter.picked"
                :disabled="!fighter.picked && !fighter.addable"
                @click="togglePick(fighter.id, fighter.picked)"
              >
                <img :src="fighter.portrait" alt="" loading="lazy" />
                <span>{{ fighter.name }}</span>
              </button>
            </li>
          </ul>
        </section>
      </div>

      <aside class="side" aria-label="Preview and saving">
        <nav class="tabs" aria-label="Preview template">
          <button
            v-for="choice in availableTemplates"
            :key="choice"
            type="button"
            :aria-pressed="choice === previewTemplate"
            @click="previewed = choice"
          >
            {{ templateName(choice) }}
          </button>
        </nav>
        <TemplateScreen
          v-if="draft.fighters.length > 0"
          :key="previewTemplate"
          :roster="draft"
          :template="previewTemplate"
          preview
        />
        <p v-else class="empty">The screen shows here once the roster has a fighter.</p>

        <div class="saving">
          <button type="button" class="save" :disabled="!savable || saving" @click="save">
            {{ saving ? "Saving…" : "Save" }}
          </button>
          <a v-if="saved" class="plain" :href="rosterScreenLink(saved.id)" @click="leave">
            Open the saved screen
          </a>
          <ul v-if="problems.length > 0" class="problems">
            <li v-for="problem in problems" :key="problem">{{ problem }}</li>
          </ul>
          <p v-else-if="failure" class="problems" role="alert">{{ failure }}</p>
          <p v-else class="hint" role="status">
            {{
              edited
                ? "There are changes not yet saved."
                : saved
                  ? rostersKeptIn === "account"
                    ? "Saved to your account."
                    : "Saved in this browser."
                  : "Not saved yet."
            }}
          </p>
        </div>
      </aside>
    </div>
  </main>
</template>

<style scoped>
.editor {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  /* The top leaves room for the mute button. */
  padding: 20px 20px 48px;
  color: #fff;
  font:
    400 16px/1.5 Rubik,
    system-ui,
    sans-serif;
}

h1,
h2,
p {
  margin: 0;
}

header {
  /* Clear of the mute button. */
  padding-right: 56px;
}

h1 {
  font-size: clamp(28px, 6vw, 44px);
  font-weight: 900;
  line-height: 1.1;
}

h2 {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: 700;
}

.count,
.hint {
  color: #c9c9c9;
  font-size: 14px;
  font-weight: 400;
}

.plain {
  color: #ffcf1a;
}

.columns {
  display: grid;
  gap: 24px;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-width: 0;
}

.side {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  /* On a narrow window the preview comes first. */
  order: -1;
}

@media (min-width: 960px) {
  .columns {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    align-items: start;
  }

  .side {
    position: sticky;
    top: 20px;
    order: 0;
  }
}

label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 700;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.details h2 {
  margin-bottom: 0;
}

label.check {
  flex-direction: row;
  align-items: center;
  gap: 10px;
  min-height: 44px;
}

.check input {
  width: 22px;
  height: 22px;
  accent-color: #ffcf1a;
}

input[type="text"],
input[type="search"],
textarea,
select {
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

textarea {
  resize: vertical;
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

:is(a, button, input, textarea, select):focus-visible {
  outline: 3px solid #ffcf1a;
  outline-offset: 2px;
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 480px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  list-style: none;
}

.rows li {
  display: grid;
  grid-template-columns: auto 2ch 44px minmax(0, 1fr) auto auto auto auto;
  align-items: center;
  gap: 6px;
}

.rows li.dragged {
  opacity: 0.4;
}

.grip {
  display: grid;
  place-items: center;
  width: 28px;
  height: 44px;
  color: #a8a8a8;
  font-size: 22px;
  cursor: grab;
  user-select: none;
}

/* A narrow window is most often a touch screen, where dragging does nothing: the arrows reorder. */
@media (max-width: 520px) {
  .rows li {
    grid-template-columns: 2ch 44px minmax(0, 1fr) auto auto auto auto;
  }

  .grip {
    display: none;
  }
}

.place {
  color: #a8a8a8;
  font-size: 14px;
  text-align: right;
}

.rows .thumb {
  display: block;
  width: 44px;
  height: 44px;
  border-radius: 6px;
  object-fit: cover;
  background: #222;
}

.crop-button {
  font-size: 14px;
}

.cropping {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-top: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #1c1c1c;
}

.cropping h3 {
  margin: 0;
  font-size: 18px;
}

.crop-editors {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px;
  align-self: stretch;
}

.own {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.own label {
  align-self: stretch;
}

input[type="file"] {
  min-height: 44px;
  padding: 8px 0;
  color: #c9c9c9;
  font: inherit;
  font-weight: 400;
}

.picker {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: 6px;
  margin: 12px 0 0;
  padding: 0;
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

.picker img {
  width: 100%;
  aspect-ratio: 3 / 2;
  border-radius: 4px;
  object-fit: cover;
  background: #222;
}

button[aria-pressed="true"] {
  border-color: #ffcf1a;
  background: #3b3000;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.empty {
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  padding: 20px;
  border: 2px dashed #3a3a3a;
  border-radius: 12px;
  color: #c9c9c9;
  text-align: center;
}

.saving {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
}

.save {
  min-width: 120px;
  border-color: #ffcf1a;
  background: #ffcf1a;
  color: #000;
}

.save:hover:not(:disabled) {
  border-color: #fff;
  background: #ffe066;
}

.problems {
  flex-basis: 100%;
  margin: 0;
  padding: 0;
  color: #ff8a80;
  list-style: none;
}

.saving .hint {
  flex-basis: 100%;
}
</style>
