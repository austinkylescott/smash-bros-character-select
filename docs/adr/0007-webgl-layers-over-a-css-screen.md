# WebGL layers over a screen that still works in CSS

To bring templates closer to their reference screenshots (ADR 0001), three.js draws only what CSS cannot match: moving 3D backdrops and lit 3D pieces such as the hand and tokens. These sit in canvases layered under and over the existing DOM screen. The DOM keeps every slot, panel and control, so selection, keyboard use, screen-reader labels and the upright layout (ADR 0006) are unchanged. The CSS screen remains complete without WebGL: a template's 3D layers are added only when WebGL is available, and a template ships them only once it holds 60fps on a mid-range phone in development. The frame rate is not measured live, so a screen never changes look partway through a visit. Under reduced motion the scene is drawn but stays still. Visual gaps CSS can close are closed in CSS. The 3D pieces are built in code (shaders and primitive geometry), not ripped from the games, so they add no official assets to the private bucket (ADR 0005); a ripped model is considered for a piece only if the built one clearly fails the side-by-side.

Melee is the pilot, as the screen with the most 3D in its reference. Progress is judged by eye, with the app's screenshot side by side with the reference at the reference's resolution.

## Considered Options

- **Rebuild each screen in one WebGL canvas**: rejected because it rewrites every template, and its hit-testing and accessibility would have to be rebuilt.
- **Route every visual improvement through three.js**: rejected because the goal is matching the screenshots, and CSS does much of that with no runtime cost.
- **WebGL with no CSS fallback**: rejected because WebGL can fail to start or stutter on cheap phones, and the site must work at 360px upright.
