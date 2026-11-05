// ============================================================================
// 牙体局部释义：牙面解剖特征、牙体标志点、牙根名称、牙型中文名。
// 键名与 public/models/manifest.json 一致（surfaceFeatures[].key、roots[].label、
// 牙体 landmarks 去掉序号/根名后的基础键）。
// 【内容来源，如实说明】本文件由 AI（Claude）辅助编写，尚未经口腔专业人员逐条审校。
// 撰写时要求遵循国内《口腔解剖生理学》教材的描述体系与全国科学技术名词审定委员会的规范名词，
// 但编写过程中并未查阅任何教材原文；事实依据为模型的训练知识，并与 Dental Scope 项目的英文
// 教学文字（CC BY-SA 4.0）交叉核对过一部分。数值、发生率与临床参数尤其需要对照教材复核。
// 为避免生僻字显示问题，“𬌗面”统一写作“咬合面”。
// ============================================================================
import type { LandmarkInfo, RootLabelInfo, SurfaceFeatureInfo } from "./types";

// ----------------------------------------------------------------------------
// 牙面解剖特征（32 项）
// ----------------------------------------------------------------------------

export const SURFACE_FEATURES: Record<string, SurfaceFeatureInfo> = {
  // ---- 牙尖 ----
  "buccal-cusp": {
    key: "buccal-cusp",
    nameZh: "颊尖",
    nameEn: "Buccal cusp",
    description:
      "前磨牙咬合面颊侧的牙尖，由颊轴嵴、近中和远中牙尖嵴及颊尖三角嵴汇聚而成。上颌前磨牙颊尖高而锐，为非支持尖；下颌前磨牙颊尖明显大于舌尖，是承担咬合力的支持尖（功能尖）。",
  },
  "lingual-cusp": {
    key: "lingual-cusp",
    nameZh: "舌尖",
    nameEn: "Lingual cusp",
    description:
      "前磨牙咬合面舌侧的牙尖。上颌前磨牙舌尖为支持尖，第一前磨牙舌尖较颊尖低、尖顶偏近中，第二前磨牙两尖高度相近；下颌第一前磨牙舌尖很小、几乎不参与咀嚼，下颌第二前磨牙舌侧发育较好，三尖型者分为近中舌尖和远中舌尖。",
  },
  "cusp-tip": {
    key: "cusp-tip",
    nameZh: "牙尖顶",
    nameEn: "Cusp tip",
    description:
      "尖牙牙尖的最高点，由唇轴嵴、舌轴嵴与近中、远中牙尖嵴交会而成；尖顶偏近中（近中牙尖嵴短、远中牙尖嵴长），是区分近远中和左右侧的依据。",
  },
  "mesiobuccal-cusp": {
    key: "mesiobuccal-cusp",
    nameZh: "近中颊尖",
    nameEn: "Mesiobuccal cusp",
    description:
      "磨牙颊侧近中的牙尖。上颌第一磨牙近中颊尖与下颌第一磨牙颊沟的位置关系是安氏分类判断磨牙关系的基准；下颌第一磨牙近中颊尖是颊侧 3 个牙尖中最宽者，为支持尖。",
  },
  "distobuccal-cusp": {
    key: "distobuccal-cusp",
    nameZh: "远中颊尖",
    nameEn: "Distobuccal cusp",
    description:
      "磨牙颊侧远中的牙尖。上颌磨牙远中颊尖小于近中颊尖，其三角嵴与近中舌尖三角嵴相连形成斜嵴；下颌磨牙远中颊尖位于颊沟远中，是支持尖之一。",
  },
  "mesiolingual-cusp": {
    key: "mesiolingual-cusp",
    nameZh: "近中舌尖",
    nameEn: "Mesiolingual cusp",
    description:
      "磨牙舌侧近中的牙尖。上颌磨牙近中舌尖是最大的牙尖和主要支持尖，其三角嵴与远中颊尖三角嵴相连形成斜嵴，舌侧可有卡氏尖（第五牙尖）；下颌磨牙近中舌尖高而锐，属非支持尖。",
  },
  "distolingual-cusp": {
    key: "distolingual-cusp",
    nameZh: "远中舌尖",
    nameEn: "Distolingual cusp",
    description:
      "磨牙舌侧远中的牙尖。上颌第一磨牙者为 4 个主要牙尖中最小，上颌第二、第三磨牙者更小或缺如；下颌磨牙远中舌尖与近中舌尖大小相近，舌尖较颊尖高而锐。",
  },
  "distal-cusp": {
    key: "distal-cusp",
    nameZh: "远中尖",
    nameEn: "Distal cusp",
    description:
      "下颌第一磨牙颊侧远中端的小牙尖，位于远中颊尖的远中，以远中颊沟与之分隔；是该牙 5 个牙尖中最小者，也是区别于下颌第二磨牙的重要标志。",
  },

  // ---- 嵴 ----
  "incisal-edge": {
    key: "incisal-edge",
    nameZh: "切嵴",
    nameEn: "Incisal ridge (incisal edge)",
    description:
      "切牙切端由唇、舌两面相交形成的长条形釉质隆起（切缘），具有切割功能；初萌切牙的切缘有 3 个切缘结节，随磨耗逐渐消失。上颌中切牙切嵴平直，上颌侧切牙切嵴向远中舌侧倾斜，下颌侧切牙切嵴向远中舌侧扭转。",
  },
  "mesial-marginal-ridge": {
    key: "mesial-marginal-ridge",
    nameZh: "近中边缘嵴",
    nameEn: "Mesial marginal ridge",
    description:
      "前牙舌面近中缘或后牙咬合面近中缘的长条形釉质隆起，与远中边缘嵴共同围成舌窝或咬合面；相邻牙边缘嵴高度协调有助于防止食物嵌塞。上颌第一前磨牙的近中边缘嵴常有发育沟越过，下颌第一前磨牙的近中边缘嵴低于远中边缘嵴。",
  },
  "distal-marginal-ridge": {
    key: "distal-marginal-ridge",
    nameZh: "远中边缘嵴",
    nameEn: "Distal marginal ridge",
    description:
      "前牙舌面远中缘或后牙咬合面远中缘的长条形釉质隆起；后牙相邻两牙边缘嵴高度协调，可将食物局限于咬合面并防止食物嵌塞，充填和修复时应恢复其形态。",
  },
  "labial-ridge": {
    key: "labial-ridge",
    nameZh: "唇轴嵴",
    nameEn: "Labial ridge",
    description:
      "尖牙唇面由牙尖顶伸向颈 1/3 的纵行隆起，将唇面分为近唇斜面和远唇斜面；上颌尖牙者明显，下颌尖牙者较平缓。",
  },
  "lingual-ridge": {
    key: "lingual-ridge",
    nameZh: "舌轴嵴",
    nameEn: "Lingual ridge",
    description:
      "尖牙舌面由牙尖顶伸向舌隆突的纵行隆起，将舌窝分为近中舌窝和远中舌窝；上颌尖牙者明显，下颌尖牙者不明显。",
  },
  "buccal-ridge": {
    key: "buccal-ridge",
    nameZh: "颊轴嵴",
    nameEn: "Buccal ridge",
    description:
      "前磨牙颊面由颊尖顶伸向牙颈部的纵行釉质隆起，将颊面分为近中、远中两部分，上颌第一前磨牙者尤为明显。",
  },
  "buccal-triangular-ridge": {
    key: "buccal-triangular-ridge",
    nameZh: "颊尖三角嵴",
    nameEn: "Buccal triangular ridge",
    description:
      "由颊尖顶伸向咬合面中央的嵴，因两侧斜面汇合成三角形而得名；与舌尖三角嵴相对，二者之间一般以中央沟分隔（下颌第一前磨牙两嵴相连成横嵴）。",
  },
  "lingual-triangular-ridge": {
    key: "lingual-triangular-ridge",
    nameZh: "舌尖三角嵴",
    nameEn: "Lingual triangular ridge",
    description: "由舌尖顶伸向咬合面中央的三角嵴，与颊尖三角嵴相对，二者之间为中央沟。",
  },
  "transverse-ridge": {
    key: "transverse-ridge",
    nameZh: "横嵴",
    nameEn: "Transverse ridge",
    description:
      "下颌第一前磨牙咬合面上颊尖三角嵴与舌尖三角嵴相连、横过咬合面的嵴，将咬合面分为较小的近中窝和较大的远中窝，是该牙咬合面的重要解剖特征。",
  },
  "oblique-ridge": {
    key: "oblique-ridge",
    nameZh: "斜嵴",
    nameEn: "Oblique ridge",
    description:
      "上颌磨牙咬合面上近中舌尖三角嵴与远中颊尖三角嵴相连形成的斜行嵴，将咬合面分为较大的中央窝和较小的远中窝；是上颌第一磨牙的解剖特征，第二、第三磨牙依次减弱。窝洞预备时应尽量保留完整的斜嵴，以维持牙体抗力。",
  },
  cingulum: {
    key: "cingulum",
    nameZh: "舌隆突",
    nameEn: "Cingulum",
    description:
      "前牙舌面颈 1/3 处的半月形釉质隆起（又称舌面隆突），以上颌尖牙最为显著；其与舌窝交界处可有点隙（如上颌侧切牙的舌侧窝），易滞留菌斑而发生龋坏，也是可摘局部义齿舌隆突支托的放置部位。",
  },

  // ---- 窝 ----
  "lingual-fossa": {
    key: "lingual-fossa",
    nameZh: "舌窝",
    nameEn: "Lingual fossa",
    description:
      "切牙舌面中央的浅凹，四周由近中边缘嵴、远中边缘嵴、切嵴和舌隆突围成；上颌切牙舌窝较深（侧切牙者窄而深，可形成畸形舌侧窝），下颌切牙舌窝浅。下颌前伸时，下颌切牙切嵴沿上颌切牙舌面滑行。",
  },
  "mesiolingual-fossa": {
    key: "mesiolingual-fossa",
    nameZh: "近中舌窝",
    nameEn: "Mesiolingual fossa",
    description: "尖牙舌面舌轴嵴近中侧的浅凹，通常小于远中舌窝；上颌尖牙者较明显，下颌尖牙者较浅。",
  },
  "distolingual-fossa": {
    key: "distolingual-fossa",
    nameZh: "远中舌窝",
    nameEn: "Distolingual fossa",
    description:
      "尖牙舌面舌轴嵴远中侧的浅凹；由于牙尖顶偏近中，远中舌窝通常大于近中舌窝。上颌尖牙者较明显，下颌尖牙者较浅。",
  },
  "central-fossa": {
    key: "central-fossa",
    nameZh: "中央窝",
    nameEn: "Central fossa",
    description:
      "磨牙咬合面中央的较大凹陷，由各牙尖三角嵴和斜面围成，底部为中央点隙；上颌磨牙的中央窝位于斜嵴近中，大于远中窝。中央窝是对颌牙支持尖的咬合接触区，也是窝沟龋好发部位。",
  },
  "mesial-fossa": {
    key: "mesial-fossa",
    nameZh: "近中窝",
    nameEn: "Mesial fossa",
    description:
      "前磨牙咬合面中央沟近中端、近中边缘嵴内侧的凹陷，底部为近中点隙；下颌第一前磨牙的近中窝位于横嵴近中，较远中窝小，常有近中舌沟通过。",
  },
  "distal-fossa": {
    key: "distal-fossa",
    nameZh: "远中窝",
    nameEn: "Distal fossa",
    description:
      "后牙咬合面远中边缘嵴近中侧的凹陷：前磨牙的远中窝位于中央沟远中端（下颌第一前磨牙者位于横嵴远中，较近中窝大）；上颌磨牙的远中窝位于斜嵴远中，较中央窝小，有远中舌沟通过。",
  },

  // ---- 沟 ----
  "central-groove": {
    key: "central-groove",
    nameZh: "中央沟",
    nameEn: "Central groove",
    description:
      "后牙咬合面中部近远中向走行的发育沟：前磨牙的中央沟连接近中窝与远中窝，上颌第一前磨牙者较长、第二前磨牙者较短；磨牙的中央沟经中央窝向近中、远中延伸（教材中分称近中沟、远中沟）。窝沟深处易滞留菌斑，是窝沟封闭的重点部位。",
  },
  "buccal-groove": {
    key: "buccal-groove",
    nameZh: "颊沟",
    nameEn: "Buccal groove",
    description:
      "磨牙咬合面自中央窝向颊侧延伸、经两颊尖之间越过颊侧边缘至颊面的发育沟（下颌第一磨牙者位于近中颊尖与远中颊尖之间），末端常有点隙，是龋病好发部位。中性磨牙关系时，上颌第一磨牙近中颊尖咬合于下颌第一磨牙的颊沟内。",
  },
  "distobuccal-groove": {
    key: "distobuccal-groove",
    nameZh: "远中颊沟",
    nameEn: "Distobuccal groove",
    description:
      "下颌第一磨牙颊侧远中颊尖与远中尖之间的发育沟，自咬合面越过颊侧边缘延至颊面；与颊沟共同将颊侧分为 3 个牙尖，是下颌第一磨牙的特征之一。",
  },
  "lingual-groove": {
    key: "lingual-groove",
    nameZh: "舌沟",
    nameEn: "Lingual groove",
    description:
      "磨牙舌侧两舌尖之间的发育沟，自咬合面越过舌侧边缘延至舌面；上颌磨牙的舌沟是远中舌沟的延续，下颌磨牙的舌沟位于近中舌尖与远中舌尖之间，末端可有点隙，易发生龋坏。",
  },
  "distal-oblique-groove": {
    key: "distal-oblique-groove",
    nameZh: "远中舌沟",
    nameEn: "Distal oblique groove (distolingual groove)",
    description:
      "上颌磨牙咬合面上沿斜嵴远中侧斜行的发育沟（又称远中斜沟）：一端起于远中窝、止于远中边缘嵴内，另一端经远中舌尖与近中舌尖之间越过舌侧边缘，延续为舌面的舌沟。",
  },
  "mesiolingual-groove": {
    key: "mesiolingual-groove",
    nameZh: "近中舌沟",
    nameEn: "Mesiolingual groove",
    description:
      "下颌第一前磨牙咬合面上由近中窝向舌侧延伸、经近中边缘嵴与舌尖之间至舌面的发育沟，是该牙的特征之一，可据此区分近远中。",
  },
  "mesial-marginal-groove": {
    key: "mesial-marginal-groove",
    nameZh: "近中边缘沟",
    nameEn: "Mesial marginal groove",
    description:
      "上颌第一前磨牙咬合面的发育沟越过近中边缘嵴延至近中面而成，与近中面颈部凹陷共同构成该牙的特征；此处易滞留菌斑，邻面龋充填和修复时需注意。",
  },
};

// ----------------------------------------------------------------------------
// 牙体标志点（manifest 中带序号或根名的键，如 "pulp-horn-2"、"apical-foramen-palatal"，
// 由 registry 归并到以下基础键；根尖孔名称会自动加上所属牙根前缀）
// ----------------------------------------------------------------------------

export const TOOTH_LANDMARKS: Record<string, LandmarkInfo> = {
  apex: {
    key: "apex",
    nameZh: "根尖",
    nameEn: "Root apex",
    description:
      "牙根末端的尖端部分，多根牙每个牙根各有一个根尖；根尖周围的牙周膜和牙槽骨合称根尖周组织。",
    clinical:
      "牙髓感染可经根尖孔扩散引起根尖周炎；上颌后牙根尖与上颌窦底、下颌后牙根尖与下颌管、下颌前磨牙根尖与颏孔相邻，根尖手术、拔牙和根管超填时需注意。",
  },
  "apical-foramen": {
    key: "apical-foramen",
    nameZh: "根尖孔",
    nameEn: "Apical foramen",
    description:
      "根管在根尖部的开口，是牙髓血管、神经出入的主要通道；其位置常不在解剖根尖顶，而偏于根尖一侧，根尖区还可有根尖分歧形成的副孔。",
    clinical:
      "根管预备和充填通常止于根尖狭窄处（约距 X 线片根尖 0.5–1 mm），以免超填或欠填；年轻恒牙牙根未发育完成时根尖孔粗大，呈喇叭口状。",
  },
  "cervical-line": {
    key: "cervical-line",
    nameZh: "牙颈线",
    nameEn: "Cervical line (cementoenamel junction, CEJ)",
    description:
      "牙冠与牙根交界处的弧形曲线，又称颈缘、颈线，即釉牙骨质界（CEJ）；在唇（颊）、舌面凸向根方，在邻面凸向切端或咬合面，近中面曲度大于远中面，前牙曲度大于后牙。",
    clinical:
      "是测量临床附着丧失（自釉牙骨质界至龈沟或牙周袋底的距离）、判断牙龈退缩和确定修复体边缘位置的参照；釉质与牙骨质约 60% 为牙骨质少许覆盖釉质、约 30% 端端相接、约 10% 互不相接，不相接处牙本质外露，易发生牙本质敏感。",
  },
  "pulp-horn": {
    key: "pulp-horn",
    nameZh: "髓角",
    nameEn: "Pulp horn",
    description:
      "髓室顶向牙尖方向突出的尖角部分，其位置与牙尖（切牙为近中、远中切角处）相对应；年轻恒牙髓角高而尖，随年龄增长和继发性牙本质沉积逐渐降低。",
    clinical:
      "牙体预备、去腐和开髓时须估计髓角位置，年轻恒牙尤易意外穿髓；畸形中央尖内常有髓角突入，中央尖折断后可直接露髓。",
  },
};

// ----------------------------------------------------------------------------
// 牙根名称（nameZh 会与“根尖孔”拼接，如“近中颊根根尖孔”；"single" 的前缀会被省略）
// ----------------------------------------------------------------------------

export const ROOT_LABELS: Record<string, RootLabelInfo> = {
  single: { key: "single", nameZh: "单根", nameEn: "Single root" },
  buccal: { key: "buccal", nameZh: "颊根", nameEn: "Buccal root" },
  palatal: { key: "palatal", nameZh: "腭根", nameEn: "Palatal root" },
  mesial: { key: "mesial", nameZh: "近中根", nameEn: "Mesial root" },
  distal: { key: "distal", nameZh: "远中根", nameEn: "Distal root" },
  mesiobuccal: { key: "mesiobuccal", nameZh: "近中颊根", nameEn: "Mesiobuccal root" },
  distobuccal: { key: "distobuccal", nameZh: "远中颊根", nameEn: "Distobuccal root" },
};

// ----------------------------------------------------------------------------
// 牙型中文名（manifest teeth[].type）
// ----------------------------------------------------------------------------

export const TOOTH_TYPE_ZH: Record<string, string> = {
  "central-incisor": "中切牙",
  "lateral-incisor": "侧切牙",
  canine: "尖牙",
  "first-premolar": "第一前磨牙",
  "second-premolar": "第二前磨牙",
  "first-molar": "第一磨牙",
  "second-molar": "第二磨牙",
  "third-molar": "第三磨牙",
};
