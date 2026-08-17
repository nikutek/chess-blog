import * as THREE from "three";

import type { SquareMove } from "./recent-analyses";

type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
type PieceColor = "light" | "dark";

type MoveAnimation = {
  mesh: THREE.Object3D;
  from: THREE.Vector3;
  to: THREE.Vector3;
  start: number;
  duration: number;
};

const ACCENT_COLOR = 0xd6483a;
const ROTATION_SPEED = 0.08;
const MOVE_DURATION_MS = 520;
const MARKER_FADE_PER_SECOND = 0.7;

const BACK_RANK: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
const FILES = "abcdefgh";

/**
 * Free-standing (framework-agnostic) three.js scene: a rotating 3D chess
 * board used as the homepage hero. Kept out of React so the render loop
 * and disposal aren't tangled up with component re-renders.
 */
export class ChessScene3D {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private boardGroup!: THREE.Group;
  private marker!: THREE.Mesh<THREE.CylinderGeometry, THREE.MeshBasicMaterial>;
  private piecesBySquare: Record<string, THREE.Object3D> = {};
  private initialPositions: Record<string, THREE.Vector3> = {};
  private activeAnimations: MoveAnimation[] = [];
  private rafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeRaf: number | null = null;
  private lastSize = { w: 0, h: 0 };
  private rotationPaused = false;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  mount(): void {
    const container = this.container;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 100);
    this.scene = scene;
    this.camera = camera;
    this.frameCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.cssText = "display:block;width:100%;height:100%;position:absolute;inset:0";
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(4, 8, 5);
    scene.add(dirLight);

    const boardGroup = new THREE.Group();
    scene.add(boardGroup);
    this.boardGroup = boardGroup;

    this.buildBoard(boardGroup);
    this.marker = this.buildMoveMarker(boardGroup);
    this.buildPieces(boardGroup);

    this.startRenderLoop();
    this.observeResize();
  }

  dispose(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    if (this.resizeRaf !== null) cancelAnimationFrame(this.resizeRaf);
    this.resizeObserver?.disconnect();
    this.renderer?.dispose();
    this.container.replaceChildren();
  }

  setRotationPaused(paused: boolean): void {
    this.rotationPaused = paused;
  }

  resetBoard(): void {
    this.activeAnimations = [];
    Object.entries(this.initialPositions).forEach(([square, position]) => {
      this.piecesBySquare[square]?.position.copy(position);
    });
    this.piecesBySquare = {};
    this.boardGroup.children
      .filter((child): child is THREE.Object3D => Boolean(child.userData.home))
      .forEach((mesh) => {
        this.piecesBySquare[mesh.userData.home as string] = mesh;
      });
    this.marker.material.opacity = 0;
  }

  animateMove(move: SquareMove): void {
    const mesh = this.piecesBySquare[move.from];
    if (!mesh) return;
    delete this.piecesBySquare[move.from];
    this.piecesBySquare[move.to] = mesh;
    const from = mesh.position.clone();
    const to = this.squarePosition(move.to);
    this.activeAnimations.push({ mesh, from, to, start: performance.now(), duration: MOVE_DURATION_MS });
    this.marker.position.set(to.x, 0.06, to.z);
    this.marker.material.opacity = 0.7;
  }

  private frameCamera(): void {
    const { container, camera } = this;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    const radius = 6.1;
    const vFov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const hFov = Math.atan(Math.tan(vFov) * camera.aspect);
    const dist = (radius / Math.sin(Math.min(vFov, hFov))) * 0.96;
    const elev = THREE.MathUtils.degToRad(38);
    const azim = THREE.MathUtils.degToRad(18);
    const flat = Math.cos(elev) * dist;
    camera.position.set(Math.sin(azim) * flat, Math.sin(elev) * dist + 0.3, -Math.cos(azim) * flat);
    camera.lookAt(0, 0.1, 0);
    camera.updateProjectionMatrix();
  }

  private buildBoard(boardGroup: THREE.Group): void {
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1e, roughness: 0.8 });
    const base = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.3, 8.6), baseMat);
    base.position.y = -0.15;
    boardGroup.add(base);

    const lightSqMat = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.55 });
    const darkSqMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2d, roughness: 0.55 });
    const sqGeo = new THREE.BoxGeometry(0.98, 0.05, 0.98);
    for (let col = 0; col < 8; col++) {
      for (let row = 0; row < 8; row++) {
        const mat = (col + row) % 2 === 0 ? lightSqMat : darkSqMat;
        const sq = new THREE.Mesh(sqGeo, mat);
        sq.position.set(col - 3.5, 0.025, row - 3.5);
        boardGroup.add(sq);
      }
    }
  }

  private buildMoveMarker(boardGroup: THREE.Group) {
    const marker = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.02, 24),
      new THREE.MeshBasicMaterial({ color: ACCENT_COLOR, transparent: true, opacity: 0 }),
    );
    marker.position.y = 0.06;
    boardGroup.add(marker);
    return marker;
  }

  private buildPieces(boardGroup: THREE.Group): void {
    const lightMat = new THREE.MeshStandardMaterial({ color: 0xe8e1d2, roughness: 0.35, metalness: 0.05 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x323236, roughness: 0.3, metalness: 0.08 });

    const initial: { type: PieceType; color: PieceColor; col: number; row: number }[] = [];
    for (let col = 0; col < 8; col++) {
      initial.push({ type: BACK_RANK[col], color: "light", col, row: 0 });
      initial.push({ type: "pawn", color: "light", col, row: 1 });
      initial.push({ type: "pawn", color: "dark", col, row: 6 });
      initial.push({ type: BACK_RANK[col], color: "dark", col, row: 7 });
    }

    initial.forEach((spec) => {
      const mat = spec.color === "light" ? lightMat : darkMat;
      const mesh = this.createPiece(spec.type, mat);
      const square = FILES[spec.col] + (spec.row + 1);
      mesh.position.set(spec.col - 3.5, 0, spec.row - 3.5);
      mesh.userData.home = square;
      boardGroup.add(mesh);
      this.piecesBySquare[square] = mesh;
      this.initialPositions[square] = mesh.position.clone();
    });
  }

  private lathe(profile: [number, number][], mat: THREE.Material, segments = 40) {
    const pts = profile.map(([x, y]) => new THREE.Vector2(x, y));
    return new THREE.Mesh(new THREE.LatheGeometry(pts, segments), mat);
  }

  private createPiece(type: PieceType, mat: THREE.Material): THREE.Group {
    const g = new THREE.Group();
    // classic Staunton-style lathe profiles: [radius, height]
    const base: [number, number][] = [
      [0, 0],
      [0.3, 0],
      [0.31, 0.03],
      [0.29, 0.07],
      [0.24, 0.1],
      [0.21, 0.13],
    ];
    if (type === "pawn") {
      g.add(
        this.lathe(
          [...base, [0.15, 0.17], [0.1, 0.28], [0.085, 0.4], [0.13, 0.44], [0.15, 0.47], [0.1, 0.5], [0, 0.5]],
          mat,
        ),
      );
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 24, 18), mat);
      head.position.y = 0.6;
      g.add(head);
    } else if (type === "rook") {
      g.add(
        this.lathe(
          [
            ...base,
            [0.17, 0.18],
            [0.14, 0.3],
            [0.13, 0.52],
            [0.145, 0.6],
            [0.21, 0.64],
            [0.215, 0.72],
            [0.185, 0.72],
            [0.185, 0.68],
            [0, 0.68],
          ],
          mat,
        ),
      );
      for (let i = 0; i < 5; i++) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.05), mat);
        const a = (i / 5) * Math.PI * 2;
        b.position.set(Math.cos(a) * 0.185, 0.755, Math.sin(a) * 0.185);
        b.rotation.y = -a + Math.PI / 2;
        g.add(b);
      }
    } else if (type === "bishop") {
      g.add(
        this.lathe(
          [
            ...base,
            [0.15, 0.18],
            [0.1, 0.32],
            [0.08, 0.52],
            [0.13, 0.58],
            [0.145, 0.62],
            [0.1, 0.66],
            [0.115, 0.72],
            [0.09, 0.82],
            [0.04, 0.9],
            [0, 0.92],
          ],
          mat,
        ),
      );
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), mat);
      tip.position.y = 0.96;
      g.add(tip);
    } else if (type === "knight") {
      g.add(this.lathe([...base, [0.17, 0.18], [0.15, 0.26], [0.14, 0.34], [0.17, 0.38], [0.18, 0.42], [0, 0.42]], mat));
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.145, 0.42, 20), mat);
      neck.position.set(0, 0.6, -0.02);
      neck.rotation.x = 0.28;
      g.add(neck);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 16), mat);
      head.scale.set(0.85, 0.9, 1.35);
      head.position.set(0, 0.82, 0.1);
      head.rotation.x = 0.5;
      g.add(head);
      const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.2, 16), mat);
      muzzle.position.set(0, 0.76, 0.24);
      muzzle.rotation.x = 1.15;
      g.add(muzzle);
      const earL = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.11, 10), mat);
      earL.position.set(0.055, 0.93, 0.02);
      earL.rotation.x = -0.25;
      g.add(earL);
      const earR = earL.clone();
      earR.position.x = -0.055;
      g.add(earR);
      const mane = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), mat);
      mane.scale.set(0.5, 1.1, 0.7);
      mane.position.set(0, 0.68, -0.12);
      g.add(mane);
    } else if (type === "queen") {
      g.add(
        this.lathe(
          [
            ...base,
            [0.17, 0.18],
            [0.11, 0.34],
            [0.085, 0.58],
            [0.14, 0.68],
            [0.16, 0.74],
            [0.11, 0.78],
            [0.15, 0.86],
            [0.17, 0.92],
            [0.1, 0.96],
            [0, 0.98],
          ],
          mat,
        ),
      );
      for (let i = 0; i < 8; i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), mat);
        const a = (i / 8) * Math.PI * 2;
        p.position.set(Math.cos(a) * 0.145, 0.95, Math.sin(a) * 0.145);
        g.add(p);
      }
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), mat);
      orb.position.y = 1.02;
      g.add(orb);
    } else if (type === "king") {
      g.add(
        this.lathe(
          [
            ...base,
            [0.18, 0.18],
            [0.12, 0.36],
            [0.09, 0.62],
            [0.15, 0.72],
            [0.17, 0.78],
            [0.12, 0.82],
            [0.16, 0.9],
            [0.17, 0.96],
            [0.09, 1.0],
            [0.11, 1.04],
            [0, 1.06],
          ],
          mat,
        ),
      );
      const v = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.05), mat);
      v.position.y = 1.17;
      g.add(v);
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.05), mat);
      h.position.y = 1.2;
      g.add(h);
    }
    return g;
  }

  private squarePosition(square: string): THREE.Vector3 {
    const col = square.charCodeAt(0) - 97;
    const row = parseInt(square[1], 10) - 1;
    return new THREE.Vector3(col - 3.5, 0, row - 3.5);
  }

  private startRenderLoop(): void {
    let lastT = performance.now();
    const animate = () => {
      this.rafId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = Math.min(0.1, (now - lastT) / 1000);
      lastT = now;
      if (!this.rotationPaused) {
        this.boardGroup.rotation.y += delta * ROTATION_SPEED;
      }
      this.activeAnimations = this.activeAnimations.filter((a) => {
        const t = Math.min(1, (performance.now() - a.start) / a.duration);
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const pos = new THREE.Vector3().lerpVectors(a.from, a.to, ease);
        pos.y = Math.sin(ease * Math.PI) * 0.4;
        a.mesh.position.copy(pos);
        return t < 1;
      });
      if (this.marker.material.opacity > 0) {
        this.marker.material.opacity = Math.max(0, this.marker.material.opacity - delta * MARKER_FADE_PER_SECOND);
      }
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  private observeResize(): void {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.resizeRaf !== null) cancelAnimationFrame(this.resizeRaf);
      this.resizeRaf = requestAnimationFrame(() => {
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (!w || !h || (w === this.lastSize.w && h === this.lastSize.h)) return;
        this.lastSize = { w, h };
        this.renderer.setSize(w, h);
        this.frameCamera();
      });
    });
    this.resizeObserver.observe(this.container);
  }
}
