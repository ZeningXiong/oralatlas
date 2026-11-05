// 为没有自带权重的肌肉网格计算“颌骨权重”：顶点离下颌骨越近权重越接近 0（随下颌运动），
// 离上方颅骨越近越接近 1（不动）。做法：把骨骼点云栅格化，用两遍倒角距离变换（chamfer）
// 得到三维距离场，之后每个顶点查表即可 —— 总耗时几十毫秒，不会卡住主线程。
import * as THREE from "three";

const CELL = 0.4; // cm

class DistanceField {
  readonly dist: Float32Array;
  constructor(
    points: Float32Array,
    private min: THREE.Vector3,
    private dims: [number, number, number],
  ) {
    const [nx, ny, nz] = dims;
    const d = (this.dist = new Float32Array(nx * ny * nz).fill(1e6));
    for (let i = 0; i < points.length; i += 3) {
      const idx = this.index(points[i], points[i + 1], points[i + 2]);
      if (idx >= 0) d[idx] = 0;
    }
    // 两遍 3×3×3 倒角距离变换
    const w1 = 1, w2 = Math.SQRT2, w3 = Math.sqrt(3);
    const at = (x: number, y: number, z: number) => x + nx * (y + ny * z);
    const pass = (forward: boolean) => {
      const zs = forward ? 0 : nz - 1, ze = forward ? nz : -1, st = forward ? 1 : -1;
      for (let z = zs; z !== ze; z += st)
        for (let y = forward ? 0 : ny - 1; y !== (forward ? ny : -1); y += st)
          for (let x = forward ? 0 : nx - 1; x !== (forward ? nx : -1); x += st) {
            const i = at(x, y, z);
            let best = d[i];
            for (let dz = -1; dz <= 0; dz++)
              for (let dy = -1; dy <= 1; dy++)
                for (let dx = -1; dx <= 1; dx++) {
                  // 只看“已扫描过”的半边邻域
                  const ox = dx * st, oy = dy * st, oz = dz * st;
                  if (dz === 0 && (dy > 0 || (dy === 0 && dx >= 0))) continue;
                  const X = x + ox, Y = y + oy, Z = z + oz;
                  if (X < 0 || Y < 0 || Z < 0 || X >= nx || Y >= ny || Z >= nz) continue;
                  const n = Math.abs(dx) + Math.abs(dy) + Math.abs(dz);
                  const v = d[at(X, Y, Z)] + (n === 1 ? w1 : n === 2 ? w2 : w3);
                  if (v < best) best = v;
                }
            d[i] = best;
          }
    };
    pass(true);
    pass(false);
  }
  index(x: number, y: number, z: number) {
    const [nx, ny, nz] = this.dims;
    const ix = Math.floor((x - this.min.x) / CELL);
    const iy = Math.floor((y - this.min.y) / CELL);
    const iz = Math.floor((z - this.min.z) / CELL);
    if (ix < 0 || iy < 0 || iz < 0 || ix >= nx || iy >= ny || iz >= nz) return -1;
    return ix + nx * (iy + ny * iz);
  }
  /** 距离（cm）；网格外返回一个较大值 */
  sample(x: number, y: number, z: number) {
    const i = this.index(x, y, z);
    return i < 0 ? 50 : this.dist[i] * CELL;
  }
}

/** 取网格的世界坐标顶点（可隔点采样） */
export function worldPoints(meshes: THREE.Mesh[], stride = 1): Float32Array {
  const out: number[] = [];
  const v = new THREE.Vector3();
  for (const m of meshes) {
    m.updateWorldMatrix(true, false);
    const pos = m.geometry.getAttribute("position");
    for (let i = 0; i < pos.count; i += stride) {
      v.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld);
      out.push(v.x, v.y, v.z);
    }
  }
  return new Float32Array(out);
}

export class JawWeightField {
  private lower: DistanceField;
  private upper: DistanceField;
  constructor(lowerPts: Float32Array, upperPts: Float32Array) {
    const box = new THREE.Box3();
    const v = new THREE.Vector3();
    for (const pts of [lowerPts, upperPts])
      for (let i = 0; i < pts.length; i += 3) box.expandByPoint(v.set(pts[i], pts[i + 1], pts[i + 2]));
    box.expandByScalar(3);
    const size = box.getSize(new THREE.Vector3());
    const dims: [number, number, number] = [
      Math.ceil(size.x / CELL),
      Math.ceil(size.y / CELL),
      Math.ceil(size.z / CELL),
    ];
    this.lower = new DistanceField(lowerPts, box.min, dims);
    this.upper = new DistanceField(upperPts, box.min, dims);
  }

  apply(target: THREE.Mesh) {
    const pos = target.geometry.getAttribute("position");
    const w = new Float32Array(pos.count);
    const v = new THREE.Vector3();
    target.updateWorldMatrix(true, false);
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(target.matrixWorld);
      const dl = this.lower.sample(v.x, v.y, v.z);
      const du = this.upper.sample(v.x, v.y, v.z);
      const t = dl / Math.max(dl + du, 1e-4);
      w[i] = THREE.MathUtils.smoothstep(t, 0.2, 0.8);
    }
    target.geometry.setAttribute("jawWeight", new THREE.BufferAttribute(w, 1));
  }
}

/** 神经血管网格：顶点色 R 通道即权重（1 = 随颅骨，0 = 随下颌） */
export function weightsFromVertexColor(target: THREE.Mesh) {
  const col = target.geometry.getAttribute("color");
  const pos = target.geometry.getAttribute("position");
  const w = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) w[i] = col ? col.getX(i) : 1;
  target.geometry.setAttribute("jawWeight", new THREE.BufferAttribute(w, 1));
  target.geometry.deleteAttribute("color");
}
