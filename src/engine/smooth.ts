// Taubin 平滑：消除体素重建（marching cubes）留下的阶梯纹，同时基本不缩小体积。
// 用于模型中“建模”级别的牙体内部组织（牙本质、牙骨质、牙周膜、髓腔）。
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export function taubinSmooth(geo: THREE.BufferGeometry, iterations = 6, lambda = 0.5, mu = -0.53): THREE.BufferGeometry {
  // 1. 解量化为浮点，并合并重复顶点以获得拓扑邻接
  const src = geo.getAttribute("position");
  const pos = new Float32Array(src.count * 3);
  for (let i = 0; i < src.count; i++) {
    pos[i * 3] = src.getX(i);
    pos[i * 3 + 1] = src.getY(i);
    pos[i * 3 + 2] = src.getZ(i);
  }
  let g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  if (geo.index) g.setIndex(geo.index.clone());
  g = mergeVertices(g, 1e-5);
  const p = g.getAttribute("position") as THREE.BufferAttribute;
  const idx = g.index!;
  const n = p.count;

  // 2. 邻接表（CSR）
  const deg = new Uint32Array(n);
  for (let i = 0; i < idx.count; i += 3) {
    const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2);
    deg[a] += 2;
    deg[b] += 2;
    deg[c] += 2;
  }
  const start = new Uint32Array(n + 1);
  for (let i = 0; i < n; i++) start[i + 1] = start[i] + deg[i];
  const nbr = new Uint32Array(start[n]);
  const fill = start.slice(0, n);
  for (let i = 0; i < idx.count; i += 3) {
    const a = idx.getX(i), b = idx.getX(i + 1), c = idx.getX(i + 2);
    nbr[fill[a]++] = b;
    nbr[fill[a]++] = c;
    nbr[fill[b]++] = a;
    nbr[fill[b]++] = c;
    nbr[fill[c]++] = a;
    nbr[fill[c]++] = b;
  }

  // 3. 交替正负步长的拉普拉斯平滑
  const arr = p.array as Float32Array;
  const tmp = new Float32Array(arr.length);
  const step = (f: number) => {
    for (let v = 0; v < n; v++) {
      const s = start[v], e = start[v + 1];
      if (e === s) {
        tmp[v * 3] = arr[v * 3];
        tmp[v * 3 + 1] = arr[v * 3 + 1];
        tmp[v * 3 + 2] = arr[v * 3 + 2];
        continue;
      }
      let x = 0, y = 0, z = 0;
      for (let k = s; k < e; k++) {
        const u = nbr[k] * 3;
        x += arr[u];
        y += arr[u + 1];
        z += arr[u + 2];
      }
      const inv = 1 / (e - s);
      const o = v * 3;
      tmp[o] = arr[o] + f * (x * inv - arr[o]);
      tmp[o + 1] = arr[o + 1] + f * (y * inv - arr[o + 1]);
      tmp[o + 2] = arr[o + 2] + f * (z * inv - arr[o + 2]);
    }
    arr.set(tmp);
  };
  for (let i = 0; i < iterations; i++) {
    step(lambda);
    step(mu);
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
  return g;
}
