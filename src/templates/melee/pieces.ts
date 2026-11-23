/**
 * Melee's hand and tokens in 3D, drawn over its CSS screen (ADR 0007): a lit white glove pointing
 * up and to the left, its owner's tag beneath it, and bevelled coins in each player's colour,
 * stamped with their tag. Built from primitive geometry, not taken from the game.
 *
 * Every frame each piece is put exactly where the DOM puts its element, read from the screen's
 * pieces as that frame is drawn. The only motion of their own is the glove's press on picking up
 * or dropping a token; a still scene, posed at 0, never makes it.
 */
import {
  AmbientLight,
  BackSide,
  CanvasTexture,
  CapsuleGeometry,
  CircleGeometry,
  DirectionalLight,
  Group,
  LatheGeometry,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  type Texture,
  TorusGeometry,
  Vector2,
} from "three";

import type { LayerScene } from "../layers/scene";
import type { PieceLook, ScreenPieces } from "../layers/pieces";
import { toScene } from "../layers/view";
import type { Size } from "../stage";
import { PANEL_COUNT } from "./panels";
import { pressPose } from "./press";

/** What a label is painted for: a token's face, or the tag hanging under the glove. */
export type LabelKind = "token" | "tag";

/**
 * Paints a label into a texture, or gives nothing where there is no canvas to paint on. The scene
 * still draws without one, only unlabelled.
 */
export type LabelPainter = (kind: LabelKind, look: PieceLook) => Texture | undefined;

export interface MeleePiecesOptions {
  readonly paint?: LabelPainter;
}

const FONT = '"Rubik", "Arial Black", "Helvetica Neue", Arial, sans-serif';
const LABEL_FONT = (px: number) => `italic 900 ${px}px ${FONT}`;

/** A token's face: a lighter disc inside a ring of the colour, its tag stamped across it. */
function paintToken(context: CanvasRenderingContext2D, size: number, { colour, tag }: PieceLook) {
  const middle = size / 2;
  context.clearRect(0, 0, size, size);
  context.fillStyle = colour;
  context.beginPath();
  context.arc(middle, middle, middle, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgb(255 255 255 / 30%)";
  context.beginPath();
  context.arc(middle, middle, middle * 0.78, 0, Math.PI * 2);
  context.fill();
  context.font = LABEL_FONT(size * 0.43);
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineJoin = "round";
  context.lineWidth = size * 0.05;
  context.strokeStyle = "rgb(0 0 0 / 45%)";
  context.strokeText(tag, middle, middle + size * 0.04);
  context.fillStyle = "#fff";
  context.fillText(tag, middle, middle + size * 0.02);
}

/** The owner's tag under the glove: italic, in their colour, outlined in white. */
function paintTag(context: CanvasRenderingContext2D, width: number, { colour, tag }: PieceLook) {
  const height = width / TAG_ASPECT;
  context.clearRect(0, 0, width, height);
  context.font = LABEL_FONT(height * 0.8);
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.lineJoin = "round";
  context.lineWidth = height * 0.14;
  context.strokeStyle = "#fff";
  context.shadowColor = "rgb(0 0 0 / 50%)";
  context.shadowOffsetY = height * 0.04;
  context.shadowBlur = height * 0.04;
  context.strokeText(tag, height * 0.1, height / 2);
  context.shadowColor = "transparent";
  context.fillStyle = colour;
  context.fillText(tag, height * 0.1, height / 2);
}

/** The tag's plane, wide enough for "P4" or "CP" at Melee's size. */
const TAG_ASPECT = 2;
const LABEL_PIXELS = 256;

/**
 * Paints labels onto canvases, in Rubik once it has loaded. Labels painted before then are
 * painted again when it arrives.
 */
function canvasPainter(): LabelPainter {
  const painted: { texture: CanvasTexture; repaint: () => void }[] = [];
  void document.fonts?.load(LABEL_FONT(64)).then(() => {
    for (const { texture, repaint } of painted) {
      repaint();
      texture.needsUpdate = true;
    }
  });

  return (kind, look) => {
    const canvas = document.createElement("canvas");
    canvas.width = LABEL_PIXELS;
    canvas.height = kind === "token" ? LABEL_PIXELS : LABEL_PIXELS / TAG_ASPECT;
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    const repaint = () =>
      kind === "token"
        ? paintToken(context, LABEL_PIXELS, look)
        : paintTag(context, LABEL_PIXELS, look);
    repaint();
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    painted.push({ texture, repaint });
    return texture;
  };
}

/** A soft round shadow, darkest at its middle. */
const SHADOW_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SHADOW_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uOpacity;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    gl_FragColor = vec4(0.0, 0.0, 0.0, uOpacity * smoothstep(1.0, 0.35, d));
  }
`;

/** The coin's outline, half a unit across: flat faces, a bevelled rim. Revolved about its axis. */
const COIN_PROFILE = [
  [0, 0.09],
  [0.4, 0.09],
  [0.47, 0.065],
  [0.5, 0.025],
  [0.5, -0.025],
  [0.47, -0.065],
  [0.4, -0.09],
  [0, -0.09],
].map(([x, y]) => new Vector2(x, y));

/** Tokens lean back a touch, so their rim catches the light below their face. */
const TOKEN_LEAN = -0.32;

/** The glove's grey outline, a hull just larger than each part, drawn from the inside. */
const OUTLINE = 1.12;

/** Depths that keep pieces in Melee's order: resting tokens, the held token, then the glove. */
const TOKEN_Z = 0;
/** Clear of a leaning token's depth, so tokens sharing a slot overlap rather than intersect. */
const TOKEN_STEP = 12;
const HELD_Z = 80;
const GLOVE_Z = 200;

/** The glove leans its finger up and to the left, as Melee's does. */
const GLOVE_LEAN = 0.62;
/** How far a press pushes the glove along its finger, in stage pixels. */
const PRESS_DEPTH = 6;

export function meleePieces(
  _stage: Size,
  pieces: () => ScreenPieces,
  options: MeleePiecesOptions = {},
): LayerScene {
  const paint = options.paint ?? canvasPainter();
  const scene = new Scene();
  const disposables: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(thing: T): T => {
    disposables.push(thing);
    return thing;
  };

  scene.add(new AmbientLight(0xffffff, 1.1));
  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(-0.5, 0.8, 1);
  scene.add(key);
  const fill = new DirectionalLight(0xb8c8ff, 0.6);
  fill.position.set(0.8, -0.4, 0.6);
  scene.add(fill);

  /** One texture per label, kept for the scene's life: there are only a few players. */
  const labels = new Map<string, Texture | undefined>();
  const label = (kind: LabelKind, look: PieceLook) => {
    const id = `${kind}|${look.colour}|${look.tag}`;
    if (!labels.has(id)) {
      const texture = paint(kind, look);
      if (texture) own(texture);
      labels.set(id, texture);
    }
    return labels.get(id);
  };

  // Tokens: one unit across, scaled to each token's size.
  const coinGeometry = own(new LatheGeometry(COIN_PROFILE, 40));
  coinGeometry.rotateX(Math.PI / 2);
  const faceGeometry = own(new CircleGeometry(0.43, 40));
  const shadowGeometry = own(new PlaneGeometry(1.3, 1.3));
  const shadowMaterial = own(
    new ShaderMaterial({
      uniforms: { uOpacity: { value: 0.55 } },
      vertexShader: SHADOW_VERTEX,
      fragmentShader: SHADOW_FRAGMENT,
      transparent: true,
      depthWrite: false,
    }),
  );

  interface TokenMesh {
    readonly group: Group;
    readonly coin: Mesh<LatheGeometry, MeshStandardMaterial>;
    readonly face: Mesh<CircleGeometry, MeshStandardMaterial>;
    look: string;
  }
  function makeToken(name: string): TokenMesh {
    const group = new Group();
    group.name = name;
    group.visible = false;
    const shadow = new Mesh(shadowGeometry, shadowMaterial);
    shadow.position.set(0, -0.08, -0.2);
    group.add(shadow);
    const tilt = new Group();
    tilt.rotation.x = TOKEN_LEAN;
    group.add(tilt);
    const coin = new Mesh(
      coinGeometry,
      own(new MeshStandardMaterial({ roughness: 0.35, metalness: 0.15 })),
    );
    coin.name = "coin";
    tilt.add(coin);
    const face = new Mesh(
      faceGeometry,
      own(new MeshStandardMaterial({ roughness: 0.4, metalness: 0.05, transparent: true })),
    );
    face.position.z = 0.091;
    tilt.add(face);
    scene.add(group);
    return { group, coin, face, look: "" };
  }
  function dress(token: TokenMesh, look: PieceLook) {
    const id = `${look.colour}|${look.tag}`;
    if (token.look === id) return;
    token.look = id;
    token.coin.material.color.set(look.colour);
    const texture = label("token", look);
    token.face.material.map = texture ?? null;
    token.face.material.color.set(texture ? "#ffffff" : look.colour);
    token.face.material.needsUpdate = true;
  }

  const resting = Array.from({ length: PANEL_COUNT }, (_, panel) => makeToken(`token-${panel}`));

  // The hand: its hot spot, the fingertip, at the group's origin.
  const hand = new Group();
  hand.name = "hand";
  hand.visible = false;
  scene.add(hand);

  const held = makeToken("held-token");
  scene.remove(held.group);
  held.group.scale.setScalar(60);
  held.group.position.z = HELD_Z;
  hand.add(held.group);

  const glove = buildGlove(own);
  glove.position.z = GLOVE_Z;
  hand.add(glove);
  const gloveLean = glove.children[0]!;

  const tagMaterial = own(new MeshBasicMaterial({ transparent: true, depthWrite: false }));
  const tag = new Mesh(own(new PlaneGeometry(1, 1 / TAG_ASPECT)), tagMaterial);
  tag.name = "hand-tag";
  tag.scale.setScalar(96);
  // As the DOM hangs it: 4px right of the hot spot and 92px below, the text 44px tall.
  tag.position.set(4 + 48, -(92 + 24), GLOVE_Z - 20);
  hand.add(tag);
  let tagLook = "";

  /** When the hand last took or gave up a token, in the scene's seconds. */
  let changedAt = Number.NEGATIVE_INFINITY;
  let lastHeld: string | undefined;
  let seenHand = false;

  function update(seconds: number) {
    const { hand: piece, tokens } = pieces();

    for (const token of resting) token.group.visible = false;
    for (const [order, piece] of tokens.entries()) {
      const token = resting[piece.panel];
      if (!token) continue;
      const at = toScene(piece);
      // Each later token lies over the one before, as the DOM paints them.
      token.group.position.set(at.x, at.y, TOKEN_Z + order * TOKEN_STEP);
      token.group.scale.setScalar(piece.size);
      dress(token, piece);
      token.group.visible = true;
    }

    hand.visible = piece !== undefined;
    if (!piece) return;
    const at = toScene(piece);
    hand.position.set(at.x, at.y, 0);

    const heldId = piece.held && `${piece.held.colour}|${piece.held.tag}`;
    if (seenHand && heldId !== lastHeld) changedAt = seconds;
    seenHand = true;
    lastHeld = heldId;

    held.group.visible = piece.held !== undefined;
    if (piece.held) dress(held, piece.held);

    glove.visible = piece.glove;
    tag.visible = piece.glove && piece.owner !== undefined;
    if (piece.owner) {
      const id = `${piece.owner.colour}|${piece.owner.tag}`;
      if (id !== tagLook) {
        tagLook = id;
        const texture = label("tag", piece.owner);
        tagMaterial.map = texture ?? null;
        tagMaterial.color.set(texture ? "#ffffff" : piece.owner.colour);
        tagMaterial.needsUpdate = true;
      }
    }

    const { tilt, press } = pressPose(seconds - changedAt);
    glove.rotation.x = -tilt;
    // Pushed a little along the finger, toward the fingertip, as it presses.
    gloveLean.position.set(
      -Math.sin(GLOVE_LEAN) * PRESS_DEPTH * press,
      Math.cos(GLOVE_LEAN) * PRESS_DEPTH * press,
      0,
    );
  }
  update(0);

  return {
    scene,
    update,
    dispose() {
      for (const thing of disposables) thing.dispose();
      scene.clear();
    },
  };
}

/**
 * The white glove, built from rounded primitives with a grey outline, in stage pixels. Its
 * fingertip is the group's origin; it hangs below and to the right of it, about 80px across. The
 * returned group tilts for a press; its one child leans the glove and slides it along its finger.
 */
function buildGlove(own: <T extends { dispose(): void }>(thing: T) => T): Group {
  const white = own(new MeshStandardMaterial({ color: "#f7f7fa", roughness: 0.55 }));
  const cuffWhite = own(new MeshStandardMaterial({ color: "#d4d8e0", roughness: 0.6 }));
  const outline = own(new MeshBasicMaterial({ color: "#6c7280", side: BackSide }));

  const press = new Group();
  press.name = "glove";
  const lean = new Group();
  lean.rotation.z = GLOVE_LEAN;
  press.add(lean);

  /** Adds a part and its outline. Positions are in the glove's own frame: finger up, tip at 0. */
  const part = (
    geometry: CapsuleGeometry | SphereGeometry | TorusGeometry,
    material: Material,
    [x, y, z]: readonly [number, number, number],
    [sx, sy, sz]: readonly [number, number, number] = [1, 1, 1],
    turn = 0,
    tip = 0,
  ) => {
    own(geometry);
    for (const [look, grow] of [
      [material, 1],
      [outline, OUTLINE],
    ] as const) {
      const mesh = new Mesh(geometry, look);
      mesh.position.set(x, y, z);
      mesh.scale.set(sx * grow, sy * grow, sz * grow);
      mesh.rotation.set(tip, 0, turn);
      lean.add(mesh);
    }
  };

  // The pointing finger, from its tip at the origin down to the knuckles.
  part(new CapsuleGeometry(8, 30, 6, 14), white, [0, -23, 4]);
  // The back of the hand.
  part(new SphereGeometry(1, 24, 16), white, [11, -58, 0], [22, 24, 11]);
  // Three fingers curled across the palm, stepping down from the knuckles.
  for (const [index, y] of [-44, -56, -68].entries())
    part(new CapsuleGeometry(7, 12 - index, 6, 12), white, [23, y, 8], [1, 1, 1], Math.PI / 2);
  // The thumb, folded in along the finger's side.
  part(new CapsuleGeometry(6.5, 16, 6, 12), white, [-9, -58, 6], [1, 1, 1], -0.45);
  // The cuff around the wrist: a band seen nearly edge on, its opening just showing.
  part(new TorusGeometry(15, 6, 10, 28), cuffWhite, [12, -84, 0], [1.05, 1, 1], 0, 1.25);

  return press;
}
