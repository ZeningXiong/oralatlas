// ============================================================================
// 内容数据接口 —— 所有教学内容（中文为主，附英文/拉丁术语）都遵循这些类型。
// 3D 引擎与界面只通过这些类型读取内容，内容文件不依赖任何引擎代码。
// ============================================================================

/** 图层类别（与 3D 场景中的网格分组一一对应） */
export type CategoryId =
  | "teeth" // 牙齿外形（32 颗牙的整体外壳）
  | "enamel" // 牙釉质
  | "dentin" // 牙本质（冠部 + 根部）
  | "cementum" // 牙骨质
  | "pulp" // 牙髓腔（髓室）
  | "canals" // 根管
  | "pdl" // 牙周膜
  | "gingiva" // 牙龈
  | "alveolar" // 牙槽骨（上下颌牙槽突）
  | "maxilla" // 上颌骨
  | "mandible" // 下颌骨（含髁突）
  | "tmj" // 颞下颌关节（关节窝、关节盘）
  | "sinus" // 鼻旁窦（上颌窦、额窦、蝶窦）
  | "nerves" // 神经
  | "arteries" // 动脉
  | "veins" // 静脉
  | "muscles" // 咀嚼肌与口周肌
  | "skull"; // 颅骨其余部分（背景）

/** 预设相机视角 */
export type ViewPreset =
  | "three-quarter" // 四分之三侧前方
  | "front" // 正面
  | "left" // 患者左侧
  | "right" // 患者右侧
  | "top" // 上方
  | "bottom" // 下方
  | "occlusal-upper" // 上牙弓咬合面（从下往上看）
  | "occlusal-lower"; // 下牙弓咬合面（从上往下看）

/**
 * 场景描述：课程/题目可以要求 3D 视图切换到某个状态。
 * 只写需要改变的字段；未写的字段保持默认（默认：牙齿+牙龈+上下颌骨+牙槽骨可见，正面视角）。
 */
export interface SceneSpec {
  view?: ViewPreset;
  /** 只显示这些类别（其余隐藏）。省略则保持默认图层。 */
  layers?: CategoryId[];
  /** 这些类别以半透明方式显示（需同时出现在 layers 中或默认可见）。 */
  ghost?: CategoryId[];
  /** 选中某个结构并显示其信息。取值见下方“结构 ID 规则”。 */
  select?: string;
  /** 进入单牙解剖模式（FDI 编号，如 36）。 */
  focusTooth?: number;
  /** 上下颌分离程度 0–1。 */
  explode?: number;
  /** 张口程度 0–1。 */
  jawOpen?: number;
  /** 剖切：axis 为剖切方向；offset 为 -1..1 的归一化位置（0 = 模型中心）。 */
  section?: { axis: "sagittal" | "coronal" | "axial"; offset: number };
  /** 是否显示结构名称标签。 */
  labels?: boolean;
}
/*
 * 结构 ID 规则（select 字段及各处引用）：
 *   - 牙齿：            "tooth-36"（FDI）
 *   - 牙体组织：        "enamel-36" "dentin-coronal-36" "dentin-radicular-36" "cementum-36" "pdl-36" "pulp-chamber-36"
 *   - 根管：            "canal-mesiobuccal-1-16" "canal-palatal-16" "canal-single-11" 等
 *   - 双侧结构：        "<基础ID>-left" / "<基础ID>-right"，如 "inferior-alveolar-nerve-right"、"maxilla-left"
 *   - 单一结构：        "mandible-body" "vomer" "gingiva-upper" 等
 *   - 颅骨标志点：      "mental-foramen-left" "mandibular-foramen-right" 等
 *   左右均指“患者”的左右。
 */

// ----------------------------------------------------------------------------
// 牙型指南（16 种：上/下颌 × 8 种牙）
// ----------------------------------------------------------------------------

export type ArchId = "maxillary" | "mandibular";
export type ToothTypeId =
  | "central-incisor"
  | "lateral-incisor"
  | "canine"
  | "first-premolar"
  | "second-premolar"
  | "first-molar"
  | "second-molar"
  | "third-molar";

/** 牙型键，如 "maxillary-first-molar" */
export type ToothGuideKey = `${ArchId}-${ToothTypeId}`;

export interface ToothGuide {
  key: ToothGuideKey;
  nameZh: string; // 上颌第一磨牙
  nameEn: string; // Maxillary first molar
  aliasZh?: string[]; // 俗称，如 “六龄齿”
  summary: string; // 1–2 句概述（该牙最核心的特征）
  /** 牙冠形态：按面描述，每条一句话（唇/颊面、舌/腭面、近中面、远中面、切缘/咬合面） */
  crown: { surface: string; text: string }[];
  /** 牙根形态要点 */
  root: string[];
  /** 髓腔形态要点（髓室、髓角、根管） */
  pulp: string[];
  rootsBrief: string; // “3 根（近中颊根、远中颊根、腭根）”
  canalsBrief: string; // “通常 3–4 根管，近中颊根常有 MB2”
  /** 根管数目的统计分布（来自文献；没有可靠数据可省略），percent 合计约 100 */
  canalStats?: { label: string; percent: number }[];
  canalStatsSource?: string; // 统计数据来源（作者, 年份, 期刊）
  /** 发育时间（恒牙，以“岁/月”表示，撰写时取常用值，待对照教材核对） */
  development: {
    calcification: string; // 开始钙化
    crownComplete: string; // 牙冠完成
    eruption: string; // 萌出
    rootComplete: string; // 牙根完成
  };
  /** 平均尺寸（mm，应取教材测量值；未经核对的字段一律省略） */
  dimensions?: {
    crownLength?: number; // 冠长
    rootLength?: number; // 根长
    crownMD?: number; // 冠近远中径
    crownLabioLingual?: number; // 冠唇（颊）舌径
    cervicalMD?: number; // 颈部近远中径
    cervicalLabioLingual?: number; // 颈部唇（颊）舌径
  };
  function: string; // 功能
  /** 鉴别要点：与相似牙的区别、左右侧鉴别 */
  identification: string[];
  /** 临床意义 */
  clinical: string[];
  /** 常见变异 */
  variations?: string[];
}

// ----------------------------------------------------------------------------
// 解剖结构释义（骨、神经、血管、肌肉、关节、鼻窦、牙体组织、牙周组织……）
// ----------------------------------------------------------------------------

export interface StructureInfo {
  /** 基础 ID（不含 -left/-right 和牙位号），如 "inferior-alveolar-nerve"、"enamel"、"canal-mesiobuccal-1" */
  id: string;
  nameZh: string;
  nameEn: string;
  nameLatin?: string; // TA2 拉丁名
  category: CategoryId;
  /** 一句话定义 */
  summary: string;
  /** 详细说明（形态、位置、走行、毗邻、组成、功能等），每条一段 */
  details: string[];
  /** 临床意义（麻醉、手术、病变等） */
  clinical?: string[];
  /** 相关结构的基础 ID（用于“相关结构”跳转） */
  related?: string[];
}

/** 牙面解剖特征（牙尖、嵴、沟、窝等），用于单牙解剖时的标注 */
export interface SurfaceFeatureInfo {
  key: string; // 与 manifest 中 surfaceFeatures[].key 相同，如 "mesiobuccal-cusp"
  nameZh: string;
  nameEn: string;
  description: string; // 一两句：定义 + 位置 + 意义
}

/** 牙体标志点与颅骨标志点 */
export interface LandmarkInfo {
  key: string; // "apex" "apical-foramen" "cervical-line" "pulp-horn" "mental-foramen" ...
  nameZh: string;
  nameEn: string;
  description: string;
  clinical?: string;
}

/** 牙根名称（root label → 中文） */
export interface RootLabelInfo {
  key: string; // "mesiobuccal" "palatal" "single" ...
  nameZh: string;
  nameEn: string;
}

// ----------------------------------------------------------------------------
// 课程、题库、术语表
// ----------------------------------------------------------------------------

export interface LessonSection {
  heading: string;
  /** 正文。支持极简标记：空行分段；以 "- " 开头的行为列表项；**粗体**。 */
  body: string;
  /** 阅读此节时 3D 视图切换到的状态（可省略） */
  scene?: SceneSpec;
}

export interface Lesson {
  id: string; // "numbering" "tooth-types" ...
  order: number;
  title: string;
  subtitle: string;
  /** 预计学习时长（分钟） */
  minutes: number;
  /** 学习目标 */
  objectives: string[];
  sections: LessonSection[];
  /** 本课要点小结 */
  keyPoints: string[];
}

export type QuizTopic =
  | "numbering"
  | "tooth-morphology"
  | "dental-tissues"
  | "pulp-canals"
  | "periodontium"
  | "development"
  | "bones"
  | "tmj"
  | "nerves"
  | "vessels"
  | "muscles"
  | "sinus"
  | "clinical";

export interface QuizQuestion {
  id: string;
  topic: QuizTopic;
  /** 关联课程 id（可省略） */
  lessonId?: string;
  difficulty: 1 | 2 | 3;
  prompt: string;
  /** 4 个选项为宜 */
  options: string[];
  /** 正确选项下标（从 0 开始） */
  answer: number;
  /** 解析：为什么对、其他选项为什么错 */
  explanation: string;
  /** 答题时展示的 3D 场景（可省略） */
  scene?: SceneSpec;
}

export interface GlossaryTerm {
  zh: string;
  en: string;
  latin?: string;
  /** 分组，如 “牙体形态” “牙体组织” “牙周组织” “骨与关节” “神经血管” “临床” */
  group: string;
  definition: string;
}
