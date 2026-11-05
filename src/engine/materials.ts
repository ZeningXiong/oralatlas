// 材质：每个网格一份 MeshPhysicalMaterial（便于独立淡入淡出/高亮），共用同一段着色器补丁：
//  - 剖切面着色：开启剖切后背面（被切开的内部）用平涂的“断面色”绘制
//  - 半透明“X 光”效果：半透明时边缘更实、正面更透，便于看清后方结构
//  - 选中/悬停高亮：边缘光 + 整体提亮
//  - 颌骨联动（仅神经血管和肌肉）：按顶点权重在“随颅骨”和“随下颌”两套变换之间插值，张口时被拉伸而不断裂
import * as THREE from "three";
import type { CategoryId } from "../content/types";
import { CATEGORY_BY_ID } from "../anatomy/registry";

export interface TissueUniforms {
  uCutEnabled: { value: number };
  uCutColor: { value: THREE.Color };
  uGhost: { value: number };
  uHighlight: { value: number };
  uHighlightColor: { value: THREE.Color };
  uUpper: { value: THREE.Matrix4 };
  uLower: { value: THREE.Matrix4 };
  /** 病变演示：1 = 本材质受病损场影响 */
  uLesionOn: { value: number };
  /** 1 = 正面也按断面平涂（病变演示中的牙本质：冠/根部牙本质网格有重叠，透过断面会露出亮斑） */
  uFlatCut: { value: number };
  /** 整体着色（rgb, 程度）：用于牙髓充血、坏死等 */
  uTint: { value: THREE.Vector4 };
}

/**
 * 病损场（龋病演示共用）：以咬合面上的起点 C、指向牙体内部的方向 D 定义一个轴对称病损。
 *   uLesionP = (总深度, 表面半径, 釉质内最大半径, 釉质厚度)，单位 cm
 *   uLesionS = (脱矿程度 0–1, 龋洞深度 cm, 褐变程度 0–1, 保留)
 */
export const sharedLesion = {
  uLesionC: { value: new THREE.Vector3() },
  uLesionDir: { value: new THREE.Vector3(0, -1, 0) },
  uLesionP: { value: new THREE.Vector4(0, 0.05, 0.1, 0.2) },
  uLesionS: { value: new THREE.Vector4(0, 0, 0, 0) },
  /** 剖切平面（世界坐标，n·p + c = 0），用于把断面片元还原到剖面上的真实位置 */
  uClipW: { value: new THREE.Vector4(1, 0, 0, 0) },
};

/** 所有联动网格共享同一对矩阵（引擎每帧更新） */
export const sharedJaw = {
  uUpper: { value: new THREE.Matrix4() },
  uLower: { value: new THREE.Matrix4() },
};

const TISSUE: Partial<Record<CategoryId, Partial<THREE.MeshPhysicalMaterialParameters>>> = {
  teeth: { roughness: 0.32, clearcoat: 0.55, clearcoatRoughness: 0.35, sheen: 0.2, sheenColor: new THREE.Color("#ffffff") },
  enamel: { roughness: 0.34, clearcoat: 0.7, clearcoatRoughness: 0.3, envMapIntensity: 0.4 },
  dentin: { roughness: 0.55, clearcoat: 0.1 },
  cementum: { roughness: 0.7 },
  pulp: { roughness: 0.45, clearcoat: 0.3 },
  canals: { roughness: 0.45, clearcoat: 0.3 },
  pdl: { roughness: 0.6, sheen: 0.4, sheenColor: new THREE.Color("#ffd0e6") },
  gingiva: { roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.5, sheen: 0.5, sheenColor: new THREE.Color("#ffc3c8") },
  alveolar: { roughness: 0.82 },
  maxilla: { roughness: 0.82 },
  mandible: { roughness: 0.82 },
  skull: { roughness: 0.86 },
  tmj: { roughness: 0.45, clearcoat: 0.4 },
  sinus: { roughness: 0.3, clearcoat: 0.6 },
  nerves: { roughness: 0.38, clearcoat: 0.4, emissive: new THREE.Color("#5a4200"), emissiveIntensity: 0.35 },
  arteries: { roughness: 0.35, clearcoat: 0.5 },
  veins: { roughness: 0.35, clearcoat: 0.5 },
  muscles: { roughness: 0.6, sheen: 0.35, sheenColor: new THREE.Color("#ff9d8f") },
};

/** 断面颜色：组织色压暗并略偏暖，接近解剖切片的观感 */
function cutColorOf(base: THREE.Color, category: CategoryId) {
  const c = base.clone();
  if (category === "dentin") return c.offsetHSL(0, 0.05, -0.08);
  if (category === "enamel" || category === "teeth") return new THREE.Color("#f3efe6");
  if (category === "maxilla" || category === "mandible" || category === "alveolar" || category === "skull")
    return new THREE.Color("#c9a98a");
  return c.multiplyScalar(0.78);
}

export function createTissueMaterial(category: CategoryId, opts: { blend: boolean; colorOverride?: string }) {
  const base = new THREE.Color(opts.colorOverride ?? CATEGORY_BY_ID[category].color);
  const mat = new THREE.MeshPhysicalMaterial({
    color: base,
    roughness: 0.6,
    metalness: 0,
    envMapIntensity: 0.55,
    ...TISSUE[category],
  });
  const uniforms: TissueUniforms = {
    uCutEnabled: { value: 0 },
    uCutColor: { value: cutColorOf(base, category) },
    uGhost: { value: 0 },
    uHighlight: { value: 0 },
    uHighlightColor: { value: new THREE.Color("#19c3b0") },
    uUpper: sharedJaw.uUpper,
    uLower: sharedJaw.uLower,
    uLesionOn: { value: 0 },
    uFlatCut: { value: 0 },
    uTint: { value: new THREE.Vector4(0, 0, 0, 0) },
  };
  mat.userData.uniforms = uniforms;
  mat.userData.baseColor = base.clone();
  // 牙体组织是层层嵌套、彼此贴合的壳（釉质内表面≈牙本质外表面，牙本质内表面≈髓腔表面）。
  // 剖切后透过断面看到的是这些重合面，深度相同会互相闪烁（z-fighting）。
  // 给内层组织一点深度偏移，让越靠内的组织在重合处胜出。偏移量远小于组织厚度，不影响正常遮挡。
  const DEPTH_BIAS: Partial<Record<CategoryId, number>> = { dentin: -2, pulp: -4, canals: -4 };
  const bias = DEPTH_BIAS[category];
  if (bias) {
    mat.polygonOffset = true;
    mat.polygonOffsetFactor = bias;
    mat.polygonOffsetUnits = bias * 2;
  }

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, sharedLesion);
    shader.vertexShader = shader.vertexShader.replace(
      "#include <common>",
      `#include <common>
varying vec3 vLesionWorld;`,
    );
    if (opts.blend) {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
attribute float jawWeight;
uniform mat4 uUpper;
uniform mat4 uLower;`,
        )
        .replace(
          "#include <project_vertex>",
          `vec4 mvPosition = modelMatrix * vec4( transformed, 1.0 );
mvPosition = mix( uLower * mvPosition, uUpper * mvPosition, jawWeight );
mvPosition = viewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,
        )
        .replace(
          "#include <worldpos_vertex>",
          `vec4 worldPosition = inverse( viewMatrix ) * mvPosition;
vLesionWorld = worldPosition.xyz;`,
        );
    } else {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `#include <worldpos_vertex>
vLesionWorld = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;`,
      );
    }
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
if ( uLesionOn > 0.5 && uLesionS.y > 0.0 ) {
  float ld; float lq;
  lesionMask( lesionPos( gl_FrontFacing && uFlatCut < 0.5 ), ld, lq );
  if ( ld < uLesionS.y && lq < ${CAVITY_Q.toFixed(3)} ) discard;
}`,
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
diffuseColor.rgb = mix( diffuseColor.rgb, uTint.rgb, uTint.a );
if ( uLesionOn > 0.5 && uLesionS.x > 0.0 ) {
  float ld; float lq;
  float lm = lesionMask( vLesionWorld, ld, lq );
  // 颜色强度略快于脱矿程度上升，早期白垩斑在示意中也能看清
  diffuseColor.rgb = mix( diffuseColor.rgb, lesionColor( ld, lq ), lm * min( uLesionS.x * 1.5, 1.0 ) );
}`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
if ( uLesionOn > 0.5 && uLesionS.x > 0.0 ) {
  float ld; float lq;
  roughnessFactor = mix( roughnessFactor, 0.92, lesionMask( vLesionWorld, ld, lq ) * uLesionS.x );
}`,
      )
      .replace(
        "#include <common>",
        `#include <common>
uniform float uCutEnabled;
uniform vec3 uCutColor;
uniform float uGhost;
uniform float uHighlight;
uniform vec3 uHighlightColor;
uniform float uLesionOn;
uniform float uFlatCut;
uniform vec4 uTint;
uniform vec3 uLesionC;
uniform vec3 uLesionDir;
uniform vec4 uLesionP;
uniform vec4 uLesionS;
uniform vec4 uClipW;
varying vec3 vLesionWorld;

// 剖切时，断面是用“背面”模拟的，背面片元的真实位置在剖面之后；
// 这里沿视线求与剖切平面的交点，得到断面上该像素对应的位置
vec3 lesionPos( bool front ) {
  if ( !front && uCutEnabled > 0.5 ) {
    vec3 ray = vLesionWorld - cameraPosition;
    float den = dot( uClipW.xyz, ray );
    if ( abs( den ) > 1e-6 ) {
      float t = -( dot( uClipW.xyz, cameraPosition ) + uClipW.w ) / den;
      return cameraPosition + ray * t;
    }
  }
  return vLesionWorld;
}

${LESION_RADIUS_GLSL}
// 返回 0–1 的病损强度（边缘柔和），并输出沿病损轴的深度 d 与相对半径 q
float lesionMask( vec3 p, out float d, out float q ) {
  vec3 v = p - uLesionC;
  d = dot( v, uLesionDir );
  float rr = lesionRadius( d );
  q = 2.0;
  if ( rr <= 0.0 ) return 0.0;
  float r = length( v - uLesionDir * d );
  q = r / rr;
  return 1.0 - smoothstep( 0.72, 1.0, q );
}
// 断面上的病损：脱矿区呈琥珀色，越陈旧、越靠近中心越深（类似磨片中病损的显色），便于与正常组织区分
// 釉质内：不透明的灰白色（脱矿后失去半透明性），褐变后转为灰褐；牙本质内：深褐色，中心更深；
// 外缘加一圈暗线勾出病损前沿。颜色均为示意，不对应具体染色方法。
vec3 lesionCutColor( float d, float q ) {
  float eT = uLesionP.w;
  float inDentin = smoothstep( eT * 0.85, eT * 1.1, d );
  vec3 chalkCut = vec3( 1.0, 0.99, 0.97 );
  vec3 greyBrown = vec3( 0.42, 0.30, 0.20 );
  vec3 enamelL = mix( chalkCut, greyBrown, clamp( uLesionS.z * ( 0.5 + 0.5 * ( 1.0 - q ) ), 0.0, 1.0 ) );
  vec3 dentinL = mix( vec3( 0.36, 0.21, 0.09 ), vec3( 0.13, 0.07, 0.03 ), clamp( uLesionS.z * ( 1.0 - q ) * 1.3, 0.0, 1.0 ) );
  vec3 c = mix( enamelL, dentinL, inDentin );
  float rimLine = smoothstep( 0.78, 0.9, q ) * ( 1.0 - smoothstep( 0.93, 1.0, q ) );
  return mix( c, vec3( 0.1, 0.05, 0.02 ), rimLine * 0.75 );
}
vec3 lesionColor( float d, float q ) {
  float eT = uLesionP.w;
  float inDentin = smoothstep( eT * 0.85, eT * 1.1, d );
  vec3 chalk = vec3( 1.25, 1.25, 1.22 );
  vec3 brown = vec3( 0.36, 0.2, 0.07 );
  vec3 dentinBrown = vec3( 0.48, 0.28, 0.08 );
  vec3 c = mix( chalk, brown, uLesionS.z * ( 0.55 + 0.45 * ( 1.0 - q ) ) );
  c = mix( c, dentinBrown, inDentin * 0.85 );
  // 低于牙面的正面（龋洞内壁、透过龋洞看到的内部界面）：软化、着色的龋坏组织，画成深褐色
  float wall = smoothstep( 0.015, 0.035, d ) * step( 0.001, uLesionS.y );
  return mix( c, vec3( 0.25, 0.14, 0.06 ), wall );
}`,
      )
      .replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
{
  vec3 nrm = normalize( vNormal );
  vec3 viewDir = normalize( vViewPosition );
  float facing = abs( dot( nrm, viewDir ) );
  float rim = pow( 1.0 - facing, 2.0 );
  if ( ( !gl_FrontFacing || ( uFlatCut > 0.5 && uCutEnabled > 0.5 ) ) && ( uCutEnabled > 0.5 || uLesionOn > 0.5 ) ) {
    // 断面：平涂 + 轻微的明暗，看起来像实心切面；病变演示时断面上也显示病损
    vec3 base = mix( uCutColor, uTint.rgb, uTint.a );
    if ( uLesionOn > 0.5 ) {
      float ld; float lq;
      float lm = lesionMask( lesionPos( false ), ld, lq );
      base = mix( base, lesionCutColor( ld, lq ), ( lq < 1.0 ? 1.0 : lm ) * uLesionS.x );
      // 未剖切时只有透过龋洞才看得到背面：画成深褐色洞壁
      if ( uCutEnabled < 0.5 ) base = mix( vec3( 0.22, 0.12, 0.05 ), base, 0.25 );
    }
    gl_FragColor = vec4( base * ( 0.88 + 0.12 * facing ), 1.0 );
  }
  if ( uGhost > 0.0 ) {
    gl_FragColor.a *= mix( 1.0, 0.18 + 1.6 * rim, uGhost );
  }
  // 高亮：先向高亮色着色（选中时轻微、测验时明显），再叠加边缘光
  gl_FragColor.rgb = mix( gl_FragColor.rgb, uHighlightColor * ( 0.62 + 0.38 * facing ), clamp( uHighlight * 0.36, 0.0, 0.72 ) );
  gl_FragColor.rgb += uHighlightColor * uHighlight * 0.55 * rim;
}`,
      );
  };
  mat.customProgramCacheKey = () => (opts.blend ? "tissue-blend" : "tissue");
  return mat;
}

export function uniformsOf(mat: THREE.Material): TissueUniforms {
  return mat.userData.uniforms as TissueUniforms;
}

/** 病损剖面轮廓（片元着色器与龋洞网格共用，保证两者形状一致） */
const LESION_RADIUS_GLSL = /* glsl */ `// 病损轮廓：釉质内由表面半径扩大到最大半径；进入牙本质后沿釉牙本质界横向扩展，再向牙髓方向收窄
float lesionRadius( float d ) {
  float depth = uLesionP.x;
  float eT = uLesionP.w;
  if ( d < -0.03 || d > depth ) return -1.0;
  if ( d <= eT ) return mix( uLesionP.y, uLesionP.z, smoothstep( 0.0, eT, d ) );
  float k = clamp( ( d - eT ) / max( depth - eT, 1e-3 ), 0.0, 1.0 );
  return uLesionP.z * 1.35 * sqrt( max( 1.0 - k * k, 0.0 ) ) + 0.012;
}`;

/** 龋洞的“丢弃阈值”：相对半径 q 小于此值且深度小于龋洞深度的组织片元被丢弃 */
export const CAVITY_Q = 0.62;

/**
 * 龋洞内壁网格。牙体模型只是若干贴合的“壳”，在着色器里丢弃片元只会挖出一个透光的洞，
 * 透过洞会看到深处的组织界面；这里用一个与丢弃区域同形的“口袋”（只画朝内的一面）充当洞壁。
 * 顶点在着色器里按 sharedLesion 实时变形，无需每帧重建几何体。
 */
export function createCavityMesh(): THREE.Mesh {
  const K = 48, N = 24, M = 8;
  const pos: number[] = [], cav: number[] = [], idx: number[] = [];
  const rows = N + 1 + M;
  for (let r = 0; r < rows; r++) {
    const a = r <= N ? r / N : 1;
    const b = r <= N ? 1 : 1 - (r - N) / M;
    for (let k = 0; k <= K; k++) {
      const t = (k / K) * Math.PI * 2;
      pos.push(Math.cos(t), Math.sin(t), 0);
      cav.push(a, b);
    }
  }
  for (let r = 0; r < rows - 1; r++)
    for (let k = 0; k < K; k++) {
      const i = r * (K + 1) + k, j = i + K + 1;
      idx.push(i, j, i + 1, i + 1, j, j + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aCav", new THREE.Float32BufferAttribute(cav, 2));
  g.setIndex(idx);
  // 只画朝向洞内的一面：从外面看不到“口袋”，透过洞口/剖面才看得到洞壁
  const mat = new THREE.MeshStandardMaterial({ color: "#5a3418", roughness: 0.95, side: THREE.FrontSide });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, sharedLesion);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
uniform vec3 uLesionC;
uniform vec3 uLesionDir;
uniform vec4 uLesionP;
uniform vec4 uLesionS;
attribute vec2 aCav;
varying float vCavDepth;
${LESION_RADIUS_GLSL}
void cavBasis( out vec3 U, out vec3 V ) {
  vec3 h = abs( uLesionDir.y ) < 0.9 ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
  U = normalize( cross( uLesionDir, h ) );
  V = cross( uLesionDir, U );
}`,
      )
      .replace(
        "#include <beginnormal_vertex>",
        `vec3 cU; vec3 cV; cavBasis( cU, cV );
// 三角形正面朝向洞内（见索引顺序），法线也取朝内方向
vec3 objectNormal = ( aCav.y > 0.999 ) ? -normalize( cU * position.x + cV * position.y ) : -uLesionDir;`,
      )
      .replace(
        "#include <begin_vertex>",
        `float cd = mix( -0.012, uLesionS.y, aCav.x );
float crr = max( lesionRadius( cd ), 0.0 ) * ${CAVITY_Q.toFixed(3)} * aCav.y;
vec3 transformed = uLesionC + uLesionDir * cd + ( cU * position.x + cV * position.y ) * crr;
vCavDepth = aCav.x;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vCavDepth;")
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
// 洞口附近的软化牙本质颜色较浅，洞底较深
diffuseColor.rgb *= mix( 1.15, 0.6, vCavDepth );`,
      );
  };
  const mesh = new THREE.Mesh(g, mat);
  mesh.frustumCulled = false;
  mesh.visible = false;
  mesh.renderOrder = 1;
  return mesh;
}
