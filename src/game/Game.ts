import * as THREE from 'three';
import { buildChunkMesh } from '../rendering/mesher';
import { loadGame, saveGame, vecToTuple } from '../persistence/save';
import { resolveMotion } from '../player/collision';
import { voxelRaycast } from '../player/raycast';
import { BlockId, PLACEABLE_BLOCKS } from '../world/blocks';
import { GRAVITY, JUMP_SPEED, MOVE_SPEED, PLAYER_EYE_HEIGHT } from '../world/constants';
import { VoxelWorld } from '../world/world';
import { Input } from './Input';

export type UIState = {
  selectedBlock: BlockId;
  paused: boolean;
};

export class Game {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  private renderer: THREE.WebGLRenderer;
  private world: VoxelWorld;
  private input = new Input();
  private playerPos = new THREE.Vector3(0, 40, 0);
  private velocity = new THREE.Vector3();
  private yaw = 0;
  private pitch = 0;
  private grounded = false;
  private selected = BlockId.Grass;
  private paused = false;
  private meshes = new Map<string, THREE.Mesh>();
  private animationFrame = 0;
  private lastTime = 0;

  constructor(
    private canvasHost: HTMLDivElement,
    private onUIUpdate: (state: UIState) => void
  ) {
    this.renderer = new THREE.WebGLRenderer({ antialias: false });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.setSize(canvasHost.clientWidth, canvasHost.clientHeight);
    canvasHost.appendChild(this.renderer.domElement);

    const save = loadGame();
    const seed = save?.seed ?? 1337;
    this.world = new VoxelWorld(seed);
    if (save) {
      this.playerPos.set(...save.playerPosition);
      this.yaw = save.yaw;
      this.pitch = save.pitch;
      this.selected = save.selectedBlock as BlockId;
      this.world.loadMods(save.mods);
    }

    this.scene.background = new THREE.Color(0x87ceeb);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    dirLight.position.set(50, 100, 40);
    this.scene.add(dirLight);

    this.setupEvents();
    this.refreshChunks();
    this.onUIUpdate({ selectedBlock: this.selected, paused: this.paused });
  }

  start(): void {
    this.lastTime = performance.now();
    const tick = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.05);
      this.lastTime = time;
      this.update(dt);
      this.render();
      this.animationFrame = requestAnimationFrame(tick);
    };
    this.animationFrame = requestAnimationFrame(tick);
  }

  dispose(): void {
    cancelAnimationFrame(this.animationFrame);
    this.renderer.dispose();
    this.canvasHost.innerHTML = '';
    window.removeEventListener('resize', this.handleResize);
  }

  private setupEvents(): void {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement !== this.renderer.domElement || this.paused) return;
      this.yaw -= event.movementX * 0.0025;
      this.pitch -= event.movementY * 0.0025;
      this.pitch = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, this.pitch));
    });
    this.renderer.domElement.addEventListener('click', () => {
      if (!this.paused) this.renderer.domElement.requestPointerLock();
    });

    window.addEventListener('mousedown', (event) => {
      if (this.paused || document.pointerLockElement !== this.renderer.domElement) return;
      this.handleBlockAction(event.button);
    });
  }

  private handleResize = (): void => {
    const w = this.canvasHost.clientWidth;
    const h = this.canvasHost.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  private update(dt: number): void {
    if (this.input.consumePress('Escape')) {
      this.paused = !this.paused;
      if (this.paused) document.exitPointerLock();
      this.onUIUpdate({ selectedBlock: this.selected, paused: this.paused });
    }

    for (let i = 0; i < PLACEABLE_BLOCKS.length; i += 1) {
      if (this.input.consumePress(`Digit${i + 1}`)) {
        this.selected = PLACEABLE_BLOCKS[i];
        this.onUIUpdate({ selectedBlock: this.selected, paused: this.paused });
      }
    }

    if (!this.paused) {
      this.updateMovement(dt);
      this.refreshChunks();
      if (this.input.consumePress('KeyP')) {
        this.persist();
      }
    }

    this.input.endFrame();
  }

  private updateMovement(dt: number): void {
    const forward = Number(this.input.isDown('KeyW')) - Number(this.input.isDown('KeyS'));
    const strafe = Number(this.input.isDown('KeyD')) - Number(this.input.isDown('KeyA'));
    const wish = new THREE.Vector3(strafe, 0, forward);
    if (wish.lengthSq() > 0) wish.normalize();

    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    const vx = wish.x * cos - wish.z * sin;
    const vz = wish.z * cos + wish.x * sin;

    this.velocity.x = vx * MOVE_SPEED;
    this.velocity.z = vz * MOVE_SPEED;

    if (this.grounded && this.input.consumePress('Space')) {
      this.velocity.y = JUMP_SPEED;
      this.grounded = false;
    }

    this.velocity.y -= GRAVITY * dt;
    const delta = this.velocity.clone().multiplyScalar(dt);
    const result = resolveMotion(this.world, this.playerPos, delta);
    this.playerPos.copy(result.position);
    if (result.grounded) {
      this.velocity.y = 0;
      this.grounded = true;
    }
  }

  private refreshChunks(): void {
    this.world.loadAround(this.playerPos.x, this.playerPos.z);

    for (const [key, chunk] of this.world.chunks) {
      if (!chunk.dirty && this.meshes.has(key)) continue;

      const existing = this.meshes.get(key);
      if (existing) {
        this.scene.remove(existing);
        existing.geometry.dispose();
      }

      const geometry = buildChunkMesh(this.world, chunk);
      const material = new THREE.MeshLambertMaterial({ vertexColors: true });
      const mesh = new THREE.Mesh(geometry, material);
      this.scene.add(mesh);
      this.meshes.set(key, mesh);
      chunk.dirty = false;
    }

    for (const [key, mesh] of this.meshes) {
      if (!this.world.chunks.has(key)) {
        this.scene.remove(mesh);
        mesh.geometry.dispose();
        this.meshes.delete(key);
      }
    }
  }

  private handleBlockAction(button: number): void {
    const dir = new THREE.Vector3(0, 0, -1)
      .applyEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'))
      .normalize();
    const hit = voxelRaycast(this.world, this.playerPos.clone().add(new THREE.Vector3(0, PLAYER_EYE_HEIGHT, 0)), dir);
    if (!hit) return;

    if (button === 0) {
      this.world.setBlock(hit.block.x, hit.block.y, hit.block.z, BlockId.Air);
    } else if (button === 2) {
      const place = hit.block.clone().add(hit.normal);
      if (this.world.getBlock(place.x, place.y, place.z) === BlockId.Air) {
        this.world.setBlock(place.x, place.y, place.z, this.selected);
      }
    }
  }

  private render(): void {
    this.camera.position.copy(this.playerPos).add(new THREE.Vector3(0, PLAYER_EYE_HEIGHT, 0));
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
    this.renderer.render(this.scene, this.camera);
  }

  persist(): void {
    saveGame({
      seed: this.world.seed,
      playerPosition: vecToTuple(this.playerPos),
      yaw: this.yaw,
      pitch: this.pitch,
      selectedBlock: this.selected,
      mods: this.world.serializeMods()
    });
  }
}
