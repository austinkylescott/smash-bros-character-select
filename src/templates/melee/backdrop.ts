/**
 * Melee's Backdrop: the dark navy space behind its slots and panels, crossed by faint diagonal
 * panes of light, with great thin rings turning slowly in depth. Built from a shader and
 * primitive geometry (ADR 0007), not taken from the game.
 *
 * Its only motion is an ambient loop: the panes drift back and forth and the rings turn.
 */
import {
  AdditiveBlending,
  Color,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RingGeometry,
  Scene,
  ShaderMaterial,
} from "three";

import type { Point } from "../../selection/useHand";
import type { LayerScene } from "../layers/scene";
import { toScene } from "../layers/view";
import type { Size } from "../stage";

/** Navy at the glow's heart, deep navy around it, and near black at the far corners. */
const SPACE = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uSize;

  const vec3 HEART = vec3(0.110, 0.188, 0.314);
  const vec3 DEEP = vec3(0.024, 0.071, 0.141);
  const vec3 EDGE = vec3(0.000, 0.039, 0.094);
  const vec3 LIGHT = vec3(0.314, 0.431, 0.588);

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // A soft band of light, one unit wide, repeating every unit along s.
  float band(float s, float width) {
    float f = abs(fract(s) - 0.5) * 2.0;
    return smoothstep(width, 0.0, f);
  }

  void main() {
    // Stage pixels, y down, measured in stage widths so both stages share one look.
    vec2 q = vec2(vUv.x, 1.0 - vUv.y) * uSize / uSize.x;

    // Melee's space is near black, lifting to blue behind the top right of the grid.
    float d = length((q - vec2(0.94, 0.22)) * vec2(1.0, 1.3));
    vec3 colour = mix(HEART, DEEP, smoothstep(0.0, 0.3, d));
    colour = mix(colour, EDGE, smoothstep(0.25, 0.8, d));

    // Diagonal light, rising to the right as Melee's does, drifting slowly along its slant.
    float s = dot(q, normalize(vec2(0.88, 0.47)));
    float drift = sin(uTime * 0.21) * 0.05;
    float light = band(s * 1.4 + drift, 0.22) * 0.10 + band(s * 2.3 - drift * 1.7 + 0.35, 0.12) * 0.07;
    colour += LIGHT * light;

    // A breath of dither, so the long gradients never band.
    colour += (hash(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = vec4(colour, 1.0);
  }
`;

const PASS_UV = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/** A tall pane of glass: brightest down its middle, fading out to either side. */
const PANE = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColour;
  uniform float uOpacity;
  void main() {
    float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
    float along = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.75, vUv.y);
    gl_FragColor = vec4(uColour * uOpacity * across * along, 1.0);
  }
`;

interface Pane {
  readonly mesh: Mesh;
  readonly home: Point;
  readonly sway: number;
  readonly speed: number;
  readonly phase: number;
}

interface Ring {
  readonly mesh: Mesh;
  readonly tilt: number;
  readonly speed: number;
  readonly phase: number;
}

/** The panes slant as Melee's light does, about 28 degrees off upright. */
const SLANT = -0.49;

export function meleeBackdrop(stage: Size): LayerScene {
  const scene = new Scene();
  const disposables: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(thing: T): T => {
    disposables.push(thing);
    return thing;
  };

  const centre = toScene({ x: stage.width / 2, y: stage.height / 2 });

  const spaceUniforms = {
    uTime: { value: 0 },
    uSize: { value: [stage.width, stage.height] },
  };
  const space = new Mesh(
    own(new PlaneGeometry(stage.width, stage.height)),
    own(
      new ShaderMaterial({
        uniforms: spaceUniforms,
        vertexShader: PASS_UV,
        fragmentShader: SPACE,
        depthTest: false,
        depthWrite: false,
      }),
    ),
  );
  space.position.set(centre.x, centre.y, -500);
  space.renderOrder = 0;
  scene.add(space);

  const paneGeometry = own(new PlaneGeometry(1, 1));
  const panes: Pane[] = [
    { x: 0.18, y: 0.6, width: 0.34, opacity: 0.09, sway: 60, speed: 0.13, phase: 0 },
    { x: 0.52, y: 0.42, width: 0.2, opacity: 0.07, sway: 90, speed: 0.09, phase: 2.1 },
    { x: 0.78, y: 0.7, width: 0.42, opacity: 0.06, sway: 70, speed: 0.11, phase: 4.2 },
    { x: 0.95, y: 0.3, width: 0.16, opacity: 0.08, sway: 50, speed: 0.15, phase: 1.3 },
  ].map(({ x, y, width, opacity, sway, speed, phase }): Pane => {
    const mesh = new Mesh(
      paneGeometry,
      own(
        new ShaderMaterial({
          uniforms: {
            uColour: { value: new Color("#5a7fb4") },
            uOpacity: { value: opacity },
          },
          vertexShader: PASS_UV,
          fragmentShader: PANE,
          transparent: true,
          blending: AdditiveBlending,
          depthTest: false,
          depthWrite: false,
        }),
      ),
    );
    mesh.scale.set(stage.width * width, stage.height * 1.6, 1);
    mesh.rotation.z = SLANT;
    mesh.renderOrder = 1;
    const home = toScene({ x: stage.width * x, y: stage.height * y });
    mesh.position.set(home.x, home.y, 0);
    scene.add(mesh);
    return { mesh, home, sway, speed, phase };
  });

  // The rings turn about a point above the top right, so their arcs sweep the header and grid.
  const hub = new Group();
  const hubAt = toScene({ x: stage.width * 0.86, y: 300 });
  hub.position.set(hubAt.x, hubAt.y, 0);
  scene.add(hub);
  const rings: Ring[] = [
    { radius: 620, width: 5, arc: 1.7, opacity: 0.14, tilt: 0.5, speed: 0.05, phase: 0 },
    { radius: 700, width: 2.5, arc: 1.4, opacity: 0.1, tilt: 0.75, speed: -0.035, phase: 1.9 },
    { radius: 860, width: 9, arc: 1.2, opacity: 0.05, tilt: 0.35, speed: 0.025, phase: 3.6 },
  ].map(({ radius, width, arc, opacity, tilt, speed, phase }): Ring => {
    const mesh = new Mesh(
      own(new RingGeometry(radius - width / 2, radius + width / 2, 160, 1, 0, Math.PI * arc)),
      own(
        new MeshBasicMaterial({
          color: new Color("#7e9cc8"),
          opacity,
          transparent: true,
          blending: AdditiveBlending,
          depthTest: false,
          depthWrite: false,
        }),
      ),
    );
    mesh.renderOrder = 2;
    hub.add(mesh);
    return { mesh, tilt, speed, phase };
  });

  function update(seconds: number) {
    spaceUniforms.uTime.value = seconds;
    for (const { mesh, home, sway, speed, phase } of panes) {
      // Each pane drifts back and forth across its slant.
      const offset = Math.sin(seconds * speed + phase) * sway;
      mesh.position.x = home.x + offset * Math.cos(SLANT);
      mesh.position.y = home.y + offset * Math.sin(SLANT);
    }
    for (const { mesh, tilt, speed, phase } of rings) {
      mesh.rotation.set(
        tilt + Math.sin(seconds * 0.1 + phase) * 0.15,
        Math.sin(seconds * 0.07 + phase) * 0.4,
        phase + seconds * speed,
      );
    }
  }
  update(0);

  return {
    scene,
    // The Backdrop is soft; drawing it past one pixel per CSS pixel would only cost fill.
    maxPixelRatio: 1,
    update,
    dispose() {
      for (const thing of disposables) thing.dispose();
      scene.clear();
    },
  };
}
