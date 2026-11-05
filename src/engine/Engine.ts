// ============================================================================
// 3D 引擎（命令式，独占 three.js）。沿用 anatomy 项目的架构：
//   - React 不按帧渲染；引擎订阅全局状态，只在有变化时绘制（render-on-demand）
//   - 资源分阶段加载：核心（牙列+颌骨）→ 背景与肌肉 → 神经血管 → 单牙内部组织（按需）
//   - 标签、提示框等覆盖层由引擎直接操作 DOM，跟随模型不触发 React 渲染
// ============================================================================
import { nameOf, tr } from "../i18n";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";
import gsap from "gsap";
import { MeshoptSimplifier } from "meshoptimizer";

import type { CategoryId, ViewPreset } from "../content/types";
import {
  type Manifest,
  type Rig,
  INTERNAL_CATEGORIES,
  baseIdOf,
  categoryOf,
  describe,
  describeLandmark,
  fdiOfKey,
  rigOf,
} from "../anatomy/registry";
import { ALL_FDI, formatTooth } from "../anatomy/notation";
import { SURFACE_FEATURES } from "../content/toothParts";
import { type AppState, actions, useStore, setState, getState } from "../state/store";
import { createCavityMesh, createTissueMaterial, sharedJaw, sharedLesion, uniformsOf } from "./materials";
import type { LesionFrame, LesionParams } from "../disease/caries";
import { JawWeightField, weightsFromVertexColor, worldPoints } from "./weights";
import SmoothWorker from "./smooth.worker?worker";

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;


const MODEL_BASE = `${import.meta.env.BASE_URL}models/`;

/** 圆形粒子贴图 */
function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.85)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(32, 32, 30, 0, Math.PI * 2);
  g.fill();
  return new THREE.CanvasTexture(c);
}

/** 流畅模式下各类大网格保留的三角形比例（误差上限约为网格尺寸的 1%） */
const LOD_RATIO: Partial<Record<CategoryId, number>> = {
  teeth: 0.25,
  gingiva: 0.3,
  alveolar: 0.35,
  maxilla: 0.35,
  mandible: 0.35,
  skull: 0.3,
  muscles: 0.3,
};

/** 粗略判断是否为低性能 GPU：集成显卡、移动 GPU、软件渲染，或触屏设备 */
function detectLowPower(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    const ext = gl?.getExtension("WEBGL_debug_renderer_info");
    const name = String(ext ? gl!.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "");
    if (/intel|uhd|iris|mali|adreno|powervr|swiftshader|llvmpipe|microsoft basic/i.test(name)) return true;
  } catch {
    /* 无法检测时按触屏/核心数判断 */
  }
  return window.matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency ?? 8) < 6;
}

// ---------------------------------------------------------------- 平滑 Worker 池
const workers: Worker[] = [];
const pending = new Map<number, (g: THREE.BufferGeometry) => void>();
let nextJob = 0;
function pool() {
  if (!workers.length) {
    const n = Math.min(3, Math.max(1, (navigator.hardwareConcurrency ?? 4) - 2));
    for (let i = 0; i < n; i++) {
      const w = new SmoothWorker();
      w.onmessage = (e: MessageEvent<{ id: number; position: Float32Array; normal: Float32Array; index: Uint32Array }>) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(e.data.position, 3));
        g.setAttribute("normal", new THREE.BufferAttribute(e.data.normal, 3));
        g.setIndex(new THREE.BufferAttribute(e.data.index, 1));
        pending.get(e.data.id)?.(g);
        pending.delete(e.data.id);
      };
      workers.push(w);
    }
  }
  return workers;
}
function smoothInWorker(src: THREE.BufferGeometry, iterations: number): Promise<THREE.BufferGeometry> {
  const p = src.getAttribute("position");
  const position = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    position[i * 3] = p.getX(i);
    position[i * 3 + 1] = p.getY(i);
    position[i * 3 + 2] = p.getZ(i);
  }
  const index = src.index ? new Uint32Array(src.index.array) : null;
  const id = nextJob++;
  const ws = pool();
  return new Promise((resolve) => {
    pending.set(id, resolve);
    ws[id % ws.length].postMessage({ id, position, index, iterations }, index ? [position.buffer, index.buffer] : [position.buffer]);
  });
}
const GHOST = 0.16;
const FAINT = 0.07;
const FOV = 30;
const DENTITION_CENTER = new THREE.Vector3(0, 0.6, -0.2);
const HIGHLIGHT_SELECT = new THREE.Color("#14b8a6");
const HIGHLIGHT_QUIZ = new THREE.Color("#ff6a00");

/** 单牙解剖：各层沿牙体坐标系分离的方向与距离（cm）。axis 指向咬合面，mesial 指向近中。 */
const LAYER_EXPLODE: Record<string, { axis: number; mesial: number }> = {
  enamel: { axis: 1.25, mesial: 0 },
  "dentin-coronal": { axis: 0.6, mesial: 0 },
  "pulp-chamber": { axis: 0, mesial: 0 },
  canal: { axis: 0, mesial: 0 },
  "dentin-radicular": { axis: 0, mesial: -1.25 },
  cementum: { axis: 0, mesial: 1.25 },
  pdl: { axis: 0, mesial: 2.5 },
};

interface Entry {
  key: string;
  mesh: THREE.Mesh;
  holder: THREE.Object3D; // 单牙分层时用于整体平移
  mat: THREE.MeshPhysicalMaterial;
  category: CategoryId;
  rig: Rig;
  fdi: number | null;
  base: string;
  opacity: number;
  target: number;
  highlight: number;
  hTarget: number;
  hColor: THREE.Color;
  /** 标签锚点（holder 局部坐标） */
  anchor: THREE.Vector3;
  /** 原始几何与流畅模式下的简化几何（共用顶点数据，只替换索引） */
  fullGeo?: THREE.BufferGeometry;
  lodGeo?: THREE.BufferGeometry;
}

interface Label {
  id: string;
  text: string;
  sub?: string;
  kind: "tooth" | "landmark" | "structure" | "feature" | "selected";
  priority: number;
  parent: THREE.Object3D;
  local: THREE.Vector3;
  select?: string;
  el?: HTMLDivElement;
  occluded?: boolean;
}

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 600);
  private controls: OrbitControls;
  private loader: GLTFLoader;
  manifest!: Manifest;

  // 层级：上颌（不动）/ 下颌（张口时转动）/ 舌骨 / 关节盘 / 联动网格
  private root = new THREE.Group();
  private groups: Record<Exclude<Rig, "blend">, THREE.Group> & { lowerJaw: THREE.Group; blend: THREE.Group };
  private toothGroups = new Map<number, THREE.Group>();

  private entries = new Map<string, Entry>();
  private loadedFiles = new Set<string>();
  private loadingFiles = new Map<string, Promise<void>>();

  private clipPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
  private raycaster = new THREE.Raycaster();

  private jaw = { open: 0, explode: 0, tooth: 0 };
  private dirty = true;
  private busyUntil = 0;
  private frame = 0;
  private width = 1;
  private height = 1;
  private disposed = false;

  // 覆盖层
  private overlay: HTMLDivElement;
  private tooltip: HTMLDivElement;
  private labels: Label[] = [];
  private lastOcclusion = 0;

  private pointer = { x: 0, y: 0, downX: 0, downY: 0, down: false, moved: false };
  private hoverKey: string | null = null;
  private hoverQueued = false;
  private unsub: () => void;

  constructor(private container: HTMLElement) {
    this.lowPower = detectLowPower();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(this.basePixelRatio());
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.localClippingEnabled = true;
    this.renderer.domElement.className = "stage-canvas";
    this.renderer.domElement.setAttribute("aria-label", tr("口腔解剖三维模型，可拖动旋转、滚轮缩放、点击选择结构", "3D oral anatomy model: drag to rotate, scroll to zoom, click to select a structure"));
    this.renderer.domElement.tabIndex = 0;
    container.appendChild(this.renderer.domElement);

    this.overlay = document.createElement("div");
    this.overlay.className = "label-layer";
    container.appendChild(this.overlay);
    this.tooltip = document.createElement("div");
    this.tooltip.className = "hover-tip";
    this.tooltip.hidden = true;
    container.appendChild(this.tooltip);

    this.camera.position.set(14, 7, 20);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.rotateSpeed = 0.75;
    this.controls.zoomSpeed = 0.9;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 90;
    this.controls.target.copy(DENTITION_CENTER);
    this.controls.autoRotateSpeed = 0.9;
    this.controls.addEventListener("change", () => {
      this.dirty = true;
      this.lastMotion = performance.now();
    });

    const g = () => new THREE.Group();
    this.groups = {
      upperBone: g(),
      upperGum: g(),
      upperTeeth: g(),
      lowerJaw: g(),
      lowerBone: g(),
      lowerGum: g(),
      lowerTeeth: g(),
      hyoid: g(),
      disc: g(),
      blend: g(),
    };
    for (const [name, grp] of Object.entries(this.groups)) grp.name = name;
    this.groups.lowerJaw.add(this.groups.lowerBone, this.groups.lowerGum, this.groups.lowerTeeth);
    this.root.add(
      this.groups.upperBone,
      this.groups.upperGum,
      this.groups.upperTeeth,
      this.groups.lowerJaw,
      this.groups.hyoid,
      this.groups.disc,
      this.groups.blend,
    );
    this.scene.add(this.root);
    this.buildLights();

    // meshopt 解码放到 Worker 中
    MeshoptDecoder.useWorkers?.(2);
    this.loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);

    new ResizeObserver(() => this.resize()).observe(container);
    const c = this.renderer.domElement;
    c.addEventListener("pointerdown", this.onPointerDown);
    c.addEventListener("pointermove", this.onPointerMove);
    c.addEventListener("pointerup", this.onPointerUp);
    c.addEventListener("pointerleave", this.onPointerLeave);
    c.addEventListener("dblclick", this.onDoubleClick);
    this.overlay.addEventListener("click", this.onLabelClick);
    document.addEventListener("visibilitychange", this.onVisibility);

    this.unsub = useStore.subscribe((s, prev) => this.onState(s, prev));
    this.resize();
    this.animate();
  }

  // ======================================================== 场景基础

  private buildLights() {
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene.environmentIntensity = 0.7;

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f78, 0.9));
    const key = new THREE.DirectionalLight(0xfff6ec, 2.2);
    key.position.set(12, 18, 22);
    const fill = new THREE.DirectionalLight(0xe4ecff, 0.9);
    fill.position.set(-18, 4, 12);
    const rim = new THREE.DirectionalLight(0xffffff, 1.1);
    rim.position.set(0, 10, -24);
    const under = new THREE.DirectionalLight(0xfff0e8, 0.45);
    under.position.set(0, -20, 6);
    // 灯光跟随相机，任何角度下都有稳定的主光
    this.camera.add(key, fill, rim, under);
    this.scene.add(this.camera);
  }

  // ======================================================== 画质

  /** 集成显卡 / 移动设备等低性能环境 */
  private lowPower = false;
  private lastMotion = 0;
  private motionScaled = false;

  private effectiveQuality(): "smooth" | "high" {
    const q = getState().quality;
    return q === "auto" ? (this.lowPower ? "smooth" : "high") : q;
  }

  /** 静止时的像素比：高清最高 2，流畅最高 1.25 */
  private basePixelRatio() {
    return Math.min(window.devicePixelRatio, this.effectiveQuality() === "smooth" ? 1.25 : 2);
  }

  /** 流畅模式：旋转/过渡时临时降低分辨率，静止 250 ms 后恢复（固定两档，不做自适应调节） */
  private updateMotionScale(now: number, moving: boolean) {
    if (this.effectiveQuality() !== "smooth") {
      if (this.motionScaled) this.setPixelRatio(this.basePixelRatio(), false);
      return;
    }
    const want = moving || now - this.lastMotion < 250;
    if (want !== this.motionScaled)
      this.setPixelRatio(want ? Math.max(0.75, this.basePixelRatio() * 0.6) : this.basePixelRatio(), want);
  }

  private setPixelRatio(pr: number, scaled: boolean) {
    this.motionScaled = scaled;
    this.renderer.setPixelRatio(pr);
    this.renderer.setSize(this.width, this.height, false);
    this.dirty = true;
  }

  /** 应用画质：流畅模式关闭清漆层与光泽层（两个额外的高光波瓣，逐像素开销最大） */
  applyQuality() {
    const smooth = this.effectiveQuality() === "smooth";
    for (const e of this.entries.values()) {
      this.applyMaterialQuality(e.mat, smooth);
      this.useLod(e, smooth);
    }
    this.setPixelRatio(this.basePixelRatio(), false);
    void this.warmUp([...this.entries.values()].map((e) => e.mesh));
  }

  private applyMaterialQuality(m: THREE.MeshPhysicalMaterial, smooth: boolean) {
    const full = (m.userData.full ??= { clearcoat: m.clearcoat, sheen: m.sheen });
    const clearcoat = smooth ? 0 : full.clearcoat;
    const sheen = smooth ? 0 : full.sheen;
    if (m.clearcoat !== clearcoat || m.sheen !== sheen) {
      m.clearcoat = clearcoat;
      m.sheen = sheen;
      m.needsUpdate = true;
    }
  }

  /**
   * 预编译着色器：材质在“不透明 / 半透明”之间切换会用到另一套着色器，
   * 若等到切换时才编译，会卡顿几十到几百毫秒。这里在加载后用 compileAsync
   * （支持时并行编译、不阻塞主线程）把两种状态都编好。
   */
  private async warmUp(meshes: THREE.Mesh[]) {
    const proxies = new THREE.Group();
    const seen = new Set<string>();
    for (const m of meshes) {
      const mat = m.material as THREE.MeshPhysicalMaterial;
      const key = [mat.customProgramCacheKey(), mat.clearcoat > 0, mat.sheen > 0, Boolean(m.geometry.getAttribute("jawWeight"))].join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      const proxy = new THREE.Mesh(m.geometry, mat);
      proxies.add(proxy);
    }
    const mats = proxies.children.map((c) => (c as THREE.Mesh).material as THREE.Material);
    const saved = mats.map((m) => m.transparent);
    try {
      for (const transparent of [false, true]) {
        mats.forEach((m) => {
          m.transparent = transparent;
          m.needsUpdate = true;
        });
        await this.renderer.compileAsync(proxies, this.camera, this.scene);
      }
    } catch (err) {
      console.warn("着色器预编译失败（不影响使用）", err);
    } finally {
      mats.forEach((m, i) => {
        m.transparent = saved[i];
        m.needsUpdate = true;
      });
    }
    this.warmDraw(meshes);
  }

  /**
   * 预热绘制：Windows 上 Chrome 经 ANGLE 把 WebGL 转为 D3D11，驱动要等“着色器 + 顶点格式”
   * 第一次真正绘制时才编译底层着色器并上传几何，导致结构第一次显示时卡顿上百毫秒。
   * 这里在同一段同步代码中，把这批网格临时设为可见，以不透明、半透明两种状态各向 1×1
   * 离屏目标绘制一次（使用真实材质与灯光），随后立即恢复——屏幕上不会出现任何闪烁。
   */
  private warmTarget = new THREE.WebGLRenderTarget(1, 1);
  private warmDraw(meshes: THREE.Mesh[]) {
    const state = meshes.map((m) => {
      const mat = m.material as THREE.Material;
      return { m, mat, visible: m.visible, transparent: mat.transparent, opacity: mat.opacity, culled: m.frustumCulled };
    });
    const prevTarget = this.renderer.getRenderTarget();
    const hidden: THREE.Object3D[] = [];
    // 只画这批网格：其余已显示的网格暂时隐藏，避免多余的绘制开销
    for (const e of this.entries.values()) if (e.mesh.visible && !meshes.includes(e.mesh)) hidden.push(e.mesh);
    hidden.forEach((o) => (o.visible = false));
    try {
      this.renderer.setRenderTarget(this.warmTarget);
      for (const transparent of [false, true]) {
        for (const st of state) {
          st.m.visible = true;
          st.m.frustumCulled = false;
          st.mat.opacity = transparent ? 0.5 : 1;
          if (st.mat.transparent !== transparent) {
            st.mat.transparent = transparent;
            st.mat.needsUpdate = true;
          }
        }
        this.renderer.render(this.scene, this.camera);
      }
    } finally {
      this.renderer.setRenderTarget(prevTarget);
      for (const st of state) {
        st.m.visible = st.visible;
        st.m.frustumCulled = st.culled;
        st.mat.opacity = st.opacity;
        if (st.mat.transparent !== st.transparent) {
          st.mat.transparent = st.transparent;
          st.mat.needsUpdate = true;
        }
      }
      hidden.forEach((o) => (o.visible = true));
    }
  }

  private insets = { left: 0, right: 0, top: 0, bottom: 0 };
  private insetTween = { dx: 0, dy: 0 };

  /** 告诉引擎画布哪些部分被面板遮挡：投影中心平移到可见区域的中心 */
  setInsets(i: { left: number; right: number; top: number; bottom: number }) {
    this.insets = i;
    const dx = (i.left - i.right) / 2;
    const dy = (i.top - i.bottom) / 2;
    gsap.to(this.insetTween, {
      dx,
      dy,
      duration: 0.45,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => this.applyViewOffset(),
    });
  }

  private applyViewOffset() {
    const { dx, dy } = this.insetTween;
    this.camera.setViewOffset(this.width, this.height, -dx, -dy, this.width, this.height);
    // 可见区域的宽高比用于取景距离
    this.visibleAspect = Math.max(this.width - this.insets.left - this.insets.right, 200) / Math.max(this.height - this.insets.top - this.insets.bottom, 200);
    this.dirty = true;
  }
  private visibleAspect = 1;

  private resize() {
    this.width = Math.max(this.container.clientWidth, 1);
    this.height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = this.width / this.height;
    this.renderer.setSize(this.width, this.height, false);
    this.applyViewOffset();
    this.dirty = true;
  }

  // ======================================================== 加载

  async loadAll() {
    try {
      setState({ loadingStage: tr("正在读取模型清单", "Reading model manifest"), loadingProgress: 0.02 });
      this.manifest = await (await fetch(`${MODEL_BASE}manifest.json`)).json();
      this.correctLandmarks();
      setState({ loadingStage: tr("正在加载牙列与颌骨", "Loading dentition and jaws"), loadingProgress: 0.05 });
      await this.loadFile("core.glb", (p) => setState({ loadingProgress: 0.05 + p * 0.85 }));
      this.refreshAll();
      // 开场：从远处飞入
      this.applyView(getState().view ?? "three-quarter", false);
      const endPos = this.camera.position.clone();
      const endTarget = this.controls.target.clone();
      this.camera.position.copy(endTarget).add(endPos.clone().sub(endTarget).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.9).multiplyScalar(2.2));
      this.flyTo(endPos, endTarget, 2.2);
      setState({ ready: true, loadingStage: null, loadingProgress: 1 });
      // 后台继续加载背景结构与神经血管
      await this.loadFile("context.glb");
      await this.loadFile("neurovascular.glb");
      this.refreshAll();
      // 空闲时预取常用的下颌第一磨牙
      (window.requestIdleCallback ?? setTimeout)(() => this.ensureTooth(36));
    } catch (err) {
      console.error(err);
      setState({ loadError: tr(`模型加载失败：${(err as Error).message}`, `Failed to load the model: ${(err as Error).message}`), loadingStage: null });
    }
  }

  /**
   * 修正：原 manifest 的“眶下孔”取的是上颌神经与眶下神经路径的交接点（位于上颌骨后部），
   * 而眶下孔应在上颌骨前面、眶下缘下方。这里改用眶下神经各终支（睑支、鼻支、上唇支）
   * 的共同起点——即神经出孔处——作为眶下孔位置。
   */
  private correctLandmarks() {
    const paths = (this.manifest as unknown as { paths?: Record<string, [number, number, number][][]> }).paths;
    for (const side of ["left", "right"] as const) {
      const segs = paths?.[`infraorbital-nerve-${side}`];
      if (!segs || segs.length < 3) continue;
      const starts = segs.slice(1).map((seg) => seg[0]);
      const avg = [0, 1, 2].map((i) => starts.reduce((a, p) => a + p[i], 0) / starts.length) as [number, number, number];
      this.manifest.landmarks[`infraorbital-foramen-${side}`] = avg;
    }
  }

  /** 加载一个 GLB；网络失败时自动重试（共 3 次，间隔递增） */
  private loadFile(file: string, onProgress?: (p: number) => void): Promise<void> {
    if (this.loadedFiles.has(file)) return Promise.resolve();
    const pending = this.loadingFiles.get(file);
    if (pending) return pending;
    const attempt = (n: number): Promise<void> =>
      this.loadFileOnce(file, onProgress).catch((err) => {
        if (n >= 2) throw err;
        console.warn(`加载 ${file} 失败，${n + 1} 秒后重试`, err);
        return new Promise<void>((r) => setTimeout(r, (n + 1) * 1000)).then(() => attempt(n + 1));
      });
    const p = attempt(0).finally(() => this.loadingFiles.delete(file));
    this.loadingFiles.set(file, p);
    return p;
  }

  private loadFileOnce(file: string, onProgress?: (p: number) => void): Promise<void> {
    return this.loader
      .loadAsync(MODEL_BASE + file, (e) => {
        const total = e.total || this.manifest?.files?.[file] || 0;
        if (total) onProgress?.(Math.min(e.loaded / total, 1));
      })
      .then((gltf) => {
        gltf.scene.updateMatrixWorld(true);
        const meshes: THREE.Mesh[] = [];
        gltf.scene.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
        });
        for (const m of meshes) this.register(m);
        const smooth = this.effectiveQuality() === "smooth";
        const fresh = meshes.filter((m) => this.entries.get(m.name)?.mesh === m);
        for (const m of fresh) this.applyMaterialQuality(m.material as THREE.MeshPhysicalMaterial, smooth);
        this.loadedFiles.add(file);
        this.dirty = true;
        return this.warmUp(fresh);
      });
  }

  private register(mesh: THREE.Mesh) {
    const key = mesh.name;
    if (!this.manifest.meshes[key] || this.entries.has(key)) return;
    const category = categoryOf(key);
    const rig = rigOf(key);
    const fdi = fdiOfKey(key);
    // 体素重建的牙体内部组织：在 Worker 中平滑掉阶梯纹，完成后替换几何
    if (/^(dentin-coronal|dentin-radicular|cementum|pdl|pulp-chamber)-\d\d$/.test(key)) {
      void smoothInWorker(mesh.geometry, key.startsWith("pulp") ? 10 : 28).then((g) => {
        const old = mesh.geometry;
        mesh.geometry = g;
        old.disposeBoundsTree?.();
        old.dispose();
        this.dirty = true;
        (window.requestIdleCallback ?? setTimeout)(() => g.computeBoundsTree());
      });
    }
    const geo = mesh.geometry;
    if (!geo.getAttribute("normal")) geo.computeVertexNormals();

    if (rig === "blend") {
      if (geo.getAttribute("color")) weightsFromVertexColor(mesh);
      else this.computeMuscleWeights(mesh);
    }
    // 小网格直接建 BVH；大网格空闲时再建
    const build = () => {
      if (!geo.boundsTree) geo.computeBoundsTree();
    };
    if (geo.index && geo.index.count < 60000) build();
    else (window.requestIdleCallback ?? setTimeout)(build);

    let color: string | undefined;
    if (key.startsWith("frontal-sinus") || key.startsWith("sphenoidal-sinus")) color = "#8cc8ee";
    if (key.startsWith("mandibular-canal")) color = "#f5d77a";
    const mat = createTissueMaterial(category, { blend: rig === "blend", colorOverride: color });
    // 冠部与根部牙本质在颈部有一个重合的分界面；让冠部略胜出，剖切俯视时该分界面显示为断面色而非闪烁的亮斑
    if (key.startsWith("dentin-coronal")) {
      mat.polygonOffsetFactor = -3;
      mat.polygonOffsetUnits = -6;
    }
    mat.transparent = false;
    mat.opacity = 0;
    mesh.material = mat;
    mesh.visible = false;
    mesh.frustumCulled = rig !== "blend";
    mesh.castShadow = mesh.receiveShadow = false;
    if (category === "sinus") mesh.renderOrder = 2;

    // 挂到对应的运动层级（保持世界坐标）
    let holder: THREE.Object3D = mesh;
    if (fdi) {
      const toothGroup = this.toothGroup(fdi);
      holder = new THREE.Group();
      holder.name = `holder-${key}`;
      toothGroup.add(holder);
      holder.attach(mesh);
    } else {
      this.groups[rig].attach(mesh);
    }

    const entry: Entry = {
      key,
      mesh,
      holder,
      mat,
      category,
      rig,
      fdi,
      base: baseIdOf(key),
      opacity: 0,
      target: 0,
      highlight: 0,
      hTarget: 0,
      hColor: HIGHLIGHT_SELECT,
      anchor: this.anchorOf(key, mesh, holder),
    };
    this.entries.set(key, entry);
    if (LOD_RATIO[category] && (geo.index?.count ?? 0) / 3 > 6000) this.queueLod(entry);
  }

  // ======================================================== 简化几何（流畅模式）

  private lodQueue: Entry[] = [];
  private lodRunning = false;

  private queueLod(e: Entry) {
    this.lodQueue.push(e);
    if (this.lodRunning) return;
    this.lodRunning = true;
    void MeshoptSimplifier.ready.then(() => this.drainLod());
  }

  /** 空闲时逐个简化，每次只处理一个网格，避免长任务 */
  private drainLod() {
    const e = this.lodQueue.shift();
    if (!e) {
      this.lodRunning = false;
      return;
    }
    try {
      this.buildLod(e);
    } catch (err) {
      console.warn(`简化 ${e.key} 失败，保留原始几何`, err);
    }
    (window.requestIdleCallback ?? setTimeout)(() => this.drainLod());
  }

  private buildLod(e: Entry) {
    const geo = e.mesh.geometry;
    const index = geo.index;
    if (!index) return;
    const pos = geo.getAttribute("position");
    const positions = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      positions[i * 3] = pos.getX(i);
      positions[i * 3 + 1] = pos.getY(i);
      positions[i * 3 + 2] = pos.getZ(i);
    }
    const indices = new Uint32Array(index.array);
    const ratio = LOD_RATIO[e.category]!;
    const target = Math.max(3, Math.floor((indices.length * ratio) / 3) * 3);
    const [lod] = MeshoptSimplifier.simplify(indices, positions, 3, target, 0.01);
    if (lod.length >= indices.length * 0.9) return; // 简化收益太小
    const g = new THREE.BufferGeometry();
    for (const [name, attr] of Object.entries(geo.attributes)) g.setAttribute(name, attr);
    g.setIndex(new THREE.BufferAttribute(lod, 1));
    g.boundingBox = geo.boundingBox;
    g.boundingSphere = geo.boundingSphere;
    e.fullGeo = geo;
    e.lodGeo = g;
    if (this.effectiveQuality() === "smooth") this.useLod(e, true);
  }

  private useLod(e: Entry, on: boolean) {
    const g = on ? e.lodGeo : e.fullGeo;
    if (!g || e.mesh.geometry === g) return;
    e.mesh.geometry = g;
    if (!g.boundsTree) (window.requestIdleCallback ?? setTimeout)(() => g.boundsTree || g.computeBoundsTree());
    this.dirty = true;
  }

  private toothGroup(fdi: number) {
    let grp = this.toothGroups.get(fdi);
    if (!grp) {
      grp = new THREE.Group();
      grp.name = `tooth-group-${fdi}`;
      (fdi < 30 ? this.groups.upperTeeth : this.groups.lowerTeeth).add(grp);
      this.toothGroups.set(fdi, grp);
    }
    return grp;
  }

  /** 标签锚点：牙齿取牙冠颊侧；管状结构取路径中点；其余取包围盒中心 */
  private anchorOf(key: string, mesh: THREE.Mesh, holder: THREE.Object3D): THREE.Vector3 {
    const fdi = fdiOfKey(key);
    const tooth = fdi ? this.manifest.teeth[String(fdi)] : null;
    holder.updateWorldMatrix(true, false);
    if (tooth && key.startsWith("tooth-")) {
      const cervical = new THREE.Vector3(...(tooth.landmarks["cervical-line"] ?? tooth.frame.origin));
      const axis = new THREE.Vector3(...tooth.frame.axis);
      const buccal = new THREE.Vector3(...tooth.frame.buccal);
      return holder.worldToLocal(cervical.addScaledVector(axis, 0.55).addScaledVector(buccal, 0.32));
    }
    const pos = mesh.geometry.getAttribute("position");
    mesh.updateWorldMatrix(true, false);
    const cat = categoryOf(key);
    if (cat === "nerves" || cat === "arteries" || cat === "veins") {
      const v = new THREE.Vector3().fromBufferAttribute(pos, Math.floor(pos.count * 0.5)).applyMatrix4(mesh.matrixWorld);
      return holder.worldToLocal(v);
    }
    mesh.geometry.computeBoundingBox();
    const c = mesh.geometry.boundingBox!.getCenter(new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
    // 把中心推到表面：取最近的顶点
    let best = 0;
    let bestD = Infinity;
    const v = new THREE.Vector3();
    const step = Math.max(1, Math.floor(pos.count / 4000));
    for (let i = 0; i < pos.count; i += step) {
      v.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
      const d = v.distanceToSquared(c);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return holder.worldToLocal(v.fromBufferAttribute(pos, best).applyMatrix4(mesh.matrixWorld));
  }

  private weightField: JawWeightField | null = null;
  private computeMuscleWeights(mesh: THREE.Mesh) {
    if (!this.weightField) {
      const lower = ["mandible-body", "mandibular-condyle-left", "mandibular-condyle-right", "mandibular-alveolar-process"]
        .map((k) => this.entries.get(k)?.mesh)
        .filter(Boolean) as THREE.Mesh[];
      const upperKeys = [
        "maxilla-left",
        "maxilla-right",
        "zygomatic-bone-left",
        "zygomatic-bone-right",
        "temporal-bone-left",
        "temporal-bone-right",
        "sphenoid-bone",
        "palatine-bone-left",
        "palatine-bone-right",
        "frontal-bone",
        "parietal-bone-left",
        "parietal-bone-right",
      ];
      const upper = upperKeys.map((k) => this.entries.get(k)?.mesh).filter(Boolean) as THREE.Mesh[];
      this.weightField = new JawWeightField(worldPoints(lower, 2), worldPoints(upper, 2));
    }
    this.weightField.apply(mesh);
  }

  /** 按需加载单牙内部组织 */
  ensureTooth(fdi: number): Promise<void> {
    const t = this.manifest?.teeth[String(fdi)];
    if (!t) return Promise.resolve();
    return this.loadFile(t.asset)
      .then(() => this.refreshAll())
      .catch((err) => {
        console.error(err);
        setState({ teethError: tr(`牙齿 ${fdi} 的内部结构加载失败，请检查网络后重试`, `Failed to load internal structures of tooth ${fdi}. Check your connection and retry.`) });
      });
  }

  private allTeethJob: Promise<void> | null = null;

  /** 加载全部 32 颗牙的内部结构（并发 4 个；单颗失败不影响其余，结束后报告失败数） */
  ensureAllTeeth(): Promise<void> {
    if (this.allTeethJob) return this.allTeethJob;
    const assetOf = (f: number) => this.manifest.teeth[String(f)].asset;
    const missing = ALL_FDI.filter((f) => !this.loadedFiles.has(assetOf(f)));
    if (!missing.length) return Promise.resolve();
    const total = ALL_FDI.length;
    let done = total - missing.length;
    const failed: number[] = [];
    setState({ teethLoading: { done, total }, teethError: null });
    const queue = [...missing];
    const worker = async () => {
      while (queue.length) {
        const f = queue.shift()!;
        try {
          await this.loadFile(assetOf(f));
          done++;
          setState({ teethLoading: { done, total } });
          this.refreshVisibility();
        } catch (err) {
          console.error(`牙齿 ${f} 的内部结构加载失败`, err);
          failed.push(f);
        }
      }
    };
    this.allTeethJob = Promise.all([worker(), worker(), worker(), worker()]).then(() => {
      this.allTeethJob = null;
      setState({
        teethLoading: null,
        teethError: failed.length
          ? tr(
              `有 ${failed.length} 颗牙（${failed.sort().join("、")}）的内部结构加载失败，请检查网络后重试`,
              `Internal structures of ${failed.length} teeth (${failed.sort().join(", ")}) failed to load. Check your connection and retry.`,
            )
          : null,
      });
      this.refreshAll();
    });
    return this.allTeethJob;
  }

  private toothLayersLoaded(fdi: number) {
    return this.loadedFiles.has(this.manifest.teeth[String(fdi)].asset);
  }

  // ======================================================== 状态 → 场景

  private onState(s: AppState, prev: AppState) {
    if (!this.manifest) return;
    let vis = false;
    if (
      s.categories !== prev.categories ||
      s.hidden !== prev.hidden ||
      s.ghosted !== prev.ghosted ||
      s.isolate !== prev.isolate ||
      s.dissectFdi !== prev.dissectFdi ||
      s.showContext !== prev.showContext ||
      s.archFilter !== prev.archFilter ||
      s.quizHighlight !== prev.quizHighlight
    )
      vis = true;
    if (vis) {
      this.refreshVisibility();
      this.setHover(null);
    }

    // 总览中打开了牙体内部组织 → 需要加载全部 32 颗牙的内部资源
    if (s.categories !== prev.categories && s.dissectFdi === null) {
      const active = INTERNAL_CATEGORIES.some((c) => s.categories[c] !== "off");
      if (active) void this.ensureAllTeeth();
    }
    if (s.dissectFdi !== prev.dissectFdi) {
      if (s.dissectFdi) {
        const fdi = s.dissectFdi;
        void this.ensureTooth(fdi).then(() => {
          if (getState().dissectFdi === fdi) this.frameTooth(fdi, true);
        });
      }
      this.refreshSection();
    }
    if (s.selected !== prev.selected || s.quizHighlight !== prev.quizHighlight || s.dissectFdi !== prev.dissectFdi)
      this.refreshHighlight();
    if (s.jawOpen !== prev.jawOpen) this.tweenJaw("open", s.jawOpen);
    if (s.explode !== prev.explode) this.tweenJaw("explode", s.explode);
    if (s.toothExplode !== prev.toothExplode) {
      const fdi = s.dissectFdi;
      this.tweenJaw("tooth", s.toothExplode, () => {
        if (fdi && fdi === getState().dissectFdi && !getState().section.enabled) this.frameTooth(fdi, false);
      });
    }
    if (s.section !== prev.section) {
      this.refreshSection();
      const sec = s.section;
      const p = prev.section;
      if (sec.enabled && (!p.enabled || sec.axis !== p.axis || sec.flip !== p.flip)) this.lookAtSection();
    }
    if (s.autoRotate !== prev.autoRotate) this.controls.autoRotate = s.autoRotate;
    if (s.quality !== prev.quality) this.applyQuality();
    if (
      s.labels !== prev.labels ||
      s.numbering !== prev.numbering ||
      s.lang !== prev.lang ||
      s.selected !== prev.selected ||
      s.dissectFdi !== prev.dissectFdi ||
      vis
    )
      this.refreshLabels();
    if (s.cameraRequest !== prev.cameraRequest && s.cameraRequest) {
      const r = s.cameraRequest;
      if (r.kind === "view" && r.preset) this.applyView(r.preset, true);
      else if (r.kind === "reset") this.applyView("three-quarter", true);
      else if (r.kind === "focus" && r.target) this.focusOn(r.target);
    }
    this.dirty = true;
  }

  private refreshAll() {
    this.refreshVisibility();
    this.refreshHighlight();
    this.refreshSection();
    this.refreshLabels();
    this.applyJawTransforms();
  }

  /** 唯一决定每个网格显示程度的函数 */
  private resolve(e: Entry, s: AppState): number {
    const cats = s.categories;
    // 单牙解剖
    if (s.dissectFdi !== null) {
      if (e.fdi === s.dissectFdi && e.category !== "teeth") {
        const v = cats[e.category];
        return v === "on" ? 1 : v === "ghost" ? GHOST : 0;
      }
      if (e.fdi === s.dissectFdi && e.category === "teeth") return this.toothLayersLoaded(e.fdi) ? 0 : 1;
      if (!s.showContext) return 0;
      if (e.category === "teeth") return FAINT * 1.4;
      if (e.category === "gingiva" || e.category === "alveolar") return FAINT;
      return 0;
    }
    // 只看一个牙弓
    if (s.archFilter) {
      const lower = e.rig.startsWith("lower") || e.rig === "hyoid";
      const upper = e.rig.startsWith("upper") || e.rig === "disc";
      if (s.archFilter === "upper" && lower) return 0;
      if (s.archFilter === "lower" && (upper || e.category === "skull" || e.category === "muscles")) return 0;
    }
    if (s.isolate) {
      const iso = s.isolate;
      const isoFdi = fdiOfKey(iso);
      if (e.key === iso) return 1;
      if (iso.startsWith("tooth-") && isoFdi === e.fdi) return this.layerOrShell(e, s);
      return 0;
    }
    if (s.hidden.includes(e.key)) return 0;
    if (e.fdi && s.hidden.includes(`tooth-${e.fdi}`)) return 0;

    let v: number;
    if (e.category === "teeth" || INTERNAL_CATEGORIES.includes(e.category)) v = this.layerOrShell(e, s);
    else {
      const c = cats[e.category];
      v = c === "on" ? 1 : c === "ghost" ? GHOST : 0;
    }
    if (v === 0) return 0;
    if (s.ghosted.includes(e.key) || (e.fdi && s.ghosted.includes(`tooth-${e.fdi}`))) v = Math.min(v, GHOST);

    // 神经血管可见时，骨骼自动透视，否则看不到骨内走行
    const neuro = cats.nerves !== "off" || cats.arteries !== "off" || cats.veins !== "off";
    if (neuro && v === 1 && (e.category === "maxilla" || e.category === "mandible" || e.category === "alveolar" || e.category === "skull")) {
      if (!e.key.startsWith("mandibular-canal") && !e.key.startsWith("mandibular-condyle")) v = 0.3;
    }
    // 测验高亮：目标之外的结构降为半透明，让目标无论什么颜色都一目了然
    if (s.quizHighlight && v > GHOST) {
      const q = s.quizHighlight;
      const isTarget = e.key === q || (q.startsWith("tooth-") && fdiOfKey(q) === e.fdi);
      if (!isTarget) v = Math.min(v, 0.32);
    }
    if (e.category === "sinus" && v === 1) v = 0.5;
    if (e.key.startsWith("mandibular-canal") && v === 1) v = 0.35;
    return v;
  }

  /** 牙齿外形与内部组织互斥：内部组织激活且已加载时，外形隐藏 */
  private layerOrShell(e: Entry, s: AppState): number {
    const cats = s.categories;
    const internalActive = INTERNAL_CATEGORIES.some((c) => cats[c] !== "off");
    if (e.category === "teeth") {
      if (cats.teeth === "off") return 0;
      if (internalActive && e.fdi && this.toothLayersLoaded(e.fdi)) return 0;
      return cats.teeth === "ghost" ? GHOST : 1;
    }
    if (cats.teeth === "off" && !internalActive) return 0;
    const c = cats[e.category];
    return c === "on" ? 1 : c === "ghost" ? GHOST : 0;
  }

  private refreshVisibility() {
    const s = getState();
    for (const e of this.entries.values()) e.target = this.resolve(e, s);
    this.busy(0.6);
  }

  private refreshHighlight() {
    const s = getState();
    const sel = s.selected;
    const selFdi = sel ? fdiOfKey(sel) : null;
    for (const e of this.entries.values()) {
      let h = 0;
      let color = HIGHLIGHT_SELECT;
      if (sel) {
        if (e.key === sel) h = 1;
        else if (sel.startsWith("tooth-") && selFdi === e.fdi && s.dissectFdi === null) h = 1;
      }
      if (s.quizHighlight && (e.key === s.quizHighlight || (s.quizHighlight.startsWith("tooth-") && fdiOfKey(s.quizHighlight) === e.fdi))) {
        h = 2.2;
        color = HIGHLIGHT_QUIZ;
      }
      if (this.hoverKey === e.key && h === 0) h = 0.45;
      // 单牙解剖时整颗牙都“被选中”，不必全部发光
      if (s.dissectFdi !== null && e.fdi === s.dissectFdi && e.key !== sel) h = this.hoverKey === e.key ? 0.45 : 0;
      e.hTarget = h * 0.55;
      e.hColor = color;
    }
    this.busy(0.5);
  }

  private refreshSection() {
    const s = getState();
    const sec = s.section;
    const enabled = sec.enabled;
    if (enabled) {
      const { normal, point } = this.sectionGeometry();
      this.clipPlane.setFromNormalAndCoplanarPoint(normal, point);
      const n = this.clipPlane.normal;
      sharedLesion.uClipW.value.set(n.x, n.y, n.z, this.clipPlane.constant);
    }
    for (const e of this.entries.values()) {
      const m = e.mat;
      const apply = enabled;
      m.clippingPlanes = apply ? [this.clipPlane] : null;
      m.side = this.wantDoubleSide(e) && e.target >= 0.99 ? THREE.DoubleSide : THREE.FrontSide;
      uniformsOf(m).uCutEnabled.value = apply ? 1 : 0;
    }
    if (this.lesion) (this.lesion.cavity.material as THREE.Material).clippingPlanes = enabled ? [this.clipPlane] : null;
    this.dirty = true;
  }

  /** 剖切平面：总览以颌面部为中心；单牙解剖以牙体坐标系为准 */
  private sectionGeometry() {
    const s = getState();
    const sec = s.section;
    const sign = sec.flip ? -1 : 1;
    if (s.dissectFdi !== null) {
      const t = this.manifest.teeth[String(s.dissectFdi)];
      const grp = this.toothGroup(s.dissectFdi);
      grp.updateWorldMatrix(true, false);
      const axis = new THREE.Vector3(...t.frame.axis);
      const mesial = new THREE.Vector3(...t.frame.mesial);
      const buccal = new THREE.Vector3(...t.frame.buccal);
      const center = this.toothCenter(s.dissectFdi);
      // sagittal：近远中向剖面（法线朝颊侧）；coronal：颊舌向剖面（法线朝近中）；axial：水平剖面（法线沿牙长轴）
      const normal = sec.axis === "sagittal" ? buccal : sec.axis === "coronal" ? mesial : axis.clone();
      const extent = sec.axis === "axial" ? 1.3 : 0.55;
      const point = center.clone().addScaledVector(normal, sec.offset * extent);
      return { normal: normal.clone().multiplyScalar(-sign).normalize(), point };
    }
    const center = new THREE.Vector3(0, 0.8, -1.2);
    const half = new THREE.Vector3(5, 5.5, 5);
    const normal =
      sec.axis === "sagittal" ? new THREE.Vector3(-1, 0, 0) : sec.axis === "coronal" ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, -1, 0);
    const axisIdx = sec.axis === "sagittal" ? "x" : sec.axis === "coronal" ? "z" : "y";
    const point = center.clone();
    point[axisIdx] += sec.offset * half[axisIdx];
    return { normal: normal.multiplyScalar(sign), point };
  }

  /** 开启剖切时把相机转到正对断面的方向 */
  private lookAtSection() {
    const { normal, point } = this.sectionGeometry();
    const s = getState();
    const target = s.dissectFdi !== null ? this.toothCenter(s.dissectFdi) : DENTITION_CENTER.clone();
    if (s.dissectFdi === null) target.copy(point).setY(DENTITION_CENTER.y);
    const dist = s.dissectFdi !== null ? this.toothFrameDistance(s.dissectFdi) : this.camera.position.distanceTo(this.controls.target);
    // 保留的一侧在法线正方向，断面朝向负方向 → 相机放在负方向
    const pos = target.clone().addScaledVector(normal, -dist);
    if (s.dissectFdi === null) pos.y += dist * 0.12;
    this.flyTo(pos, target, 0.9);
  }

  private toothCenter(fdi: number) {
    const t = this.manifest.teeth[String(fdi)];
    const grp = this.toothGroup(fdi);
    grp.updateWorldMatrix(true, false);
    const shell = this.entries.get(`tooth-${fdi}`);
    if (shell) {
      shell.mesh.geometry.computeBoundingBox();
      shell.mesh.updateWorldMatrix(true, false);
      return shell.mesh.geometry.boundingBox!.getCenter(new THREE.Vector3()).applyMatrix4(shell.mesh.matrixWorld);
    }
    return grp.localToWorld(new THREE.Vector3(...t.frame.origin));
  }

  // ======================================================== 病变演示

  private lesion: {
    fdi: number;
    frame: LesionFrame;
    surface: THREE.Vector3;
    pulpCenter: THREE.Vector3;
    apices: THREE.Vector3[];
    spheres: THREE.Mesh[];
    cavity: THREE.Mesh;
    points: THREE.Points;
    seeds: Float32Array;
    params: LesionParams | null;
    showBacteria: boolean;
  } | null = null;

  /**
   * 开始病变演示：加载该牙内部结构，沿病损轴实测釉质厚度与到髓室顶的距离，
   * 返回病损坐标系与“起点 → 髓腔 → 最远根尖”的路径长度。
   */
  async startLesion(fdi: number): Promise<{ frame: LesionFrame; apexDist: number }> {
    this.stopLesion();
    await this.ensureTooth(fdi);
    const t = this.manifest.teeth[String(fdi)];
    this.root.updateMatrixWorld(true);
    const axis = new THREE.Vector3(...t.frame.axis).normalize();
    const dir = axis.clone().negate();
    const fossa = t.surfaceFeatures?.find((f) => f.key === "central-fossa");
    const start = fossa ? new THREE.Vector3(...fossa.anchor) : new THREE.Vector3(...t.frame.origin).addScaledVector(axis, 0.6);
    const mesh = (k: string) => this.entries.get(`${k}-${fdi}`)?.mesh;
    const ray = new THREE.Raycaster(start.clone().addScaledVector(axis, 1.2), dir, 0, 4);
    const firstHit = (m?: THREE.Mesh) => (m ? ray.intersectObject(m, false)[0]?.point ?? null : null);
    const surface = firstHit(mesh("enamel")) ?? start;
    const dentinTop = firstHit(mesh("dentin-coronal"));
    const pulpTop = firstHit(mesh("pulp-chamber"));
    const enamel = dentinTop ? Math.max(surface.distanceTo(dentinTop), 0.08) : 0.2;
    const toPulp = pulpTop ? Math.max(surface.distanceTo(pulpTop), enamel + 0.1) : enamel + 0.35;

    const horns = Object.entries(t.landmarks).filter(([k]) => k.startsWith("pulp-horn")).map(([, v]) => new THREE.Vector3(...v));
    const pulpCenter = horns.length
      ? horns.reduce((a, b) => a.add(b), new THREE.Vector3()).multiplyScalar(1 / horns.length).addScaledVector(dir, 0.1)
      : surface.clone().addScaledVector(dir, toPulp + 0.1);
    const apices = Object.entries(t.landmarks).filter(([k]) => k.startsWith("apical-foramen")).map(([, v]) => new THREE.Vector3(...v));
    const apexDist = surface.distanceTo(pulpCenter) + Math.max(0.3, ...apices.map((a) => a.distanceTo(pulpCenter)));

    // 根尖周病变区：每个根尖孔一个半透明球体
    const grp = this.toothGroup(fdi);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: "#e0a33a",
      emissive: "#7a3200",
      emissiveIntensity: 0.35,
      roughness: 0.55,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const spheres = apices.map((a) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 20), sphereMat);
      s.position.copy(grp.worldToLocal(a.clone()));
      s.scale.setScalar(0.001);
      s.visible = false;
      s.renderOrder = 3;
      grp.add(s);
      return s;
    });

    // 细菌粒子（示意）：沿 起点 → 髓腔 → 某一根尖 的折线运动
    const N = 220;
    const seeds = new Float32Array(N * 5);
    for (let i = 0; i < N; i++) {
      seeds[i * 5] = Math.random(); // 相位
      seeds[i * 5 + 1] = Math.floor(Math.random() * Math.max(apices.length, 1)); // 去往哪个根尖
      seeds[i * 5 + 2] = Math.random() - 0.5;
      seeds[i * 5 + 3] = Math.random() - 0.5;
      seeds[i * 5 + 4] = Math.random() - 0.5;
    }
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    const points = new THREE.Points(
      pg,
      new THREE.PointsMaterial({ color: "#7c3aed", size: 0.03, sizeAttenuation: true, transparent: true, opacity: 0.8, depthTest: false, map: dotTexture() }),
    );
    points.frustumCulled = false;
    points.renderOrder = 20;
    points.visible = false;
    this.scene.add(points);

    const cavity = createCavityMesh();
    this.scene.add(cavity);

    const frame: LesionFrame = { center: surface.toArray() as [number, number, number], dir: dir.toArray() as [number, number, number], enamel, toPulp };
    this.lesion = { fdi, frame, surface, pulpCenter, apices, spheres, cavity, points, seeds, params: null, showBacteria: true };
    // 病损只有 1–3 mm，允许镜头比平时更近
    this.controls.minDistance = 1.1;
    sharedLesion.uLesionC.value.copy(surface);
    sharedLesion.uLesionDir.value.copy(dir);
    for (const e of this.entries.values()) {
      const u = uniformsOf(e.mat);
      u.uLesionOn.value = e.fdi === fdi ? 1 : 0;
      u.uFlatCut.value = e.fdi === fdi && e.key.startsWith("dentin") ? 1 : 0;
      // 健康釉质略带象牙色、半透明感；默认的近白色会让白垩斑（不透明的白色）几乎看不出来
      // 断面同理：釉质断面压暗一些，白色的脱矿区才显得出来
      if (e.fdi === fdi && e.key.startsWith("enamel")) {
        (e.mat as THREE.MeshPhysicalMaterial).color.set("#e6dcc4");
        e.mat.userData.cutColor ??= u.uCutColor.value.clone();
        u.uCutColor.value.set("#d6ccb6");
      }
    }
    this.refreshSection();
    this.dirty = true;
    return { frame, apexDist };
  }

  setLesion(p: LesionParams) {
    const L = this.lesion;
    if (!L) return;
    L.params = p;
    sharedLesion.uLesionP.value.set(p.depth, p.r0, p.r1, L.frame.enamel);
    sharedLesion.uLesionS.value.set(p.demin, p.cavity, p.brown, 0);
    L.cavity.visible = p.cavity > 0.002;
    for (const s of L.spheres) {
      s.visible = p.periapical > 0.005;
      s.scale.setScalar(Math.max(p.periapical, 0.001));
    }
    this.dirty = true;
  }

  setLesionBacteria(show: boolean) {
    if (this.lesion) this.lesion.showBacteria = show;
    this.dirty = true;
  }

  /** 病变演示取景：从剖面一侧、略偏咬合面观察，同时看到咬合面病损与断面 */
  frameLesion(focus: "crown" | "tooth" = "tooth") {
    const L = this.lesion;
    if (!L) return;
    const t = this.manifest.teeth[String(L.fdi)];
    const axis = new THREE.Vector3(...t.frame.axis).normalize();
    // 整牙入画（咬合面病损到根尖都看得到），略偏冠方；视线大致正对剖面、稍从咬合面方向俯视
    const apex = L.apices.reduce((a, b) => (b.distanceTo(L.surface) > a.distanceTo(L.surface) ? b : a), L.pulpCenter);
    const len = L.surface.distanceTo(apex);
    // crown：早期病损在牙面与釉质内，拉近牙冠、多俯视一些咬合面；tooth：牙髓/根尖阶段看整牙
    const crown = focus === "crown";
    const target = crown ? L.surface.clone().lerp(L.pulpCenter, 0.42) : L.surface.clone().lerp(apex, 0.4);
    const side = getState().section.enabled ? this.clipPlane.normal.clone().negate() : new THREE.Vector3(...t.frame.buccal);
    const dir = side.multiplyScalar(crown ? 0.72 : 0.93).addScaledVector(axis, crown ? 0.75 : 0.36).normalize();
    const dist = (len * (crown ? 0.31 : 0.78)) / Math.tan((FOV * Math.PI) / 360);
    this.flyTo(target.clone().addScaledVector(dir, dist * Math.max(1, 0.95 / this.visibleAspect)), target, 1);
  }

  /** 让剖面（单牙解剖的近远中向剖面）正好穿过病损中心 */
  lesionSectionOffset(): number {
    const L = this.lesion;
    if (!L) return 0;
    const t = this.manifest.teeth[String(L.fdi)];
    const buccal = new THREE.Vector3(...t.frame.buccal);
    return THREE.MathUtils.clamp(L.surface.clone().sub(this.toothCenter(L.fdi)).dot(buccal) / 0.55, -1, 1);
  }

  stopLesion() {
    const L = this.lesion;
    if (!L) return;
    for (const s of L.spheres) {
      s.removeFromParent();
      s.geometry.dispose();
    }
    (L.spheres[0]?.material as THREE.Material | undefined)?.dispose();
    L.cavity.removeFromParent();
    L.cavity.geometry.dispose();
    (L.cavity.material as THREE.Material).dispose();
    L.points.removeFromParent();
    L.points.geometry.dispose();
    (L.points.material as THREE.Material).dispose();
    for (const e of this.entries.values()) {
      const u = uniformsOf(e.mat);
      u.uLesionOn.value = 0;
      u.uFlatCut.value = 0;
      u.uTint.value.set(0, 0, 0, 0);
      (e.mat as THREE.MeshPhysicalMaterial).color.copy(e.mat.userData.baseColor);
      if (e.mat.userData.cutColor) u.uCutColor.value.copy(e.mat.userData.cutColor);
    }
    sharedLesion.uLesionS.value.set(0, 0, 0, 0);
    this.controls.minDistance = 2.5;
    this.lesion = null;
    this.refreshSection();
    this.dirty = true;
  }

  /** 每帧：牙髓充血的搏动、坏死着色、细菌粒子运动 */
  private updateLesionFrame(now: number) {
    const L = this.lesion!;
    const p = L.params;
    if (!p) return;
    const pulse = 0.5 + 0.5 * Math.sin(now / 180);
    for (const e of this.entries.values()) {
      if (e.fdi !== L.fdi || (e.category !== "pulp" && e.category !== "canals")) continue;
      const tint = uniformsOf(e.mat).uTint.value;
      if (p.pulpNecrosis > 0.01) tint.set(0.26, 0.22, 0.17, 0.85 * p.pulpNecrosis);
      else tint.set(0.95, 0.06, 0.08, p.pulpInflam * (0.35 + 0.3 * pulse));
    }
    const pts = L.points;
    pts.visible = L.showBacteria && p.bacteria > 0.01;
    if (pts.visible) {
      const pos = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
      const n = pos.count;
      const seg1 = L.surface.distanceTo(L.pulpCenter);
      const v = new THREE.Vector3();
      for (let i = 0; i < n; i++) {
        const s = L.seeds;
        const phase = (s[i * 5] + now / 9000) % 1;
        const d = phase * p.bacteria;
        if (d <= seg1 || !L.apices.length) v.copy(L.surface).lerp(L.pulpCenter, Math.min(d / seg1, 1));
        else {
          const apex = L.apices[s[i * 5 + 1] % L.apices.length];
          const seg2 = Math.max(L.pulpCenter.distanceTo(apex), 1e-3);
          v.copy(L.pulpCenter).lerp(apex, Math.min((d - seg1) / seg2, 1));
        }
        // 前沿附近散开，模拟沿牙本质小管/根管的弥散
        const spread = 0.025 + 0.06 * (1 - phase);
        pos.setXYZ(i, v.x + s[i * 5 + 2] * spread, v.y + s[i * 5 + 3] * spread, v.z + s[i * 5 + 4] * spread);
      }
      pos.needsUpdate = true;
    }
    this.dirty = true;
  }

  // ======================================================== 颌骨运动与分离

  private tweenJaw(which: "open" | "explode" | "tooth", value: number, onComplete?: () => void) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(this.jaw, {
      [which]: value,
      duration: reduce ? 0 : 0.9,
      ease: "power2.inOut",
      overwrite: "auto",
      onUpdate: () => {
        this.applyJawTransforms();
        this.dirty = true;
      },
      onComplete,
    });
    this.busy(1);
  }

  private applyJawTransforms() {
    if (!this.manifest) return;
    const { jaw, upper, lower } = this.manifest.explode;
    const t = this.jaw.explode;
    const G = this.groups;
    G.upperBone.position.y = jaw * t;
    G.upperGum.position.y = (jaw - upper.gingiva) * t;
    G.upperTeeth.position.y = (jaw - upper.teeth) * t;
    G.lowerBone.position.y = -jaw * t;
    G.lowerGum.position.y = -(jaw - lower.gingiva) * t;
    G.lowerTeeth.position.y = -(jaw - lower.teeth) * t;
    G.hyoid.position.y = -jaw * t;

    // 张口：绕髁突附近的枢轴旋转，同时髁突向前下滑动
    const m = this.manifest.jawMotion;
    const o = this.jaw.open;
    const pivot = new THREE.Vector3(...m.pivot);
    const M = new THREE.Matrix4()
      .makeTranslation(m.translation[0] * o, m.translation[1] * o, m.translation[2] * o)
      .multiply(new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z))
      .multiply(new THREE.Matrix4().makeRotationX(m.rotation * o))
      .multiply(new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z));
    G.lowerJaw.matrixAutoUpdate = false;
    G.lowerJaw.matrix.copy(M);
    G.lowerJaw.matrixWorldNeedsUpdate = true;
    // 关节盘随髁突前移（略少于髁突）
    G.disc.position.set(m.translation[0] * o * 0.85, m.translation[1] * o * 0.6 + jaw * t, m.translation[2] * o * 0.85);

    // 单牙解剖：分层
    const e = this.jaw.tooth;
    for (const [fdi, grp] of this.toothGroups) {
      const tooth = this.manifest.teeth[String(fdi)];
      const axis = new THREE.Vector3(...tooth.frame.axis);
      const mesial = new THREE.Vector3(...tooth.frame.mesial);
      const active = getState().dissectFdi === fdi ? e : 0;
      for (const child of grp.children) {
        const key = child.name.replace("holder-", "");
        const base = baseIdOf(key).startsWith("canal") ? "canal" : baseIdOf(key);
        const plan = LAYER_EXPLODE[base];
        if (!plan) continue;
        child.position.copy(axis).multiplyScalar(plan.axis * active).addScaledVector(mesial, plan.mesial * active);
      }
    }

    this.root.updateMatrixWorld(true);
    sharedJaw.uUpper.value.copy(G.upperBone.matrixWorld);
    sharedJaw.uLower.value.copy(G.lowerBone.matrixWorld);
    this.dirty = true;
  }

  // ======================================================== 相机

  private flight = { pos: new THREE.Vector3(), target: new THREE.Vector3(), until: 0 };
  /** 当前（或正在飞往的）观察方向 */
  private viewDir() {
    if (performance.now() < this.flight.until) return this.flight.pos.clone().sub(this.flight.target).normalize();
    return this.camera.position.clone().sub(this.controls.target).normalize();
  }

  private flyTo(pos: THREE.Vector3, target: THREE.Vector3, duration = 1) {
    this.flight.pos.copy(pos);
    this.flight.target.copy(target);
    this.flight.until = performance.now() + duration * 1000;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(this.camera.position, { x: pos.x, y: pos.y, z: pos.z, duration: reduce ? 0 : duration, ease: "power3.inOut", overwrite: "auto" });
    gsap.to(this.controls.target, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration: reduce ? 0 : duration,
      ease: "power3.inOut",
      overwrite: "auto",
    });
    this.busy(duration + 0.1);
  }

  /** 显示颅骨/肌肉/神经血管时，范围更大、中心更靠上后方 */
  private viewFrame() {
    const c = getState().categories;
    if (c.skull !== "off" || c.muscles !== "off") return { d: 56, center: new THREE.Vector3(0, 3.2, -3.2) };
    if (c.nerves !== "off" || c.arteries !== "off" || c.veins !== "off") return { d: 40, center: new THREE.Vector3(0, 1.8, -2.4) };
    return { d: 27, center: DENTITION_CENTER.clone() };
  }

  applyView(preset: ViewPreset, animate: boolean) {
    const { d, center: c } = this.viewFrame();
    const dirs: Record<ViewPreset, [number, number, number]> = {
      "three-quarter": [0.55, 0.28, 0.79],
      front: [0, 0.04, 1],
      left: [1, 0.04, 0],
      right: [-1, 0.04, 0],
      top: [0, 1, 0.02],
      bottom: [0, -1, 0.02],
      "occlusal-upper": [0, -1, 0.18],
      "occlusal-lower": [0, 1, 0.18],
    };
    const dir = new THREE.Vector3(...dirs[preset]).normalize();
    const target = preset.startsWith("occlusal") ? new THREE.Vector3(0, preset === "occlusal-upper" ? 0.8 : -0.4, -0.3) : c;
    // 竖屏时水平视野窄，按宽高比拉远
    const dist = (preset.startsWith("occlusal") ? 19 : d) * Math.max(1, 0.95 / this.visibleAspect);
    const pos = target.clone().addScaledVector(dir, dist);
    if (animate) this.flyTo(pos, target);
    else {
      this.camera.position.copy(pos);
      this.controls.target.copy(target);
      this.controls.update();
    }
  }

  focusOn(key: string) {
    const lm = this.landmarkWorld(key);
    if (lm) {
      const dist = Math.min(this.camera.position.distanceTo(this.controls.target), 18);
      const dir = this.camera.position.clone().sub(this.controls.target).normalize();
      this.flyTo(lm.clone().addScaledVector(dir, dist), lm);
      return;
    }
    const fdi = fdiOfKey(key);
    if (getState().dissectFdi !== null && fdi === getState().dissectFdi) return this.frameTooth(fdi!, false);
    const e = this.entries.get(key) ?? (fdi ? this.entries.get(`tooth-${fdi}`) : undefined);
    if (!e) return;
    const box = new THREE.Box3().setFromObject(e.mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3()).length();
    let dist = THREE.MathUtils.clamp((size / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2))) * 1.3, 15, 50);
    // 双侧结构从其所在一侧的外侧观察，中线结构从前方观察
    let dir =
      center.x < -0.8
        ? new THREE.Vector3(-1, 0.22, 0.4).normalize()
        : center.x > 0.8
          ? new THREE.Vector3(1, 0.22, 0.4).normalize()
          : new THREE.Vector3(0.25, 0.2, 1).normalize();
    dist *= Math.max(1, 0.95 / this.visibleAspect);
    if (key.startsWith("tooth-") && fdi) {
      // 牙齿：从颊/唇侧稍偏咬合面看
      const t = this.manifest.teeth[String(fdi)];
      dir = new THREE.Vector3(...t.frame.buccal).add(new THREE.Vector3(...t.frame.axis).multiplyScalar(0.35)).normalize();
      dist = 13.5 * Math.max(1, 0.95 / this.visibleAspect);
    }
    this.flyTo(center.clone().addScaledVector(dir, dist), center);
  }

  /** 单牙解剖时取景整颗牙（含分层后的范围） */
  private toothBox(fdi: number) {
    const grp = this.toothGroup(fdi);
    const box = new THREE.Box3();
    for (const child of grp.children) {
      const e = this.entries.get(child.name.replace("holder-", ""));
      if (e && e.target < 0.05 && e.category !== "teeth") continue;
      box.expandByObject(child);
    }
    return box;
  }

  private toothFrameDistance(fdi: number) {
    const box = this.toothBox(fdi);
    if (box.isEmpty()) return 5;
    const size = box.getSize(new THREE.Vector3());
    const halfH = Math.max(size.y, 1.2) / 2;
    const halfW = Math.max(size.x, size.z, 1) / 2 / Math.max(this.visibleAspect * 0.62, 0.5);
    return (Math.max(halfH, halfW) / Math.tan(THREE.MathUtils.degToRad(FOV / 2))) * 1.6;
  }

  private frameTooth(fdi: number, fromBuccal: boolean) {
    const box = this.toothBox(fdi);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const t = this.manifest.teeth[String(fdi)];
    const dir = fromBuccal
      ? new THREE.Vector3(...t.frame.buccal).add(new THREE.Vector3(0, 0.18, 0)).normalize()
      : this.viewDir();
    this.flyTo(center.clone().addScaledVector(dir, Math.max(this.toothFrameDistance(fdi), 3.5)), center);
  }

  zoom(factor: number) {
    const dir = this.camera.position.clone().sub(this.controls.target);
    const len = THREE.MathUtils.clamp(dir.length() * factor, this.controls.minDistance, this.controls.maxDistance);
    this.flyTo(this.controls.target.clone().add(dir.setLength(len)), this.controls.target.clone(), 0.45);
  }

  // ======================================================== 交互

  private onPointerDown = (e: PointerEvent) => {
    this.pointer.down = true;
    this.pointer.moved = false;
    this.pointer.downX = e.clientX;
    this.pointer.downY = e.clientY;
    if (getState().autoRotate) setState({ autoRotate: false });
  };

  private onPointerMove = (e: PointerEvent) => {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = e.clientX - r.left;
    this.pointer.y = e.clientY - r.top;
    if (this.pointer.down) {
      if (Math.hypot(e.clientX - this.pointer.downX, e.clientY - this.pointer.downY) > 4) this.pointer.moved = true;
      this.setHover(null);
      return;
    }
    if (e.pointerType !== "mouse") return;
    if (!this.hoverQueued) {
      this.hoverQueued = true;
      requestAnimationFrame(() => {
        this.hoverQueued = false;
        this.setHover(this.pick(this.pointer.x, this.pointer.y));
      });
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    const wasDrag = this.pointer.moved;
    this.pointer.down = false;
    if (wasDrag || e.button !== 0) return;
    const r = this.renderer.domElement.getBoundingClientRect();
    const key = this.pick(e.clientX - r.left, e.clientY - r.top);
    const s = getState();
    if (s.pickInterceptor) {
      if (key) s.pickInterceptor(key);
      return;
    }
    if (!key) {
      if (s.selected) setState({ selected: null });
      return;
    }
    // 总览中点击牙体组织 → 选中所属牙齿；单牙解剖中点击 → 选中该层
    let target = key;
    const fdi = fdiOfKey(key);
    if (fdi && s.dissectFdi === null && !key.startsWith("tooth-") && INTERNAL_CATEGORIES.every((c) => s.categories[c] === "off"))
      target = `tooth-${fdi}`;
    actions.select(target === s.selected ? null : target);
  };

  private onDoubleClick = () => {
    const key = this.pick(this.pointer.x, this.pointer.y);
    if (!key) return;
    const fdi = fdiOfKey(key);
    if (fdi && getState().dissectFdi === null && !getState().pickInterceptor) actions.enterDissect(fdi);
    else actions.focus(key);
  };

  private onPointerLeave = () => {
    this.pointer.down = false;
    this.setHover(null);
  };

  private onVisibility = () => {
    this.dirty = true;
  };

  private onLabelClick = (e: MouseEvent) => {
    const el = (e.target as HTMLElement).closest<HTMLElement>("[data-select]");
    if (!el) return;
    const key = el.dataset.select!;
    const s = getState();
    if (s.pickInterceptor) {
      s.pickInterceptor(key);
      return;
    }
    actions.select(key);
  };

  private setHover(key: string | null) {
    if (key === this.hoverKey) {
      if (key) this.positionTooltip();
      return;
    }
    this.hoverKey = key;
    this.renderer.domElement.style.cursor = key ? "pointer" : "";
    const s = getState();
    if (key && !s.pickInterceptor) {
      const d = describe(key);
      const fdi = d.fdi;
      this.tooltip.innerHTML = `<b>${nameOf(d)}</b>${fdi ? `<span>${formatTooth(fdi, s.numbering)}</span>` : ""}`;
      this.tooltip.hidden = false;
      this.positionTooltip();
    } else this.tooltip.hidden = true;
    this.refreshHighlight();
  }

  private positionTooltip() {
    this.tooltip.style.transform = `translate(${Math.round(this.pointer.x + 14)}px, ${Math.round(this.pointer.y + 16)}px)`;
  }

  /** 屏幕坐标 → 网格键。先测不透明结构，再测半透明结构；忽略被剖切掉的部分 */
  pick(x: number, y: number): string | null {
    if (!this.manifest) return null;
    const ndc = new THREE.Vector2((x / this.width) * 2 - 1, -(y / this.height) * 2 + 1);
    this.raycaster.setFromCamera(ndc, this.camera);
    const deformed = this.jaw.open > 0.01 || this.jaw.explode > 0.01;
    const sec = getState().section.enabled;
    const tiers: [number, number][] = [
      [0.9, 1.01],
      [0.04, 0.9],
    ];
    for (const [lo, hi] of tiers) {
      const list: THREE.Mesh[] = [];
      for (const e of this.entries.values()) {
        if (e.target < lo || e.target >= hi || !e.mesh.visible) continue;
        if (deformed && e.rig === "blend") continue;
        list.push(e.mesh);
      }
      const hits = this.raycaster.intersectObjects(list, false);
      for (const h of hits) {
        if (sec && this.clipPlane.distanceToPoint(h.point) < 0) continue;
        return h.object.name;
      }
    }
    return null;
  }

  // ======================================================== 标签

  private landmarkWorld(key: string): THREE.Vector3 | null {
    const lm = this.manifest?.landmarks[key];
    if (!lm) return null;
    const v = new THREE.Vector3(...lm);
    const lowerSet = ["mental-foramen", "mandibular-foramen", "condyle-top"];
    const grp = lowerSet.some((k) => key.startsWith(k)) ? this.groups.lowerBone : this.groups.upperBone;
    grp.updateWorldMatrix(true, false);
    return v.applyMatrix4(grp.matrixWorld);
  }

  refreshLabels() {
    if (!this.manifest) return;
    const s = getState();
    const out: Label[] = [];
    const visible = (key: string) => (this.entries.get(key)?.target ?? 0) > 0.1;

    if (s.labels && s.dissectFdi === null) {
      for (const fdi of ALL_FDI) {
        const shell = this.entries.get(`tooth-${fdi}`);
        const anyLayer = [...this.entries.values()].some((e) => e.fdi === fdi && e.target > 0.1);
        if (!shell || !anyLayer) continue;
        out.push({
          id: `t${fdi}`,
          text: formatTooth(fdi, s.numbering),
          kind: "tooth",
          priority: 3,
          parent: shell.holder,
          local: shell.anchor,
          select: `tooth-${fdi}`,
        });
      }
      for (const [key, pos] of Object.entries(this.manifest.landmarks)) {
        const lower = ["mental-foramen", "mandibular-foramen", "condyle-top"].some((k) => key.startsWith(k));
        const needs = lower ? s.categories.mandible : key.startsWith("infraorbital") ? s.categories.maxilla : s.categories.skull;
        if (needs === "off") continue;
        const d = describeLandmark(key);
        if (!d) continue;
        out.push({
          id: `lm-${key}`,
          text: nameOf(d),
          kind: "landmark",
          priority: 2,
          parent: lower ? this.groups.lowerBone : this.groups.upperBone,
          local: new THREE.Vector3(...pos),
          select: key,
        });
      }
      // 神经、血管、肌肉：每个基础结构标一次（取右侧，避免重复）
      const seen = new Set<string>();
      for (const e of this.entries.values()) {
        if (!["nerves", "arteries", "veins", "muscles", "tmj", "sinus"].includes(e.category)) continue;
        if (e.target < 0.1 || e.key.endsWith("-left") || seen.has(e.base)) continue;
        seen.add(e.base);
        out.push({
          id: `s-${e.key}`,
          text: nameOf(describe(e.key).info) || e.base,
          kind: "structure",
          priority: 1,
          parent: e.holder === e.mesh ? e.mesh.parent! : e.holder,
          local: e.anchor,
          select: e.key,
        });
      }
    }

    if (s.labels && s.dissectFdi !== null) {
      const fdi = s.dissectFdi;
      const t = this.manifest.teeth[String(fdi)];
      const grp = this.toothGroup(fdi);
      const enamel = this.entries.get(`enamel-${fdi}`);
      if (!enamel || enamel.target > 0.1) {
        for (const f of t.surfaceFeatures ?? []) {
          const info = SURFACE_FEATURES[f.key];
          out.push({
            id: `sf-${f.key}`,
            text: nameOf(info) || f.key,
            kind: "feature",
            priority: 2,
            parent: enamel?.holder ?? grp,
            local: (enamel?.holder ?? grp).worldToLocal(new THREE.Vector3(...f.anchor)),
          });
        }
      }
      for (const [k, pos] of Object.entries(t.landmarks)) {
        const d = describeLandmark(k);
        if (!d) continue;
        const pulpVisible = [...this.entries.values()].some((e) => e.fdi === fdi && (e.category === "pulp" || e.category === "canals") && e.target > 0.1);
        if ((k.startsWith("pulp-horn") || k.startsWith("apical")) && !pulpVisible) continue;
        const holder = k.startsWith("pulp-horn") ? this.entries.get(`pulp-chamber-${fdi}`)?.holder : undefined;
        const parent = holder ?? grp;
        out.push({
          id: `tl-${k}`,
          text: nameOf(d),
          kind: "landmark",
          priority: k === "cervical-line" ? 3 : 1,
          parent,
          local: parent.worldToLocal(new THREE.Vector3(...pos)),
        });
      }
      for (const e of this.entries.values()) {
        if (e.fdi !== fdi || e.category === "teeth" || e.target < 0.1) continue;
        out.push({
          id: `layer-${e.key}`,
          text: nameOf(describe(e.key).info) || e.base,
          kind: "structure",
          priority: 4,
          parent: e.holder,
          local: e.anchor,
          select: e.key,
        });
      }
    }

    // 选中结构的标注
    if (s.selected) {
      const key = s.selected;
      const lm = this.manifest.landmarks[key];
      const e = this.entries.get(key);
      const d = lm ? describeLandmark(key) : describe(key);
      if (d && (lm || (e && (visible(key) || key.startsWith("tooth-"))))) {
        const lower = ["mental-foramen", "mandibular-foramen", "condyle-top"].some((k) => key.startsWith(k));
        const fdi = fdiOfKey(key);
        out.push({
          id: "selected",
          text: nameOf(d),
          sub: fdi && key.startsWith("tooth-") ? formatTooth(fdi, s.numbering) : undefined,
          kind: "selected",
          priority: 10,
          parent: lm ? (lower ? this.groups.lowerBone : this.groups.upperBone) : e!.holder === e!.mesh ? e!.mesh.parent! : e!.holder,
          local: lm ? new THREE.Vector3(...lm) : e!.anchor,
        });
      }
    }

    // DOM 复用
    const old = new Map(this.labels.map((l) => [l.id, l]));
    for (const l of out) {
      const prev = old.get(l.id);
      if (prev?.el) {
        l.el = prev.el;
        old.delete(l.id);
      } else {
        l.el = document.createElement("div");
        this.overlay.appendChild(l.el);
      }
      l.el.className = `label label-${l.kind}`;
      l.el.innerHTML = l.sub ? `<span class="label-sub">${l.sub}</span>${l.text}` : l.text;
      if (l.select) l.el.dataset.select = l.select;
      else delete l.el.dataset.select;
    }
    for (const l of old.values()) l.el?.remove();
    this.labels = out.sort((a, b) => b.priority - a.priority);
    this.lastOcclusion = 0;
    this.dirty = true;
  }

  private positionLabels(now: number) {
    if (!this.labels.length) return;
    const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
    const v = new THREE.Vector3();
    const camPos = this.camera.position;
    const doOcclusion = now - this.lastOcclusion > 350 && now > this.busyUntil;
    if (doOcclusion) this.lastOcclusion = now;
    const sec = getState().section.enabled;
    for (const l of this.labels) {
      const el = l.el!;
      l.parent.updateWorldMatrix(true, false);
      v.copy(l.local).applyMatrix4(l.parent.matrixWorld);
      if (sec && l.kind !== "selected" && this.clipPlane.distanceToPoint(v) < -0.05) {
        el.style.display = "none";
        continue;
      }
      if (doOcclusion && l.kind !== "selected") {
        const dir = v.clone().sub(camPos);
        const dist = dir.length();
        this.raycaster.set(camPos, dir.normalize());
        this.raycaster.far = dist - 0.12;
        const solid: THREE.Mesh[] = [];
        for (const e of this.entries.values()) if (e.target >= 0.9 && e.mesh.visible && e.rig !== "blend") solid.push(e.mesh);
        const hit = this.raycaster.intersectObjects(solid, false).find((h) => !sec || this.clipPlane.distanceToPoint(h.point) >= 0);
        l.occluded = Boolean(hit);
        this.raycaster.far = Infinity;
      }
      v.project(this.camera);
      if (v.z > 1 || v.z < -1) {
        el.style.display = "none";
        continue;
      }
      const x = (v.x * 0.5 + 0.5) * this.width;
      const y = (-v.y * 0.5 + 0.5) * this.height;
      const w = (l.text.length + (l.sub?.length ?? 0) * 0.6) * (l.kind === "tooth" ? 8 : 12.5) + 18;
      const h = l.kind === "selected" ? 30 : 22;
      const box = { x0: x - w / 2, y0: y - h - 6, x1: x + w / 2, y1: y };
      const overlaps = placed.some((p) => !(box.x1 < p.x0 || box.x0 > p.x1 || box.y1 < p.y0 || box.y0 > p.y1));
      if (overlaps && l.kind !== "selected") {
        el.style.display = "none";
        continue;
      }
      if (l.occluded && l.kind !== "tooth") {
        el.style.display = "none";
        continue;
      }
      placed.push(box);
      el.style.display = "";
      el.classList.toggle("occluded", Boolean(l.occluded));
      el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    }
  }

  // ======================================================== 主循环

  private lastFrame = performance.now();

  private busy(seconds: number) {
    this.busyUntil = Math.max(this.busyUntil, performance.now() + seconds * 1000);
    this.dirty = true;
  }

  private animate = () => {
    this.frame = requestAnimationFrame(this.animate);
    if (document.hidden || this.disposed) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastFrame) / 1000, 0.1);
    this.lastFrame = now;
    if (this.controls.update()) this.dirty = true;
    if (this.controls.autoRotate) {
      this.dirty = true;
      this.lastMotion = now;
    }

    // 透明度与高亮缓动：按时间计算（约 0.35 s 完成），与帧率无关
    let easing = false;
    const k = 1 - Math.exp(-dt * 11);
    for (const e of this.entries.values()) {
      if (Math.abs(e.opacity - e.target) > 0.002) {
        e.opacity += (e.target - e.opacity) * k;
        if (Math.abs(e.opacity - e.target) <= 0.002) e.opacity = e.target;
        easing = true;
        this.applyOpacity(e);
      } else if (e.mesh.visible !== e.opacity > 0.004) this.applyOpacity(e);
      if (Math.abs(e.highlight - e.hTarget) > 0.002) {
        e.highlight += (e.hTarget - e.highlight) * k;
        easing = true;
      }
      const u = uniformsOf(e.mat);
      u.uHighlight.value = e.highlight;
      u.uHighlightColor.value = e.hColor;
    }
    if (easing) this.dirty = true;
    if (this.lesion) this.updateLesionFrame(now);
    this.updateMotionScale(now, easing || now < this.busyUntil || this.pointer.down);
    if (!this.dirty && now > this.busyUntil) return;
    this.dirty = false;
    this.renderer.render(this.scene, this.camera);
    this.positionLabels(now);
  };

  private applyOpacity(e: Entry) {
    const o = e.opacity;
    const m = e.mat;
    e.mesh.visible = o > 0.004;
    m.opacity = Math.min(o, 1);
    const translucent = o < 0.995;
    if (m.transparent !== translucent) {
      m.transparent = translucent;
      m.needsUpdate = true;
    }
    m.depthWrite = o > 0.6;
    uniformsOf(m).uGhost.value = THREE.MathUtils.clamp((1 - o) * 2.2, 0, 1);
    m.side = this.wantDoubleSide(e) && o >= 0.99 ? THREE.DoubleSide : THREE.FrontSide;
  }

  /** 剖切时显示断面、病变演示时显示龋洞洞壁，都需要绘制背面 */
  private wantDoubleSide(e: Entry) {
    return getState().section.enabled || (this.lesion !== null && e.fdi === this.lesion.fdi);
  }

  /** 导出当前画面为 PNG */
  snapshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL("image/png");
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frame);
    this.unsub();
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.overlay.remove();
    this.tooltip.remove();
  }
}
