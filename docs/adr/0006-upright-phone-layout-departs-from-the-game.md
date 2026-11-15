# Upright phones get a stacked layout the game never had

ADR 0001 has templates look almost exactly like the real screens, but every real screen is landscape, and at 360px wide a 16:9 stage leaves fighter slots too small to tap. So a template may add an upright layout: the same pieces, restacked with the grid on top and the player panels below, chosen whenever the viewport is taller than it is wide. Turning the device swaps layouts without rebuilding the screen, so picks carry over.

## Considered Options

- **Letterbox the 16:9 stage on upright phones**: rejected because it fails the 360px tap-size target.
- **Ask the visitor to rotate their phone**: rejected because it blocks the screen until they do.
