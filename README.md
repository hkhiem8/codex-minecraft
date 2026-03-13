# Voxel Sandbox Prototype

A single-player Minecraft-like prototype built with **TypeScript + React + Three.js**, with chunked procedural terrain, collisions, mining/placing, hotbar, persistence, and a minimal UI.

## Implementation plan (concise)

1. Build chunk/world data model with deterministic terrain generation.
2. Add chunk meshing and Three.js rendering pipeline with dynamic load/unload.
3. Add first-person controller with gravity, jump, and voxel collisions.
4. Add block interaction via voxel raycast for mining/placement.
5. Add hotbar and key bindings for block selection.
6. Add save/load of player state and terrain modifications.
7. Add performance guardrails: chunk radius limits, face culling, dirty chunk remesh.
8. Polish UI and controls, validate with targeted tests + playtest checklist.

## Controls

- Click canvas: capture mouse
- WASD: move
- Space: jump
- Left click: break block
- Right click: place selected block
- 1-5: select hotbar block
- Esc: pause/help overlay
- P: save immediately

## Architecture summary

- `src/world/`: chunk model, block types, terrain generation, world streaming + modifications.
- `src/rendering/`: mesh builder for chunk geometry using face culling + simple directional shading.
- `src/player/`: collision solver and voxel raycast helpers.
- `src/game/`: game loop, input system, camera + scene orchestration.
- `src/persistence/`: save-state schema and localStorage serialization.
- `src/ui/`: React overlay UI (crosshair, hotbar, pause/help).

## Run

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

## Manual playtest checklist

- [ ] Spawn into generated terrain with visible height variation.
- [ ] Walk, collide with terrain, jump, and fall with gravity.
- [ ] Move far enough to trigger chunk load/unload without stalls/crashes.
- [ ] Mine and place blocks at chunk borders.
- [ ] Change selected block via hotbar keys and place the right block type.
- [ ] Reload page and verify player position + world edits persist.
- [ ] Pause overlay appears with Esc and pointer lock behavior remains stable.

## Performance notes

- Current meshing strategy is naive face emission with face culling and full chunk remesh on edits.
- Bottlenecks likely at larger `LOAD_RADIUS` values due to synchronous chunk generation/remeshing.
- Next optimizations: greedy meshing, worker-thread generation/meshing, frustum culling, and incremental mesh updates.

## Known limitations

- No textures yet; terrain uses per-face vertex color shading.
- No caves, biomes, mobs, crafting, day/night cycle, or fluids.
- Raycast is fixed-step and could be replaced with DDA for efficiency.
