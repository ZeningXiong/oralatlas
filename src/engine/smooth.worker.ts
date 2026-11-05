// 在 Worker 中做 Taubin 平滑，避免阻塞主线程
import * as THREE from "three";
import { taubinSmooth } from "./smooth";

self.onmessage = (e: MessageEvent<{ id: number; position: Float32Array; index: Uint32Array | null; iterations: number }>) => {
  const { id, position, index, iterations } = e.data;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(position, 3));
  if (index) g.setIndex(new THREE.BufferAttribute(index, 1));
  const out = taubinSmooth(g, iterations);
  const pos = out.getAttribute("position").array as Float32Array;
  const nrm = out.getAttribute("normal").array as Float32Array;
  const idx = out.index!.array as Uint32Array | Uint16Array;
  const idx32 = idx instanceof Uint32Array ? idx : new Uint32Array(idx);
  (self as unknown as Worker).postMessage({ id, position: pos, normal: nrm, index: idx32 }, [pos.buffer, nrm.buffer, idx32.buffer]);
};
