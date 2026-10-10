# Poklike playroom design

## Mode
Experience: interactive play, not task-oriented dashboards. Keep the warm ivory, terracotta, teal, sunny yellow, slate-blue, leaf green palette. Independently designed crisp toy geometry replaces rough placeholders; no imported commercial assets.

## Responsive game composition
- Portrait <=1024px: full-height SVG `viewBox="0 0 480 840"` built per toy in `portrait-toys.js`. All core actions are in the play surface with large physical hit regions. Home and reset are the only floating chrome. **No zoom carousel, panning arrows or global tool tray** in the portrait scene.
- Landscape phones: aspect-correct cropped or letterboxed wide SVG stage. Cooking, Code Factory and Phonics use independent wide compositions and direct actions; less-developed toys retain the original wide artwork and a low tool strip where necessary. Home and reset remain accessible.
- Desktop: framed 960x600 scene on an ivory surface, with accessible tools and keyboard interactions.
- Prefer larger playable objects over showing more detail at an unusably small scale. The original intentionally uses minimum touch target sizes; adapt geometry instead of scaling a landscape screenshot down.
- Preserve scene and input coordinates through `toPortrait` / `toModel` conversion when dragging or drawing. Never store device pixels as play state.

## Game feel
- Controls respond to finger position, not only to a generic "Next" button.
- Busy Board: independent switches, two continuous sliders, turning dials, multi-pointer input; smooth low-volume synthesized effects.
- Musical Blobs: draggable objects, distinct notes and collision feedback.
- Busy Book: paged associations, tappable discoveries, navigable scenes.
- Town: movable figures/vehicle, several destinations; still a simplified original interpretation pending video observations.
- Draw directly with a finger; keep strokes and brush choices local.
- Other toy scenes share the same touch-first, uncluttered composition and are explicitly partial parity until original behavior is documented.

## Accessibility and stability
- Game SVG actions have role, accessible label, and keyboard operability; exit/reset minimum 48 CSS px on touch screens.
- Respect notches, dynamic viewport, on-device motion preference, and landscape rotation.
- Save on interaction; on update cache all assets as one atomic bundle. No external fetches after install.
- Physical-device acceptance requires Safari PWA, Android Chrome PWA, iPad portrait and landscape screenshots and real touch interaction. Browser emulation does not prove device equivalence.

## Visual QA notes
The drawing activity begins with an empty canvas; only its gallery thumbnail uses a transient sample illustration. World Puzzle reserves a six-piece tray below a two-row target board and places Shuffle above both, avoiding touch occlusion. All artwork remains original SVG geometry, with no remote image requests.
