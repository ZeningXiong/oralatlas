// ============================================================================
// 题库：单选题，每题 4 个选项。answer 为正确选项下标（界面会打乱选项顺序，
// 因此解析中不使用 A/B/C/D 指代选项）。题目配的 scene 只设置图层、视角或剖切，
// 不选中结构、不显示标签，以免泄露答案。
// 【内容来源，如实说明】本文件由 AI（Claude）辅助编写，尚未经口腔专业人员逐条审校。
// 撰写时要求遵循国内《口腔解剖生理学》教材的描述体系与全国科学技术名词审定委员会的规范名词，
// 但编写过程中并未查阅任何教材原文；事实依据为模型的训练知识，并与 Dental Scope 项目的英文
// 教学文字（CC BY-SA 4.0）交叉核对过一部分。数值、发生率与临床参数尤其需要对照教材复核。
// ============================================================================
import type { QuizQuestion } from "./types";

export const QUIZ: QuizQuestion[] = [
  // --------------------------------------------------------------------------
  // 第 1 课 口腔颌面部概览
  // --------------------------------------------------------------------------
  {
    id: "ov-01",
    topic: "bones",
    lessonId: "overview",
    difficulty: 1,
    prompt: "面颅骨共有多少块？",
    options: ["8 块", "12 块", "15 块", "23 块"],
    answer: 2,
    explanation:
      "面颅骨共 15 块：成对的上颌骨、颧骨、鼻骨、泪骨、腭骨和下鼻甲（6 对共 12 块），加上单块的犁骨、下颌骨和舌骨。8 块是脑颅骨的数目；12 块只算了成对的骨；23 块是脑颅骨与面颅骨的总和。",
    scene: { view: "three-quarter", layers: ["maxilla", "mandible", "skull"] },
  },
  {
    id: "ov-02",
    topic: "clinical",
    lessonId: "overview",
    difficulty: 1,
    prompt: "腮腺导管在口腔内的开口（腮腺管乳头）位于：",
    options: ["平对上颌第一前磨牙的颊黏膜上", "平对下颌第二磨牙的颊黏膜上", "舌下肉阜", "平对上颌第二磨牙牙冠的颊黏膜上"],
    answer: 3,
    explanation:
      "腮腺管乳头位于平对上颌第二磨牙牙冠的颊黏膜上，是腮腺导管的开口。它位于上颌后牙区而不是前磨牙或下颌牙区；舌下肉阜在口底舌系带两侧，是下颌下腺导管和舌下腺大管的开口，并非腮腺导管开口。",
  },
  {
    id: "ov-03",
    topic: "clinical",
    lessonId: "overview",
    difficulty: 2,
    prompt: "闭口状态下，口腔前庭与固有口腔相通的部位是：",
    options: ["最后磨牙远中与翼下颌皱襞之间的间隙", "上、下唇之间的口裂", "上、下中切牙之间的间隙", "舌下区"],
    answer: 0,
    explanation:
      "闭口时上、下牙列紧密接触，口腔前庭只能借最后磨牙远中与翼下颌皱襞之间的间隙与固有口腔相通，牙关紧闭的患者可经此插管灌注流质。口裂通向口外而非固有口腔；中切牙之间闭口时没有恒定的通道；舌下区本身属于固有口腔。",
  },
  {
    id: "ov-04",
    topic: "bones",
    lessonId: "overview",
    difficulty: 1,
    prompt: "颌面部唯一能够活动的骨是：",
    options: ["上颌骨", "颧骨", "犁骨", "下颌骨"],
    answer: 3,
    explanation:
      "下颌骨借两侧髁突与颞骨构成颞下颌关节，能完成开闭口、前伸和侧方运动，是颌面部唯一能活动的骨。上颌骨、颧骨和犁骨都以骨缝与邻骨固定连接，不能活动。",
  },
  {
    id: "ov-05",
    topic: "clinical",
    lessonId: "overview",
    difficulty: 2,
    prompt: "口腔内翼下颌皱襞深面的结构是：",
    options: ["翼内肌", "腭舌肌", "翼下颌韧带", "颞肌腱"],
    answer: 2,
    explanation:
      "翼下颌皱襞是从上颌结节后内方延伸到磨牙后垫后方的黏膜皱襞，其深面为翼下颌韧带，颊肌和咽上缩肌分别附着于该韧带的前、后缘。它是下牙槽神经阻滞麻醉的重要标志。翼内肌位于翼下颌间隙内侧，并非皱襞的直接深面结构；腭舌肌构成腭舌弓；颞肌腱止于喙突。",
  },
  {
    id: "ov-06",
    topic: "muscles",
    lessonId: "overview",
    difficulty: 1,
    prompt: "口轮匝肌、颊肌等表情肌的运动神经支配来自：",
    options: ["三叉神经", "舌下神经", "舌咽神经", "面神经"],
    answer: 3,
    explanation:
      "表情肌由面神经（Ⅶ）支配，面神经损伤可出现口角歪斜、鼓腮漏气等表现。三叉神经的下颌神经支配咀嚼肌而不是表情肌；舌下神经支配舌肌；舌咽神经主要分布于咽部。颊肌虽在咀嚼时把食物保持在牙列之间，但属于表情肌。",
  },
  {
    id: "ov-07",
    topic: "nerves",
    lessonId: "overview",
    difficulty: 1,
    prompt: "面部皮肤、牙和口腔黏膜的一般感觉主要由哪一对脑神经传导？",
    options: ["面神经", "三叉神经", "迷走神经", "舌下神经"],
    answer: 1,
    explanation:
      "三叉神经是颌面部最主要的感觉神经：上颌神经分布于上颌牙，下颌神经分布于下颌牙，眼神经分布于额部等。面神经主要是表情肌的运动神经；迷走神经分布于咽喉和胸腹腔脏器；舌下神经是舌肌的运动神经。",
  },
  {
    id: "ov-08",
    topic: "vessels",
    lessonId: "overview",
    difficulty: 2,
    prompt: "关于口腔颌面部血供的特点，错误的是：",
    options: ["动脉血供主要来自颈外动脉", "血供丰富，伤口愈合较快", "抗感染能力较强", "因血供丰富，外伤后出血通常较少"],
    answer: 3,
    explanation:
      "颌面部动脉主要来自颈外动脉，血管丰富且吻合广泛，因此组织愈合快、抗感染能力强；但同样由于血供丰富，外伤和手术时出血较多，而不是较少。其余三项均为正确描述。",
  },
  {
    id: "ov-09",
    topic: "bones",
    lessonId: "overview",
    difficulty: 2,
    prompt: "以经过眉间点和鼻下点的两条水平线将颜面部三等分，“颌面部”是指：",
    options: ["上 1/3", "中 1/3", "下 1/3", "中 1/3 和下 1/3"],
    answer: 3,
    explanation:
      "上 1/3（发际至眉间点）为颅面部，中 1/3（眉间点至鼻下点）和下 1/3（鼻下点至颏下点）合称颌面部。只选中 1/3 或只选下 1/3 都不完整，上 1/3 则属于颅面部。",
  },
  {
    id: "ov-10",
    topic: "bones",
    lessonId: "overview",
    difficulty: 2,
    prompt: "硬腭的骨性构成是：",
    options: ["全部由上颌骨腭突构成", "前 1/2 由上颌骨腭突、后 1/2 由腭骨水平板构成", "前 3/4 由上颌骨腭突、后 1/4 由腭骨水平板构成", "由犁骨和腭骨共同构成"],
    answer: 2,
    explanation:
      "两侧上颌骨腭突构成硬腭的前 3/4，腭骨水平板构成后 1/4。“全部由腭突构成”和“各占一半”的比例都不正确；犁骨参与构成鼻中隔，不参与构成硬腭。",
    scene: { view: "occlusal-upper", layers: ["teeth", "maxilla", "skull"] },
  },
  {
    id: "ov-11",
    topic: "clinical",
    lessonId: "overview",
    difficulty: 1,
    prompt: "位于上、下唇中线处的黏膜皱襞是：",
    options: ["颊系带", "唇系带", "翼下颌皱襞", "舌系带"],
    answer: 1,
    explanation:
      "唇系带位于上、下唇的中线；颊系带位于尖牙或前磨牙区；翼下颌皱襞位于磨牙后方；舌系带位于舌腹中线，属于固有口腔。制作义齿基托时需要让开唇系带和颊系带。",
  },
  {
    id: "ov-12",
    topic: "muscles",
    lessonId: "overview",
    difficulty: 2,
    prompt: "下列属于咀嚼肌的是：",
    options: ["颊肌", "口轮匝肌", "颏肌", "翼外肌"],
    answer: 3,
    explanation:
      "咀嚼肌包括咬肌、颞肌、翼内肌和翼外肌，均由三叉神经的下颌神经支配。颊肌、口轮匝肌和颏肌都是由面神经支配的表情肌；颊肌虽参与咀嚼时的食物控制，但不属于咀嚼肌。",
    scene: { view: "right", layers: ["muscles", "mandible", "skull"], ghost: ["skull"] },
  },

  // --------------------------------------------------------------------------
  // 第 2 课 牙位记录法
  // --------------------------------------------------------------------------
  {
    id: "num-01",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 1,
    prompt: "FDI 记录法中，“36”表示：",
    options: ["上颌左侧第一磨牙", "下颌右侧第一磨牙", "下颌左侧第一磨牙", "上颌右侧第一磨牙"],
    answer: 2,
    explanation:
      "十位数 3 表示下颌左侧象限，个位数 6 表示第一磨牙，36 即下颌左侧第一磨牙，读作“三六”。上颌左侧第一磨牙为 26，下颌右侧第一磨牙为 46，上颌右侧第一磨牙为 16。",
  },
  {
    id: "num-02",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 1,
    prompt: "FDI 记录法中，恒牙第 4 象限是：",
    options: ["上颌右侧", "上颌左侧", "下颌左侧", "下颌右侧"],
    answer: 3,
    explanation:
      "FDI 恒牙象限从医师面对患者的视角顺时针排列：1 上颌右侧、2 上颌左侧、3 下颌左侧、4 下颌右侧。常见错误是把第 3、4 象限记反。",
    scene: { view: "front", layers: ["teeth"] },
  },
  {
    id: "num-03",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 2,
    prompt: "FDI 36 用通用编号法表示为：",
    options: ["#3", "#19", "#14", "#30"],
    answer: 1,
    explanation:
      "第 3 象限（下颌左侧）的换算规律为通用号 = 25 − n，36 → 25 − 6 = #19。#3 是上颌右侧第一磨牙（16），#14 是上颌左侧第一磨牙（26），#30 是下颌右侧第一磨牙（46）。",
    scene: { view: "occlusal-lower", layers: ["teeth"] },
  },
  {
    id: "num-04",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 2,
    prompt: "通用编号 #8 对应的 FDI 编号是：",
    options: ["11", "21", "18", "41"],
    answer: 0,
    explanation:
      "通用编号 #1–#8 依次为上颌右侧第三磨牙到上颌右侧中切牙，#8 即上颌右侧中切牙 = FDI 11。#9 才是上颌左侧中切牙（21）；FDI 18 对应 #1；下颌右侧中切牙 41 对应 #25。",
  },
  {
    id: "num-05",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 2,
    prompt: "通用编号 #17 表示：",
    options: ["下颌右侧第三磨牙", "上颌左侧第三磨牙", "下颌左侧第三磨牙", "下颌左侧中切牙"],
    answer: 2,
    explanation:
      "通用编号从上颌右侧第三磨牙 #1 起顺时针排列：#16 为上颌左侧第三磨牙，随后转到下颌左侧，#17 为下颌左侧第三磨牙（FDI 38），#24 为下颌左侧中切牙，#32 为下颌右侧第三磨牙。",
  },
  {
    id: "num-06",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 2,
    prompt: "部位记录法“┌6”表示：",
    options: ["上颌右侧第一磨牙", "上颌左侧第一磨牙", "下颌右侧第一磨牙", "下颌左侧第一磨牙"],
    answer: 3,
    explanation:
      "“十”字符号中横线代表咬合平面、竖线代表中线，书写时如同面对患者。“┌”的横线在牙号上方、竖线在牙号左侧，表示下颌、患者左侧，即下颌左侧第一磨牙（FDI 36，#19，Palmer LL6）。上颌右侧写作 6┘，上颌左侧写作 └6，下颌右侧写作 6┐。",
  },
  {
    id: "num-07",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 1,
    prompt: "FDI 乳牙编号“55”表示：",
    options: ["上颌右侧第二乳磨牙", "上颌右侧第二前磨牙", "下颌右侧第二乳磨牙", "上颌左侧第二乳磨牙"],
    answer: 0,
    explanation:
      "乳牙象限为 5–8：5 上颌右侧、6 上颌左侧、7 下颌左侧、8 下颌右侧；乳牙个位数 5 为第二乳磨牙，所以 55 是上颌右侧第二乳磨牙。上颌右侧第二前磨牙是恒牙 15；下颌右侧第二乳磨牙为 85；上颌左侧第二乳磨牙为 65。",
  },
  {
    id: "num-08",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 2,
    prompt: "通用编号法中的乳牙“K”对应 FDI 编号：",
    options: ["65", "85", "75", "71"],
    answer: 2,
    explanation:
      "通用编号法乳牙 A–T 也按顺时针排列：A（55）至 J（65）为上颌右侧到左侧，随后 K 为下颌左侧第二乳磨牙（75），O 为下颌左侧乳中切牙（71），T 为下颌右侧第二乳磨牙（85）。",
  },
  {
    id: "num-09",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 3,
    prompt: "下颌右侧第二前磨牙的 FDI 编号、通用编号和 Palmer 记法依次为：",
    options: ["35、#20、LL5", "45、#29、LR5", "45、#20、LR5", "44、#28、LR4"],
    answer: 1,
    explanation:
      "下颌右侧为 FDI 第 4 象限，第二前磨牙为 45；通用号 = 24 + 5 = #29；Palmer 记为 LR5（部位记录法 5┐）。35、#20、LL5 是下颌左侧第二前磨牙；#20 不对应 45；44、#28、LR4 是下颌右侧第一前磨牙。",
  },
  {
    id: "num-10",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 3,
    prompt: "一份美国转诊单写着“#14 近中龋”，按 FDI 记录法应记为：",
    options: ["14", "24", "26", "16"],
    answer: 2,
    explanation:
      "#9–#16 为上颌左侧中切牙到第三磨牙，通用号 = 8 + n，#14 → n = 6，即上颌左侧第一磨牙 FDI 26。直接照抄成 14 是最常见的错误（FDI 14 是上颌右侧第一前磨牙）；16 对应 #3；24 对应 #12。",
  },
  {
    id: "num-11",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 2,
    prompt: "Palmer 记法 UR3 对应的 FDI 编号和通用编号分别为：",
    options: ["13、#6", "23、#11", "13、#11", "43、#27"],
    answer: 0,
    explanation:
      "UR3 为上颌右侧尖牙：FDI 第 1 象限第 3 颗牙为 13，通用号 = 9 − 3 = #6。23、#11 是上颌左侧尖牙；#11 与 13 不对应；43、#27 是下颌右侧尖牙。",
  },
  {
    id: "num-12",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 1,
    prompt: "关于牙位记录中的“左”“右”，正确的是：",
    options: ["指检查者的左、右", "上颌以检查者为准，下颌以患者为准", "指患者的左、右", "不同记录法的规定不同"],
    answer: 2,
    explanation:
      "各种牙位记录法中的左、右都指患者本人的左、右，这一点在不同方法之间是一致的。医师面对患者时，患者的右侧位于医师的左手边，记录时不能按检查者的方位书写。",
  },
  {
    id: "num-13",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 2,
    prompt: "我国教材的部位记录法中，“Ⅴ┘”表示：",
    options: ["上颌右侧第二前磨牙", "上颌右侧第二乳磨牙", "上颌左侧第二乳磨牙", "下颌右侧第二乳磨牙"],
    answer: 1,
    explanation:
      "部位记录法中恒牙用阿拉伯数字、乳牙用罗马数字，Ⅴ 为第二乳磨牙；“┘”表示右上区，因此 Ⅴ┘ 为上颌右侧第二乳磨牙（FDI 55）。上颌右侧第二前磨牙写作 5┘；上颌左侧第二乳磨牙为 └Ⅴ；下颌右侧第二乳磨牙为 Ⅴ┐。",
  },
  {
    id: "num-14",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 3,
    prompt: "一名 8 岁儿童，与上颌右侧第一恒磨牙近中面相邻的牙用 FDI 记录法记为：",
    options: ["15", "54", "65", "55"],
    answer: 3,
    explanation:
      "上颌第二前磨牙一般 10–12 岁才萌出，8 岁时第一恒磨牙（16）近中相邻的是上颌右侧第二乳磨牙，即 55。15 是尚未萌出的第二前磨牙；54 是第一乳磨牙，与 16 不相邻；65 位于上颌左侧。",
  },
  {
    id: "num-15",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 2,
    prompt: "通用编号法中，下颌右侧第一磨牙的编号是：",
    options: ["#19", "#30", "#3", "#31"],
    answer: 1,
    explanation:
      "下颌右侧为 #25–#32（中切牙到第三磨牙），通用号 = 24 + n，第一磨牙 46 → #30。#19 是下颌左侧第一磨牙（36），#3 是上颌右侧第一磨牙（16），#31 是下颌右侧第二磨牙（47）。",
  },
  {
    id: "num-16",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 3,
    prompt: "通用编号法中，上颌左侧尖牙的编号是：",
    options: ["#6", "#22", "#27", "#11"],
    answer: 3,
    explanation:
      "上颌左侧为 #9–#16，通用号 = 8 + n，尖牙 23 → #11。注意 #11 与 FDI 11（上颌右侧中切牙）完全不同，书写时应加“#”区分。#6 是上颌右侧尖牙，#22 是下颌左侧尖牙，#27 是下颌右侧尖牙。",
    scene: { view: "occlusal-upper", layers: ["teeth"] },
  },
  {
    id: "num-17",
    topic: "numbering",
    lessonId: "numbering",
    difficulty: 2,
    prompt: "英文 Palmer 记法中，“LLD”表示：",
    options: ["下颌左侧第一乳磨牙", "下颌左侧乳尖牙", "下颌左侧第二乳磨牙", "下颌左侧乳侧切牙"],
    answer: 0,
    explanation:
      "Palmer 法乳牙用字母 A–E：A 乳中切牙、B 乳侧切牙、C 乳尖牙、D 第一乳磨牙、E 第二乳磨牙，因此 LLD 为下颌左侧第一乳磨牙（FDI 74，通用编号 L）。乳尖牙为 LLC，第二乳磨牙为 LLE，乳侧切牙为 LLB。注意通用编号法中字母的含义与此不同。",
  },
  // --------------------------------------------------------------------------
  // 第 3 课 牙的分类、功能与应用名词
  // --------------------------------------------------------------------------
  {
    id: "ter-01",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 1,
    prompt: "解剖牙冠与临床牙冠的划分界线分别是：",
    options: ["龈缘；釉牙骨质界", "釉牙骨质界；龈缘", "牙槽嵴顶；龈缘", "釉牙骨质界；牙槽嵴顶"],
    answer: 1,
    explanation:
      "解剖牙冠是被釉质覆盖的部分，以釉牙骨质界（颈线）为界；临床牙冠是暴露于口腔的部分，以龈缘为界。牙槽嵴顶是骨的标志，不用于划分牙冠。",
  },
  {
    id: "ter-02",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 2,
    prompt: "牙龈退缩、牙根暴露的老年患者，其临床牙冠与解剖牙冠相比通常：",
    options: ["临床牙冠较小", "两者相等", "临床牙冠较大", "无法比较"],
    answer: 2,
    explanation:
      "牙龈退缩后龈缘移向根方，暴露于口腔的部分除整个解剖牙冠外还包括部分牙根，因此临床牙冠大于解剖牙冠。年轻人牙龈位置偏冠方，临床牙冠常小于解剖牙冠。",
  },
  {
    id: "ter-03",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 1,
    prompt: "牙冠上与牙体长轴大致平行的面统称为：",
    options: ["轴面", "邻面", "咬合面", "切嵴"],
    answer: 0,
    explanation:
      "唇（颊）面、舌（腭）面、近中面和远中面都与牙体长轴大致平行，统称轴面。邻面只包括近中面和远中面；咬合面和切嵴位于牙冠的咬合端，与长轴大致垂直。",
  },
  {
    id: "ter-04",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 2,
    prompt: "前牙唇面和舌面的外形高点位于：",
    options: ["切 1/3", "中 1/3", "颈 1/3", "唇面在中 1/3，舌面在颈 1/3"],
    answer: 2,
    explanation:
      "前牙唇、舌面的外形高点均在颈 1/3（舌面即舌面隆突处），后牙颊面也在颈 1/3，只有后牙舌面在中 1/3。外形高点使咀嚼时食物顺牙面滑过，对牙龈起适度按摩作用。",
  },
  {
    id: "ter-05",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 2,
    prompt: "后牙舌面的外形高点一般位于：",
    options: ["颈 1/3", "中 1/3", "咬合 1/3", "根尖 1/3"],
    answer: 1,
    explanation:
      "后牙舌面的外形高点位于中 1/3，而后牙颊面和前牙唇、舌面的外形高点位于颈 1/3。根尖 1/3 属于牙根，不存在牙冠的外形高点。",
  },
  {
    id: "ter-06",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 2,
    prompt: "关于接触区，错误的是：",
    options: ["越往后的磨牙，接触区越靠近咬合缘", "是相邻两牙邻面相互接触的部位", "前牙接触区靠近切缘", "良好的接触可防止食物嵌塞"],
    answer: 0,
    explanation:
      "前牙接触区靠近切缘，后牙接触区靠近咬合缘，但越往后的牙越接近中 1/3，即接触区向牙颈方向移动，而不是更靠近咬合缘。正常接触区可防止食物嵌塞，并使邻牙相互支持、分散咀嚼力。",
  },
  {
    id: "ter-07",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 2,
    prompt: "正常情况下由龈乳头充满的楔状隙是：",
    options: ["唇楔状隙", "舌楔状隙", "切楔状隙", "龈楔状隙"],
    answer: 3,
    explanation:
      "龈楔状隙位于接触区的根方，健康时由龈乳头充满。唇（颊）楔状隙、舌楔状隙和切（咬合）楔状隙开放于口腔，是咀嚼时食物的排溢通道，有利于自洁。",
    scene: { view: "front", layers: ["teeth", "gingiva"] },
  },
  {
    id: "ter-08",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 1,
    prompt: "颈线（釉牙骨质界）在邻面的弯曲方向是：",
    options: ["凸向根方", "凸向切（咬合）方", "呈水平直线", "凸向舌侧"],
    answer: 1,
    explanation:
      "颈线在唇（颊）、舌面凸向根方，在近中、远中面则凸向切方或咬合方，前牙邻面的弯曲度最大，越往后牙弯曲越小。它并不是一条水平直线。",
  },
  {
    id: "ter-09",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 2,
    prompt: "横嵴是哪颗牙咬合面的重要解剖标志？",
    options: ["上颌第一前磨牙", "下颌第一前磨牙", "上颌第一磨牙", "下颌第二磨牙"],
    answer: 1,
    explanation:
      "下颌第一前磨牙的颊尖三角嵴与舌尖三角嵴相连，横过咬合面形成横嵴，这是它的重要标志。上颌第一磨牙的特征是斜嵴；上颌第一前磨牙和下颌第二磨牙没有横嵴。",
  },
  {
    id: "ter-10",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 1,
    prompt: "前牙舌面颈 1/3 处的半月形隆起称为：",
    options: ["切缘结节", "边缘嵴", "舌轴嵴", "舌面隆突"],
    answer: 3,
    explanation:
      "舌面隆突是前牙舌面颈 1/3 处的半月形隆起。切缘结节位于新萌出切牙的切缘；边缘嵴位于舌面的近、远中边缘；舌轴嵴是尖牙舌面由牙尖伸向舌面隆突的纵嵴。",
  },
  {
    id: "ter-11",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 2,
    prompt: "关于牙冠的窝、沟和点隙，正确的是：",
    options: ["点隙是牙尖顶上的凹陷", "钙化不全、深而窄的沟称为裂", "窝只存在于后牙咬合面", "发育沟是牙冠表面的釉质隆起"],
    answer: 1,
    explanation:
      "钙化不全、深而窄的沟称为裂，与点隙一样是龋病的好发部位。点隙位于发育沟的汇合处或末端，而不在牙尖顶；前牙舌面也有窝（舌窝）；发育沟是生长叶融合处的线形凹陷，而不是隆起。",
  },
  {
    id: "ter-12",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 3,
    prompt: "“近中唇切点角”由哪三个面相交形成？",
    options: ["近中面、唇面和切嵴", "近中面、舌面和切嵴", "远中面、唇面和切嵴", "近中面、唇面和远中面"],
    answer: 0,
    explanation:
      "点角由牙冠的三个面相交成一点，名称就是这三个面的组合：近中唇切点角由近中面、唇面和切嵴相交而成。含舌面的是近中舌切点角，含远中面的是远中唇切点角；近中面与远中面位于牙冠两侧，互不相交。",
  },
  {
    id: "ter-13",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 3,
    prompt: "楔状隙的生理意义不包括：",
    options: ["作为咀嚼时食物的排溢通道", "有利于牙面自洁", "使相邻两牙之间完全不发生接触", "龈楔状隙由龈乳头充满，保护牙槽骨和邻面"],
    answer: 2,
    explanation:
      "楔状隙是相邻牙接触区周围的 V 形空隙，以邻牙之间存在正常接触区为前提，并不是让邻牙互不接触。它是食物的排溢通道，有利于自洁；龈楔状隙由龈乳头充满，可保护其下方的牙槽骨和邻面。",
  },
  {
    id: "ter-14",
    topic: "tooth-morphology",
    lessonId: "terminology",
    difficulty: 1,
    prompt: "下列关于牙的分类，正确的是：",
    options: ["前磨牙属于前牙", "尖牙属于后牙", "切牙和尖牙合称前牙", "乳牙列中有前磨牙"],
    answer: 2,
    explanation:
      "切牙和尖牙合称前牙，前磨牙和磨牙合称后牙。乳牙列由乳切牙、乳尖牙和乳磨牙组成，没有前磨牙；前磨牙是替换乳磨牙的恒牙。",
  },

  // --------------------------------------------------------------------------
  // 第 4 课 切牙与尖牙
  // --------------------------------------------------------------------------
  {
    id: "ant-01",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 1,
    prompt: "全口牙中牙根最长的牙是：",
    options: ["上颌中切牙", "下颌尖牙", "上颌第一磨牙", "上颌尖牙"],
    answer: 3,
    explanation:
      "上颌尖牙的牙根粗壮而长，是全口牙中最长的牙根，因此支持力强、常保留到晚年。下颌尖牙的牙根较上颌尖牙稍短；上颌中切牙和上颌第一磨牙的各个牙根都短于上颌尖牙。",
  },
  {
    id: "ant-02",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 1,
    prompt: "全口恒牙中体积最小的牙是：",
    options: ["上颌侧切牙", "下颌侧切牙", "下颌中切牙", "上颌第三磨牙"],
    answer: 2,
    explanation:
      "下颌中切牙牙冠窄小，是全口恒牙中体积最小的牙。下颌侧切牙比中切牙稍大；上颌侧切牙和上颌第三磨牙虽常有变小的变异，但一般仍大于下颌中切牙。",
  },
  {
    id: "ant-03",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 2,
    prompt: "判断上颌中切牙左右的主要依据是：",
    options: ["近中切角近似直角，远中切角圆钝", "远中切角近似直角，近中切角圆钝", "近、远中切角对称，只能看牙根", "舌窝明显偏向远中"],
    answer: 0,
    explanation:
      "上颌中切牙近中切角近似直角、远中切角略圆钝，唇面近中缘较直、远中缘较突，根尖略偏远中，据此可判断左右。远中切角并非直角；近远中对称、难以辨别左右的是下颌中切牙。",
  },
  {
    id: "ant-04",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 2,
    prompt: "下颌中切牙左右难以区分，可作为参考的特征是：",
    options: ["近中切角明显圆钝", "牙根明显弯向近中", "唇面发育沟偏向远中", "远中根面的长形凹陷较近中根面深"],
    answer: 3,
    explanation:
      "下颌中切牙近、远中切角大致相等，牙冠近远中对称，左右难辨；其牙根近、远中面都有长形凹陷，远中面的凹陷较深，可作为区分左右的参考。它的近中切角并不圆钝，唇面光滑、发育沟不明显，牙根也不明显弯向近中。",
  },
  {
    id: "ant-05",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 2,
    prompt: "上颌尖牙唇面牙尖的特点是：",
    options: ["近中斜缘短，远中斜缘长", "近中斜缘长，远中斜缘短", "近、远中斜缘等长", "没有明显的牙尖"],
    answer: 0,
    explanation:
      "上颌尖牙的牙尖由近中斜缘和远中斜缘相交而成，近中斜缘短、远中斜缘长，因此牙尖顶偏近中，这是辨别左右的依据之一。“近中斜缘长于远中斜缘”是上颌第一前磨牙颊尖的特点，二者不要混淆。",
  },
  {
    id: "ant-06",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 2,
    prompt: "下颌尖牙与上颌尖牙相比，正确的是：",
    options: ["牙冠更宽大", "牙尖更锐利", "唇面近中缘与牙根近中缘几乎连成一直线", "舌面舌轴嵴更明显"],
    answer: 2,
    explanation:
      "下颌尖牙牙冠窄而长，唇面近中缘长而直，与牙根近中缘几乎连成一直线；牙尖较圆钝，舌面舌轴嵴和边缘嵴均不如上颌尖牙明显。牙冠宽大、牙尖锐利、舌面嵴突明显都是上颌尖牙的特点。",
  },
  {
    id: "ant-07",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 2,
    prompt: "最常出现锥形牙、先天缺失以及畸形舌侧窝、畸形舌侧沟等变异的前牙是：",
    options: ["上颌中切牙", "上颌侧切牙", "下颌中切牙", "下颌尖牙"],
    answer: 1,
    explanation:
      "上颌侧切牙是除第三磨牙外形态变异最多的牙，常见锥形侧切牙、先天缺失、畸形舌侧窝和畸形舌侧沟。上颌中切牙、下颌中切牙和下颌尖牙的形态相对稳定。",
  },
  {
    id: "ant-08",
    topic: "clinical",
    lessonId: "anterior-teeth",
    difficulty: 3,
    prompt: "上颌侧切牙有越过舌面隆突、延伸至根面的畸形舌侧沟时，最可能导致：",
    options: ["沿沟形成深而窄的牙周袋，并可继发牙髓感染", "牙根外吸收", "牙冠变色", "牙列间隙增大"],
    answer: 0,
    explanation:
      "畸形舌侧沟处菌斑易滞留、不易清洁，沟延至根面时可沿沟形成深而窄的牙周袋，感染还可波及牙髓，形成牙髓-牙周联合病变。牙根外吸收、牙冠变色和牙列间隙增大都不是畸形舌侧沟的典型后果。",
  },
  {
    id: "ant-09",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 2,
    prompt: "关于上、下颌切牙的区别，错误的是：",
    options: ["上颌切牙牙冠宽大，下颌切牙牙冠窄小", "上颌切牙舌窝深，下颌切牙舌窝浅", "下颌切牙唇面较光滑，发育沟不明显", "上颌切牙牙根扁窄，下颌切牙牙根粗圆"],
    answer: 3,
    explanation:
      "上颌切牙牙根粗壮，颈部横断面近圆三角形；下颌切牙牙根窄而扁，唇舌径大于近远中径。“上颌切牙牙根扁窄，下颌切牙牙根粗圆”正好把二者说反了，其余三项都是正确的鉴别要点。",
  },
  {
    id: "ant-10",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 1,
    prompt: "新萌出的上颌中切牙切缘上常可见的三个小突起称为：",
    options: ["切缘结节", "舌面隆突", "卡氏尖", "边缘嵴"],
    answer: 0,
    explanation:
      "新萌出切牙的切缘有 3 个小突起，称切缘结节，随咀嚼磨耗逐渐消失。舌面隆突位于舌面颈 1/3；卡氏尖见于上颌第一磨牙近中舌尖的舌侧；边缘嵴位于舌面的近、远中边缘。",
  },
  {
    id: "ant-11",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 2,
    prompt: "上颌中切牙邻面接触区的位置是：",
    options: ["近中、远中均位于中 1/3", "近中在颈 1/3，远中在切 1/3", "近中、远中均位于颈 1/3", "近中在切 1/3 靠近切角，远中在切 1/3 距切角稍远"],
    answer: 3,
    explanation:
      "前牙接触区靠近切缘：上颌中切牙近中接触区在切 1/3 靠近切角处，远中接触区也在切 1/3，但距切角稍远。接触区不在中 1/3 或颈 1/3，颈 1/3 是唇、舌面外形高点所在的部位。",
  },
  {
    id: "ant-12",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 3,
    prompt: "一颗离体前牙为单根，牙冠窄长，舌面平坦光滑，唇面近中缘与牙根近中缘几乎成一直线，牙尖的近中斜缘明显短于远中斜缘。它最可能是：",
    options: ["上颌尖牙", "下颌尖牙", "上颌侧切牙", "下颌第一前磨牙"],
    answer: 1,
    explanation:
      "有一个牙尖且近中斜缘短于远中斜缘，说明是尖牙；牙冠窄长、舌面平坦、唇面近中缘与牙根近中缘连成直线，是下颌尖牙的特征。上颌尖牙牙冠宽大、舌面嵴突明显；侧切牙没有牙尖；下颌第一前磨牙虽似小尖牙，但咬合面有横嵴和舌尖。",
  },
  {
    id: "ant-13",
    topic: "clinical",
    lessonId: "anterior-teeth",
    difficulty: 2,
    prompt: "上颌尖牙常被选作修复体的基牙，主要原因是：",
    options: ["牙冠最宽", "髓腔最小", "牙根粗壮且最长，支持力强", "萌出最早"],
    answer: 2,
    explanation:
      "上颌尖牙牙根是全口最长的牙根，粗壮稳固，又位于牙弓转角处，常保留到晚年，因此是理想的基牙。它的牙冠并非最宽（上颌中切牙更宽）；髓腔大小不是选择基牙的主要依据；上颌尖牙 11–12 岁才萌出，属于萌出较晚的恒牙。",
  },
  {
    id: "ant-14",
    topic: "tooth-morphology",
    lessonId: "anterior-teeth",
    difficulty: 2,
    prompt: "上颌侧切牙与上颌中切牙相比，正确的是：",
    options: ["近远中径更大", "舌窝更浅", "根长与冠长之比更小", "远中切角圆钝更明显"],
    answer: 3,
    explanation:
      "上颌侧切牙较小，近中切角似锐角，远中切角呈圆弧形，圆钝程度比中切牙更明显；其舌窝窄而深，根长与冠长之比大于中切牙。近远中径更大的是中切牙。",
  },
  // --------------------------------------------------------------------------
  // 第 5 课 前磨牙
  // --------------------------------------------------------------------------
  {
    id: "pm-01",
    topic: "tooth-morphology",
    lessonId: "premolars",
    difficulty: 1,
    prompt: "下颌第一前磨牙咬合面最显著的解剖特征是：",
    options: ["横嵴", "斜嵴", "卡氏尖", "近中沟越过近中边缘嵴"],
    answer: 0,
    explanation:
      "下颌第一前磨牙颊尖三角嵴与舌尖三角嵴相连形成横嵴，是其最重要的标志。斜嵴和卡氏尖是上颌第一磨牙的特征；近中沟越过近中边缘嵴是上颌第一前磨牙的特征。",
  },
  {
    id: "pm-02",
    topic: "tooth-morphology",
    lessonId: "premolars",
    difficulty: 2,
    prompt: "颊尖偏远中、近中斜缘长于远中斜缘的前磨牙是：",
    options: ["上颌第一前磨牙", "上颌第二前磨牙", "下颌第一前磨牙", "下颌第二前磨牙"],
    answer: 0,
    explanation:
      "上颌第一前磨牙颊尖略偏远中，近中斜缘长于远中斜缘，与尖牙和其他前磨牙相反，是重要的鉴别要点。上颌第二前磨牙颊尖多位于中央或略偏近中；下颌第一前磨牙颊尖顶略偏近中。",
  },
  {
    id: "pm-03",
    topic: "tooth-morphology",
    lessonId: "premolars",
    difficulty: 2,
    prompt: "近中面颈部有明显凹陷并延续至牙根的牙是：",
    options: ["上颌尖牙", "上颌第二前磨牙", "下颌第一前磨牙", "上颌第一前磨牙"],
    answer: 3,
    explanation:
      "上颌第一前磨牙近中面近颈部有明显凹陷，并延续到牙根近中面，此处菌斑不易清洁，修复和牙周治疗时要注意。上颌第二前磨牙近中面颈部无明显凹陷，这是二者的鉴别点之一；上颌尖牙和下颌第一前磨牙也没有这一特征。",
  },
  {
    id: "pm-04",
    topic: "tooth-morphology",
    lessonId: "premolars",
    difficulty: 1,
    prompt: "多为颊、舌双根的前磨牙是：",
    options: ["上颌第二前磨牙", "上颌第一前磨牙", "下颌第一前磨牙", "下颌第二前磨牙"],
    answer: 1,
    explanation:
      "上颌第一前磨牙多在根中或根尖 1/3 处分为颊、舌两根，少数为单根，偶见三根。上颌第二前磨牙多为单根；下颌前磨牙一般为单根。",
  },
  {
    id: "pm-05",
    topic: "tooth-morphology",
    lessonId: "premolars",
    difficulty: 2,
    prompt: "下颌第二前磨牙三尖型咬合面的发育沟呈：",
    options: ["H 形", "U 形", "Y 形", "十字形"],
    answer: 2,
    explanation:
      "三尖型下颌第二前磨牙有一个颊尖和两个舌尖，发育沟呈 Y 形，近中舌尖大于远中舌尖；二尖型的发育沟呈 H 形或 U 形。“十”字形沟是下颌第二磨牙的特征。",
  },
  {
    id: "pm-06",
    topic: "tooth-morphology",
    lessonId: "premolars",
    difficulty: 1,
    prompt: "前磨牙中体积最小的是：",
    options: ["上颌第一前磨牙", "上颌第二前磨牙", "下颌第一前磨牙", "下颌第二前磨牙"],
    answer: 2,
    explanation:
      "下颌第一前磨牙是前磨牙中体积最小的牙，颊尖长大、舌尖短小，颇似小尖牙。上颌第一前磨牙则是前磨牙中体积最大的；下颌第二前磨牙较下颌第一前磨牙大。",
  },
  {
    id: "pm-07",
    topic: "clinical",
    lessonId: "premolars",
    difficulty: 2,
    prompt: "畸形中央尖最多见于：",
    options: ["上颌第一前磨牙", "上颌第二前磨牙", "下颌第一前磨牙", "下颌第二前磨牙"],
    answer: 3,
    explanation:
      "畸形中央尖最多见于下颌第二前磨牙，其次为下颌第一前磨牙和上颌前磨牙，常左右对称出现。上颌前磨牙虽也可发生，但较下颌少见。",
  },
  {
    id: "pm-08",
    topic: "tooth-morphology",
    lessonId: "premolars",
    difficulty: 3,
    prompt: "关于上颌第一前磨牙与上颌第二前磨牙的鉴别，错误的是：",
    options: ["第一前磨牙颊尖明显大于舌尖，第二前磨牙两尖大小相近", "第一前磨牙多为双根，第二前磨牙多为单根", "第一前磨牙咬合面中央沟较短、副沟多", "第一前磨牙近中面颈部有凹陷"],
    answer: 2,
    explanation:
      "上颌第一前磨牙咬合面中央沟较长；中央沟短而副沟多是上颌第二前磨牙的特点，“第一前磨牙中央沟较短、副沟多”把二者说反了。其余三项都是正确的鉴别要点。",
  },
  {
    id: "pm-09",
    topic: "tooth-morphology",
    lessonId: "premolars",
    difficulty: 2,
    prompt: "下颌第一前磨牙的横嵴将咬合面分为：",
    options: ["较小的近中窝和较大的远中窝", "较大的近中窝和较小的远中窝", "大小相等的两个窝", "中央窝和远中窝"],
    answer: 0,
    explanation:
      "下颌第一前磨牙的横嵴将咬合面分为较小的近中窝和较大的远中窝。“中央窝和远中窝”是上颌第一磨牙被斜嵴分隔的两个窝，不要与前磨牙混淆。",
  },
  {
    id: "pm-10",
    topic: "tooth-morphology",
    lessonId: "premolars",
    difficulty: 2,
    prompt: "关于下颌前磨牙，正确的是：",
    options: ["牙冠向颊侧倾斜", "多为三根", "舌尖均高于颊尖", "牙冠向舌侧倾斜"],
    answer: 3,
    explanation:
      "下颌前磨牙牙冠明显向舌侧倾斜，下颌第一前磨牙的颊尖顶几乎位于牙根长轴的延长线上。下颌前磨牙一般为单根；其舌尖低于颊尖，下颌第一前磨牙的舌尖尤其短小。",
  },
  {
    id: "pm-11",
    topic: "clinical",
    lessonId: "premolars",
    difficulty: 2,
    prompt: "颏孔通常位于：",
    options: ["下颌第二前磨牙根尖下方，或第一、二前磨牙之间的下方", "下颌尖牙根尖下方", "下颌第一磨牙远中根下方", "下颌中切牙根尖下方"],
    answer: 0,
    explanation:
      "颏孔多位于下颌第二前磨牙根尖下方，或第一、二前磨牙根尖之间的下方，在下颌体上、下缘之间稍偏上，颏神经和血管由此穿出。前磨牙区的根尖手术、种植和翻瓣手术都要注意保护颏神经；尖牙、中切牙和第一磨牙远中根下方都不是颏孔的常见位置。",
  },
  {
    id: "pm-12",
    topic: "tooth-morphology",
    lessonId: "premolars",
    difficulty: 3,
    prompt: "一颗离体下颌前磨牙，咬合面有一个颊尖和两个舌尖，近中舌尖大于远中舌尖，无横嵴。它是：",
    options: ["下颌第一前磨牙", "下颌第二前磨牙（二尖型）", "上颌第二前磨牙", "下颌第二前磨牙（三尖型）"],
    answer: 3,
    explanation:
      "一个颊尖加两个舌尖、无横嵴，是三尖型下颌第二前磨牙，其近中舌尖大于远中舌尖，发育沟呈 Y 形。下颌第一前磨牙有横嵴且舌尖短小；二尖型下颌第二前磨牙只有一个舌尖；上颌第二前磨牙为颊、舌两尖。",
  },
  {
    id: "pm-13",
    topic: "clinical",
    lessonId: "premolars",
    difficulty: 3,
    prompt: "畸形中央尖折断后容易引起牙髓感染和根尖周病变，主要原因是：",
    options: ["中央尖内常有髓角伸入", "中央尖由牙骨质构成", "中央尖处釉质最厚", "中央尖与牙周膜直接相通"],
    answer: 0,
    explanation:
      "畸形中央尖内常有髓角伸入，中央尖被磨损或折断后牙髓暴露，细菌进入引起牙髓感染，甚至在牙根尚未发育完成时就出现根尖周病变。中央尖表面覆盖的是釉质而非牙骨质；它不与牙周膜直接相通；釉质厚反而不易穿髓，不能解释感染。",
  },

  // --------------------------------------------------------------------------
  // 第 6 课 磨牙
  // --------------------------------------------------------------------------
  {
    id: "mol-01",
    topic: "tooth-morphology",
    lessonId: "molars",
    difficulty: 1,
    prompt: "上颌第一磨牙最大的牙尖是：",
    options: ["近中颊尖", "远中颊尖", "近中舌尖", "远中舌尖"],
    answer: 2,
    explanation:
      "上颌第一磨牙的近中舌尖宽大，是最大的牙尖，也是主要的功能尖；远中舌尖最小。近中颊尖略宽于远中颊尖，但都小于近中舌尖。",
  },
  {
    id: "mol-02",
    topic: "tooth-morphology",
    lessonId: "molars",
    difficulty: 2,
    prompt: "上颌第一磨牙的斜嵴由哪两个牙尖的三角嵴相连而成？",
    options: ["近中颊尖与远中舌尖", "近中颊尖与近中舌尖", "近中舌尖与远中颊尖", "远中颊尖与远中舌尖"],
    answer: 2,
    explanation:
      "上颌第一磨牙的近中舌尖三角嵴与远中颊尖三角嵴斜行相连，形成斜嵴，是其咬合面的标志。斜嵴近中为较大的中央窝，远中为较小的远中窝。其余组合都不构成斜嵴。",
  },
  {
    id: "mol-03",
    topic: "tooth-morphology",
    lessonId: "molars",
    difficulty: 2,
    prompt: "下颌第一磨牙咬合面的牙尖数目和组成是：",
    options: ["4 尖：颊、舌侧各 2 个", "5 尖：颊侧 3 个、舌侧 2 个", "5 尖：颊侧 2 个、舌侧 3 个", "3 尖：颊侧 2 个、舌侧 1 个"],
    answer: 1,
    explanation:
      "下颌第一磨牙有 5 个牙尖：颊侧为近中颊尖、远中颊尖和远中尖，舌侧为近中舌尖和远中舌尖，其中远中尖最小。4 尖、“十”字形沟是下颌第二磨牙的典型形态；舌侧 3 尖和三尖型都不符合。",
  },
  {
    id: "mol-04",
    topic: "tooth-morphology",
    lessonId: "molars",
    difficulty: 1,
    prompt: "上颌第一磨牙的牙根通常为：",
    options: ["近中根和远中根两根", "颊根和腭根两根", "近中颊根、远中颊根和腭根三根", "单根"],
    answer: 2,
    explanation:
      "上颌第一磨牙有 3 根：近中颊根、远中颊根和腭根，三根分叉较大。近中根和远中根两根是下颌磨牙的特点；颊、腭（舌）两根是上颌第一前磨牙的特点。",
  },
  {
    id: "mol-05",
    topic: "tooth-morphology",
    lessonId: "molars",
    difficulty: 2,
    prompt: "上颌第一磨牙三个牙根中最大的是：",
    options: ["近中颊根", "远中颊根", "腭根", "三根大小相等"],
    answer: 2,
    explanation:
      "上颌第一磨牙的腭根最大、最长，根管也最粗大；近中颊根颊舌向扁宽，常含两个根管；远中颊根最小。三根大小并不相等。",
  },
  {
    id: "mol-06",
    topic: "tooth-morphology",
    lessonId: "molars",
    difficulty: 2,
    prompt: "卡氏尖（第五牙尖）最常见于：",
    options: ["下颌第一磨牙的颊面远中", "上颌第二前磨牙的舌侧", "下颌第二磨牙的颊侧", "上颌第一磨牙近中舌尖的舌侧"],
    answer: 3,
    explanation:
      "卡氏尖常见于上颌第一磨牙近中舌尖的舌侧，大小不一，上颌第二磨牙少见。下颌第一磨牙颊面远中的是远中尖，属于其正常的第五个牙尖，不是卡氏尖；前磨牙和下颌第二磨牙一般没有卡氏尖。",
  },
  {
    id: "mol-07",
    topic: "tooth-morphology",
    lessonId: "molars",
    difficulty: 2,
    prompt: "关于上、下颌磨牙的鉴别，正确的是：",
    options: ["上颌磨牙近远中径大于颊舌径", "下颌磨牙近远中径大于颊舌径", "上颌磨牙多为双根", "下颌磨牙舌尖钝而颊尖锐"],
    answer: 1,
    explanation:
      "下颌磨牙咬合面呈长方形，近远中径大于颊舌径；上颌磨牙咬合面呈斜方形，颊舌径大于近远中径。上颌磨牙多为三根，下颌磨牙多为双根；下颌磨牙舌尖锐而颊尖钝，上颌磨牙则相反。",
  },
  {
    id: "mol-08",
    topic: "tooth-morphology",
    lessonId: "molars",
    difficulty: 2,
    prompt: "下颌第二磨牙的典型形态是：",
    options: ["5 尖，Y 形沟", "3 尖，心形咬合面", "咬合面有斜嵴", "4 尖，发育沟呈“十”字形"],
    answer: 3,
    explanation:
      "下颌第二磨牙多为 4 个大小相近的牙尖，发育沟呈“十”字形，两根较靠拢。5 尖是下颌第一磨牙的特点；心形三尖轮廓多见于上颌第二、三磨牙；斜嵴是上颌磨牙的特征。",
  },
  {
    id: "mol-09",
    topic: "development",
    lessonId: "molars",
    difficulty: 1,
    prompt: "俗称“六龄牙”的是：",
    options: ["第一恒磨牙", "第一乳磨牙", "第二乳磨牙", "第二恒磨牙"],
    answer: 0,
    explanation:
      "第一恒磨牙约在 6 岁萌出，俗称六龄牙，通常是最早萌出的恒牙之一，不替换任何乳牙。第二恒磨牙约 12–13 岁萌出；第一、第二乳磨牙在婴幼儿期萌出。",
  },
  {
    id: "mol-10",
    topic: "clinical",
    lessonId: "molars",
    difficulty: 2,
    prompt: "阻生最常见的牙是：",
    options: ["上颌尖牙", "上颌第三磨牙", "下颌第二前磨牙", "下颌第三磨牙"],
    answer: 3,
    explanation:
      "下颌第三磨牙最常发生阻生，其次为上颌第三磨牙和上颌尖牙。下颌第三磨牙萌出最晚、萌出空间常不足，近中阻生和水平阻生多见，可引起冠周炎和第二磨牙远中龋。",
  },
  {
    id: "mol-11",
    topic: "clinical",
    lessonId: "molars",
    difficulty: 3,
    prompt: "拔除下颌第三磨牙时，因该处舌侧骨板薄、神经紧贴其舌侧走行而容易受损的神经是：",
    options: ["颊神经", "颏神经", "舌神经", "眶下神经"],
    answer: 2,
    explanation:
      "舌神经在下颌第三磨牙舌侧紧贴舌侧骨板下方走行，而此处骨板很薄，去骨、劈冠或翻舌侧瓣时容易损伤，导致同侧舌前 2/3 麻木。颊神经位于颊侧软组织；颏神经出颏孔分布于下唇和颏部，远离第三磨牙；眶下神经属于上颌神经的分支。",
    scene: { view: "right", layers: ["teeth", "mandible", "nerves"], ghost: ["mandible"] },
  },
  {
    id: "mol-12",
    topic: "tooth-morphology",
    lessonId: "molars",
    difficulty: 3,
    prompt: "一颗离体磨牙有近中、远中两根，近中根宽扁、根面有纵沟，咬合面有 5 个牙尖，最小的牙尖位于颊面远中。将其咬合面向上、颊面朝向自己时，近中位于自己的右侧。它的 FDI 编号是：",
    options: ["46", "36", "26", "16"],
    answer: 0,
    explanation:
      "近中、远中两根加 5 个牙尖（颊侧 3 尖、远中尖最小）提示下颌第一磨牙。下颌牙在口内咬合面朝上；从颊侧观察右侧下颌牙时，前方（近中）位于观察者的右手侧，因此该牙为下颌右侧第一磨牙 46。若近中在左侧则为 36；16、26 是上颌第一磨牙，有三根。",
  },
  {
    id: "mol-13",
    topic: "tooth-morphology",
    lessonId: "molars",
    difficulty: 2,
    prompt: "上颌第一磨牙咬合面的外形呈：",
    options: ["长方形", "斜方形", "圆形", "心形"],
    answer: 1,
    explanation:
      "上颌第一磨牙咬合面呈斜方形，近中颊角和远中舌角为锐角，远中颊角和近中舌角为钝角。长方形是下颌磨牙咬合面的轮廓；心形多见于远中舌尖退化的上颌第二、三磨牙。",
  },
  {
    id: "mol-14",
    topic: "clinical",
    lessonId: "molars",
    difficulty: 2,
    prompt: "判断安氏Ⅰ类（中性）磨牙关系的标准是：",
    options: ["上颌第一磨牙远中颊尖咬合于下颌第一磨牙颊沟", "上颌第一磨牙近中舌尖咬合于下颌第一磨牙颊沟", "上、下颌第一磨牙远中面平齐", "上颌第一磨牙近中颊尖咬合于下颌第一磨牙颊沟"],
    answer: 3,
    explanation:
      "安氏分类以上颌第一磨牙近中颊尖与下颌第一磨牙颊沟的关系为标准：近中颊尖咬合于颊沟内为中性关系（Ⅰ类）。正常时上颌第一磨牙近中舌尖咬合于下颌第一磨牙的中央窝而不是颊沟；“远中面平齐”是描述第二乳磨牙终末平面的说法。",
  },
  {
    id: "mol-15",
    topic: "tooth-morphology",
    lessonId: "molars",
    difficulty: 2,
    prompt: "鉴别下颌第一磨牙的左右时，确定远中最直接的标志是：",
    options: ["卡氏尖所在的一侧", "斜嵴所在的一侧", "远中尖所在的一侧", "腭根所在的一侧"],
    answer: 2,
    explanation:
      "下颌第一磨牙的远中尖位于颊面远中，是确定远中的直接标志；此外近中根弯向远中、远中根也多斜向远中。卡氏尖、斜嵴和腭根都是上颌第一磨牙的结构，下颌磨牙没有。",
  },
  // --------------------------------------------------------------------------
  // 第 7 课 牙体组织
  // --------------------------------------------------------------------------
  {
    id: "tis-01",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 1,
    prompt: "成熟釉质中无机物所占的重量比约为：",
    options: ["45%–50%", "70%", "96%–97%", "100%"],
    answer: 2,
    explanation:
      "成熟釉质按重量计无机物占 96%–97%，主要为羟基磷灰石晶体，其余为有机物和水，因此是人体最硬的组织。约 70% 是牙本质的无机物含量，45%–50% 是牙骨质的；釉质仍含少量有机物和水，并非 100%。",
    scene: { focusTooth: 46, layers: ["enamel", "dentin"], section: { axis: "sagittal", offset: 0 } },
  },
  {
    id: "tis-02",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 1,
    prompt: "釉质的基本结构单位是：",
    options: ["釉柱", "牙本质小管", "釉板", "釉质生长线"],
    answer: 0,
    explanation:
      "釉柱是细长的柱状结构，起自釉牙本质界，贯穿釉质全层到达牙表面，是釉质的基本结构单位。牙本质小管是牙本质的结构；釉板是釉质中的薄层板状结构；生长线反映釉质的节律性沉积，都不是基本结构单位。",
  },
  {
    id: "tis-03",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 2,
    prompt: "牙本质中无机物的含量（重量比）约为：",
    options: ["30%", "50%", "70%", "96%"],
    answer: 2,
    explanation:
      "牙本质按重量计无机物约 70%、有机物约 20%、水约 10%，矿化程度和硬度介于釉质（约 96%）和牙骨质（45%–50%）之间。30% 远低于任何一种牙体硬组织。",
    scene: { focusTooth: 36, layers: ["enamel", "dentin", "pulp"], section: { axis: "sagittal", offset: 0 } },
  },
  {
    id: "tis-04",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 2,
    prompt: "釉牙骨质界最常见的连接方式是：",
    options: ["釉质与牙骨质端端相接", "牙骨质少许覆盖釉质", "釉质与牙骨质不相接", "釉质覆盖牙骨质"],
    answer: 1,
    explanation:
      "釉牙骨质界有三种连接方式：约 60% 为牙骨质少许覆盖釉质，约 30% 为端端相接，约 10% 二者不相接、牙本质暴露。“釉质覆盖牙骨质”不属于教材描述的这三种方式。",
  },
  {
    id: "tis-05",
    topic: "clinical",
    lessonId: "dental-tissues",
    difficulty: 2,
    prompt: "釉牙骨质界处釉质与牙骨质不相接、牙本质直接暴露的情况约占 10%，其主要临床意义是：",
    options: ["牙龈退缩后易出现牙本质敏感", "易发生釉质发育不全", "易形成畸形中央尖", "易发生牙根纵裂"],
    answer: 0,
    explanation:
      "釉质与牙骨质不相接时，牙颈部有一段牙本质没有覆盖，牙龈退缩后暴露于口腔，冷热酸甜刺激可经牙本质小管引起牙本质敏感。釉质发育不全和畸形中央尖是牙发育期的异常，牙根纵裂与咬合创伤等因素有关，均与此无直接关系。",
  },
  {
    id: "tis-06",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 2,
    prompt: "牙根发育完成后，在生理状态下终生缓慢形成的牙本质是：",
    options: ["原发性牙本质", "修复性牙本质", "继发性牙本质", "罩牙本质"],
    answer: 2,
    explanation:
      "牙根发育完成后形成的牙本质称继发性牙本质，形成速度慢，使髓腔随年龄增长逐渐缩小。原发性牙本质在牙根发育完成前形成，罩牙本质是其中最先形成、靠近釉牙本质界的一层；修复性牙本质是受到刺激后才形成的。",
  },
  {
    id: "tis-07",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 2,
    prompt: "受龋病、磨损等刺激后，在相应髓腔侧形成的牙本质称为：",
    options: ["原发性牙本质", "继发性牙本质", "球间牙本质", "修复性（第三期）牙本质"],
    answer: 3,
    explanation:
      "修复性牙本质又称第三期牙本质，是牙本质受到龋病、磨损、备洞等刺激后，在相应部位的髓腔侧形成的，可保护牙髓。继发性牙本质是生理性、缓慢而全面的沉积；球间牙本质是冠部近釉牙本质界处的矿化不全区。",
  },
  {
    id: "tis-08",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 2,
    prompt: "牙髓组织由外向内的分层顺序是：",
    options: ["成牙本质细胞层、无细胞层、多细胞层、髓核", "成牙本质细胞层、多细胞层、无细胞层、髓核", "无细胞层、成牙本质细胞层、多细胞层、髓核", "髓核、多细胞层、无细胞层、成牙本质细胞层"],
    answer: 0,
    explanation:
      "牙髓由外向内依次为成牙本质细胞层、无细胞层（Weil 层）、多细胞层和髓核。无细胞层位于成牙本质细胞层与多细胞层之间，细胞少而有神经丛和毛细血管丛；髓核位于中央。从髓核排起的是由内向外的顺序；把多细胞层放在无细胞层外侧，或把无细胞层放在最外层，也都不正确。",
  },
  {
    id: "tis-09",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 3,
    prompt: "牙髓炎患者常不能准确指出患牙，主要原因是：",
    options: ["牙髓内没有神经分布", "牙髓神经受刺激时主要产生痛觉，且定位能力差", "牙周膜没有感觉神经", "牙本质小管内没有液体"],
    answer: 1,
    explanation:
      "牙髓内有丰富的神经，但受刺激时主要产生痛觉，且缺乏定位能力，因此牙髓炎的疼痛常不能定位，甚至放射到同侧其他部位。牙周膜有灵敏的本体感觉，根尖周炎患牙通常能被准确指出；牙本质小管内含有组织液。",
  },
  {
    id: "tis-10",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 2,
    prompt: "关于牙骨质，错误的是：",
    options: ["覆盖于牙根表面", "在牙颈部最薄，根尖和根分叉处最厚", "含有丰富的血管和神经", "牙周膜主纤维以穿通纤维埋入其中"],
    answer: 2,
    explanation:
      "牙骨质没有血管和神经，其营养来自牙周膜，这也是它比骨更不易吸收的原因之一。其余三项均正确：牙骨质覆盖牙根表面，牙颈部最薄、根尖和根分叉处最厚，牙周膜主纤维以穿通纤维埋入其中。",
  },
  {
    id: "tis-11",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 3,
    prompt: "目前解释牙本质敏感最常用的学说是：",
    options: ["神经直接传导学说", "成牙本质细胞传导学说", "流体动力学说", "细菌感染学说"],
    answer: 2,
    explanation:
      "流体动力学说认为，外界刺激引起牙本质小管内液体流动，牵动牙髓神经末梢而产生痛觉，是目前最被广泛接受的解释。神经纤维只伸入牙本质内层的部分小管，难以解释表层牙本质的敏感；成牙本质细胞传导学说证据不足；细菌感染不是牙本质敏感的机制。",
  },
  {
    id: "tis-12",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 2,
    prompt: "新生线见于：",
    options: ["乳牙和第一恒磨牙", "所有恒牙", "只见于第三磨牙", "只见于牙骨质"],
    answer: 0,
    explanation:
      "新生线是出生时环境和营养的变化在正在形成的釉质和牙本质中留下的一条明显生长线，只见于出生前后正在矿化的乳牙和第一恒磨牙。其他恒牙在出生后才开始钙化，因此没有新生线；牙骨质中也不以新生线为特征。",
  },
  {
    id: "tis-13",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 3,
    prompt: "牙骨质的哪一特点是正畸牙移动时牙根通常保持完整的重要原因？",
    options: ["牙骨质无机物含量高于牙本质", "牙骨质富含血管", "牙骨质由成釉细胞形成", "牙骨质比牙槽骨更不易吸收"],
    answer: 3,
    explanation:
      "牙骨质的抗吸收能力比牙槽骨强，正畸力作用下主要发生牙槽骨的吸收和新生，牙根表面一般保持完整，这是正畸牙移动的生物学基础之一。牙骨质的无机物含量（45%–50%）低于牙本质（约 70%）；它不含血管；由成牙骨质细胞而非成釉细胞形成。",
  },
  {
    id: "tis-14",
    topic: "dental-tissues",
    lessonId: "dental-tissues",
    difficulty: 2,
    prompt: "釉质在牙萌出后不能再生，主要原因是：",
    options: ["形成釉质的成釉细胞在牙萌出后消失", "釉质中无机物太少", "釉质由牙乳头形成", "釉质内的血管在萌出后闭塞"],
    answer: 0,
    explanation:
      "釉质由成釉细胞形成，牙萌出后成釉细胞消失，釉质成为无细胞、无血管神经的组织，缺损后不能再生，只能通过再矿化修复早期脱矿。釉质无机物含量极高而非太少；它来源于成釉器而不是牙乳头；釉质内本来就没有血管。",
  },

  // --------------------------------------------------------------------------
  // 第 8 课 髓腔与根管系统
  // --------------------------------------------------------------------------
  {
    id: "pc-01",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 1,
    prompt: "后牙髓室底上通向根管的开口称为：",
    options: ["根尖孔", "根管口", "髓角", "副根管"],
    answer: 1,
    explanation:
      "根管口是髓室底上通向各根管的开口，开髓后需要找到全部根管口。根尖孔是根管在根尖的开口；髓角是髓室伸向牙尖的突出部分；副根管是由髓室底通向根分叉区的细小管道。",
  },
  {
    id: "pc-02",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 2,
    prompt: "Vertucci 分型中，“两个根管口，在近根尖处汇合为一个根管，一个根尖孔”属于：",
    options: ["Ⅰ型", "Ⅱ型", "Ⅲ型", "Ⅳ型"],
    answer: 1,
    explanation:
      "Vertucci Ⅱ型为 2–1 型。Ⅰ型为单根管（1）；Ⅲ型为 1–2–1 型，只有一个根管口；Ⅳ型为两个独立根管（2），各有根尖孔。",
  },
  {
    id: "pc-03",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 2,
    prompt: "Vertucci Ⅴ型根管的形态是：",
    options: ["一个根管口，在近根尖处分为两个根管，各有根尖孔", "一个根管从髓室直达根尖", "两个独立根管从髓室直达根尖", "一个根管口，分为两个后又在根尖前汇合"],
    answer: 0,
    explanation:
      "Ⅴ型为 1–2 型：一个根管口，在近根尖处分为两个，各有根尖孔，下颌第一前磨牙较常见。一个根管直达根尖为Ⅰ型；两个独立根管为Ⅳ型；分开后又汇合为Ⅲ型（1–2–1）。",
  },
  {
    id: "pc-04",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 3,
    prompt: "Vertucci Ⅲ型根管可表示为：",
    options: ["2–1", "1–2–1", "2–1–2", "1–2–1–2"],
    answer: 1,
    explanation:
      "Ⅲ型为 1–2–1：一个根管口，在根内分为两个，再于根尖前汇合为一个。2–1 为Ⅱ型；2–1–2 为Ⅵ型；1–2–1–2 为Ⅶ型。",
  },
  {
    id: "pc-05",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 2,
    prompt: "上颌第一磨牙最常出现第二根管（MB2）的牙根是：",
    options: ["腭根", "远中颊根", "近中颊根", "三根概率相等"],
    answer: 2,
    explanation:
      "上颌第一磨牙近中颊根颊腭向扁宽，常含第二近颊根管（MB2），检出率报道差异很大，离体牙研究多在半数以上。腭根和远中颊根通常各只有一个根管。",
  },
  {
    id: "pc-06",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 3,
    prompt: "MB2 的根管口通常位于：",
    options: ["近颊根管口的腭侧（近中腭侧）", "远颊根管口的远中", "腭根管口的远中", "髓室顶中央"],
    answer: 0,
    explanation:
      "MB2 根管口多位于近颊根管口（MB1）的腭侧，即近颊根管口与腭根管口连线附近的近中腭侧，常被牙本质突起或钙化物遮盖，需要仔细探查。根管口位于髓室底而不是髓室顶；远颊、腭根管口的远中都不是 MB2 的位置。",
  },
  {
    id: "pc-07",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 2,
    prompt: "关于根尖分歧与根尖分叉，正确的是：",
    options: ["根尖分歧时主根管不存在", "根尖分叉时主根管仍存在", "二者是同一概念", "根尖分歧时主根管仍存在，根尖分叉时主根管不存在"],
    answer: 3,
    explanation:
      "根尖分歧是根管在根尖部发出的细小分支，此时主根管仍然存在；根尖分叉是根管在根尖部分散成两个或两个以上的细小分支，此时主根管不复存在。“根尖分歧时主根管不存在”和“根尖分叉时主根管仍存在”都把二者说反了，二者也不是同一概念。",
  },
  {
    id: "pc-08",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 2,
    prompt: "发自髓室底、通向根分叉区的细小管道称为：",
    options: ["根管侧支", "副根管", "管间吻合", "根尖分歧"],
    answer: 1,
    explanation:
      "副根管发自髓室底、通向根分叉区，是牙髓与根分叉区牙周组织之间感染扩散的通道。根管侧支从根管发出通向牙周膜；管间吻合连接相邻根管；根尖分歧位于根尖部。",
  },
  {
    id: "pc-09",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 2,
    prompt: "下颌切牙根管治疗时最容易遗漏的根管是：",
    options: ["近中根管", "远中根管", "舌侧根管", "唇侧根管"],
    answer: 2,
    explanation:
      "下颌切牙牙根唇舌径大、近远中径小，约四分之一至三分之一含唇、舌两个根管；舌侧根管常被舌面隆突下方的牙本质遮挡，开髓偏唇侧时容易遗漏。其两个根管为唇、舌向排列，而不是近、远中向排列。",
  },
  {
    id: "pc-10",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 2,
    prompt: "下颌第一磨牙最常见的根管数目和分布是：",
    options: ["3 个：近中颊、近中舌和远中", "2 个：近中、远中各 1 个", "4 个：近中颊、近中舌、远中颊和远中舌", "5 个"],
    answer: 0,
    explanation:
      "下颌第一磨牙近中根通常含近中颊、近中舌两个根管，远中根多为一个粗大的根管，因此最常见为 3 根管；远中根含两个根管时为 4 根管，也较常见。近、远中各 1 个根管少见；5 个根管罕见。",
  },
  {
    id: "pc-11",
    topic: "clinical",
    lessonId: "pulp-canals",
    difficulty: 2,
    prompt: "根管预备和充填的终点一般应位于：",
    options: ["解剖根尖顶", "根管口", "超出根尖孔 1 mm", "根尖狭窄处（约距 X 线片根尖 0.5–1 mm）"],
    answer: 3,
    explanation:
      "根尖狭窄是根管最狭窄的部位，一般距根尖孔约 0.5–1 mm，常作为根管预备和充填的终点，临床以距 X 线片根尖约 0.5–1 mm 为参考，并结合根尖定位仪确定。根尖孔常不在解剖根尖顶；止于根管口则预备不足；超出根尖孔会损伤根尖周组织。",
  },
  {
    id: "pc-12",
    topic: "clinical",
    lessonId: "pulp-canals",
    difficulty: 3,
    prompt: "年轻恒牙备洞时比老年人的牙更容易意外穿髓，主要原因是：",
    options: ["髓腔大、髓角高", "釉质更厚", "牙本质矿化程度更高", "根尖孔已经闭合"],
    answer: 0,
    explanation:
      "年轻恒牙继发性牙本质沉积少，髓腔大、髓角高，备洞时容易意外穿髓；随年龄增长髓腔缩小、髓角变低。釉质更厚或牙本质矿化程度高都不会增加穿髓风险；年轻恒牙的根尖孔常尚未闭合，而且根尖孔状态与备洞穿髓无关。",
  },
  {
    id: "pc-13",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 2,
    prompt: "下颌第二磨牙的两根在颊侧融合时，根管形态常为：",
    options: ["Vertucci Ⅷ型", "MB2", "C 形根管", "根尖分叉"],
    answer: 2,
    explanation:
      "下颌第二磨牙近、远中根在颊侧融合形成 C 形根时，根管常呈连续的 C 形或带状，称 C 形根管，东亚人群中发生率较高，清理和充填难度大。Ⅷ型为三个独立根管；MB2 是上颌磨牙近颊根的第二根管；根尖分叉是根尖部的分支形态。",
  },
  {
    id: "pc-14",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 3,
    prompt: "关于下颌第一前磨牙的根管形态，正确的是：",
    options: ["几乎均为三根管", "多为单根管，部分在根中下段分为颊、舌两个根管", "多为近、远中两个根管", "总是 Vertucci Ⅳ型"],
    answer: 1,
    explanation:
      "下颌第一前磨牙多为单根管，约四分之一在根中下段分为颊、舌两个根管（Vertucci Ⅴ型），分叉位置深而不易发现。三根管罕见；其根管为颊、舌向排列而非近、远中向；Ⅳ型（两个根管从髓室直达根尖）并不常见。",
  },
  {
    id: "pc-15",
    topic: "pulp-canals",
    lessonId: "pulp-canals",
    difficulty: 2,
    prompt: "上颌第一前磨牙最常见的根管数目是：",
    options: ["1 个", "2 个（颊、舌）", "3 个", "4 个"],
    answer: 1,
    explanation:
      "上颌第一前磨牙多为颊、舌两个根管，分别位于颊、舌两根内或同一扁根内；少数为单根管，偶见三根管（两颊一舌）。4 个根管罕见。",
  },
  // --------------------------------------------------------------------------
  // 第 9 课 牙周组织
  // --------------------------------------------------------------------------
  {
    id: "per-01",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 1,
    prompt: "下列不属于牙周组织的是：",
    options: ["牙龈", "牙周膜", "牙槽骨", "牙本质"],
    answer: 3,
    explanation:
      "牙周组织包括牙龈、牙周膜、牙槽骨和牙骨质。牙本质构成牙体的主体，属于牙体组织；牙骨质虽属于牙体组织，但因参与构成牙的附着装置，也被列为牙周组织。",
  },
  {
    id: "per-02",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 2,
    prompt: "牙周膜的厚度及其最薄的部位是：",
    options: ["0.15–0.38 mm，根中 1/3 最薄", "0.5–1 mm，根尖 1/3 最薄", "0.15–0.38 mm，牙颈部最薄", "1–2 mm，根中 1/3 最薄"],
    answer: 0,
    explanation:
      "牙周膜厚度约 0.15–0.38 mm，以根中 1/3 最薄。0.5–1 mm 和 1–2 mm 都远超正常厚度，X 线片上牙周膜间隙明显增宽常提示咬合创伤或炎症；牙颈部和根尖部相对较厚，并非最薄处。",
    scene: { focusTooth: 46, layers: ["pdl", "cementum", "dentin"], section: { axis: "sagittal", offset: 0 } },
  },
  {
    id: "per-03",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 2,
    prompt: "牙周膜主纤维中数量最多、力量最强的是：",
    options: ["牙槽嵴组", "水平组", "斜行组", "根尖组"],
    answer: 2,
    explanation:
      "斜行组纤维数量最多、力量最强，自牙槽骨斜向根方止于牙骨质，能将咀嚼时的垂直压力转化为牵引力，均匀分散到牙槽骨。牙槽嵴组和水平组主要对抗侧向力、维持牙的直立；根尖组保护进出根尖孔的血管和神经。",
  },
  {
    id: "per-04",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 2,
    prompt: "生物学宽度是指：",
    options: ["龈缘至龈沟底的距离", "釉牙骨质界至根尖的距离", "龈沟底至牙槽嵴顶之间的距离", "附着龈的宽度"],
    answer: 2,
    explanation:
      "生物学宽度是龈沟底至牙槽嵴顶之间相对恒定的距离，约 2 mm，由结合上皮和牙槽嵴顶以上的结缔组织附着构成。龈缘至龈沟底是龈沟深度；附着龈宽度是附着龈冠根向的宽度，与生物学宽度是不同的概念。",
  },
  {
    id: "per-05",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 3,
    prompt: "生物学宽度约 2 mm，其组成为：",
    options: ["龈沟（约 1 mm）+ 结合上皮（约 1 mm）", "结合上皮（约 0.97 mm）+ 牙槽嵴顶以上的结缔组织附着（约 1.07 mm）", "游离龈（约 1 mm）+ 附着龈（约 1 mm）", "牙周膜（约 1 mm）+ 牙骨质（约 1 mm）"],
    answer: 1,
    explanation:
      "生物学宽度由结合上皮（约 0.97 mm）和牙槽嵴顶以上的结缔组织附着（约 1.07 mm）组成，2017 年新分类中称为嵴上组织附着。龈沟不属于生物学宽度；游离龈、附着龈以及牙周膜、牙骨质都不是它的组成部分。",
  },
  {
    id: "per-06",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 2,
    prompt: "X 线片上围绕牙根的连续阻射白线（硬骨板）对应的组织是：",
    options: ["牙骨质", "牙周膜", "固有牙槽骨", "松质骨"],
    answer: 2,
    explanation:
      "固有牙槽骨衬于牙槽窝内壁，X 线片上表现为围绕牙根的连续阻射白线，称硬骨板。牙周膜是纤维组织，在 X 线片上表现为硬骨板与牙根之间的透射线（牙周膜间隙）；牙骨质很薄，与牙根影像不易区分；松质骨呈网状影像。",
    scene: { view: "front", layers: ["teeth", "alveolar"] },
  },
  {
    id: "per-07",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 2,
    prompt: "附着龈宽度最窄的部位通常是：",
    options: ["上颌中切牙唇侧", "下颌第一前磨牙区", "上颌侧切牙唇侧", "下颌中切牙唇侧"],
    answer: 1,
    explanation:
      "附着龈宽度因牙位而异：上颌前牙唇侧最宽，后牙区较窄，下颌第一前磨牙区最窄。附着龈过窄时牙龈易受牵拉而退缩，是膜龈手术需要评估的指标。",
  },
  {
    id: "per-08",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 2,
    prompt: "健康牙龈的临床探诊深度一般不超过：",
    options: ["0.5 mm", "2–3 mm", "5 mm", "6–8 mm"],
    answer: 1,
    explanation:
      "健康龈沟的组织学深度平均约 1.8 mm，临床探诊深度一般不超过 2–3 mm。0.5 mm 低于正常龈沟深度；探诊深度超过 3 mm 并有附着丧失时提示牙周袋形成，5 mm 以上已属较深的牙周袋。",
  },
  {
    id: "per-09",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 3,
    prompt: "后牙龈乳头中央凹陷的“龈谷”容易受炎症侵犯，原因是：",
    options: ["龈谷血供过于丰富", "龈谷位于牙槽嵴顶以下", "龈谷由可移动的牙槽黏膜构成", "龈谷上皮无角化，抵抗力较弱"],
    answer: 3,
    explanation:
      "后牙龈乳头颊、舌侧较高，中间凹下呈龈谷，位于接触区下方，其上皮薄而无角化，对菌斑刺激的抵抗力较弱，是牙周病的好发部位。龈谷位于牙槽嵴顶以上，由牙龈而不是牙槽黏膜构成；血供丰富也不是它易受侵犯的原因。",
  },
  {
    id: "per-10",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 2,
    prompt: "牙周膜中可成为颌骨囊肿（如根尖周囊肿）上皮来源的结构是：",
    options: ["成纤维细胞", "成牙骨质细胞", "破骨细胞", "Malassez 上皮剩余"],
    answer: 3,
    explanation:
      "Malassez 上皮剩余是上皮根鞘断裂后残留在牙周膜中的上皮细胞团，受炎症刺激增殖时可成为根尖周囊肿等颌骨囊肿的上皮来源。成纤维细胞、成牙骨质细胞和破骨细胞都不是上皮细胞，不能形成囊肿的上皮衬里。",
  },
  {
    id: "per-11",
    topic: "clinical",
    lessonId: "periodontium",
    difficulty: 3,
    prompt: "修复体边缘过深地进入龈下、侵犯生物学宽度后，最可能出现的结果是：",
    options: ["牙龈慢性炎症、附着丧失或牙槽骨吸收", "牙周膜变薄、牙齿与骨固连", "牙槽骨增生，生物学宽度增加", "牙本质敏感消失"],
    answer: 0,
    explanation:
      "生物学宽度相对恒定，修复体边缘侵犯这一区域后，常引起牙龈慢性炎症，并通过附着丧失和牙槽骨吸收来重建该宽度。牙齿固连与牙周膜严重损伤等有关；牙槽骨不会因此增生；牙本质敏感与此无直接关系。需要在龈下修复时可先行牙冠延长术。",
  },
  {
    id: "per-12",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 2,
    prompt: "正常情况下，牙槽嵴顶与釉牙骨质界的距离约为：",
    options: ["0 mm（二者平齐）", "1–2 mm", "3–4 mm", "5 mm 以上"],
    answer: 1,
    explanation:
      "正常牙槽嵴顶位于釉牙骨质界根方约 1–2 mm，X 线片上超过 2 mm 可视为牙槽骨吸收。二者平齐不符合正常解剖；3 mm 以上提示已有骨吸收。",
  },
  {
    id: "per-13",
    topic: "periodontium",
    lessonId: "periodontium",
    difficulty: 2,
    prompt: "正畸牙移动的组织学基础是：",
    options: ["牙骨质受压侧增生", "牙周膜纤维完全断裂后重建", "釉质在压力下改建", "牙槽骨受压侧吸收、受牵引侧新生"],
    answer: 3,
    explanation:
      "牙槽骨是全身改建最活跃的骨组织：受压侧破骨细胞活跃而骨吸收，受牵引侧成骨细胞活跃而骨新生，牙随之移动。牙骨质抗吸收能力强，一般不发生明显改建；正畸移动中牙周膜纤维是改建而非完全断裂；釉质不能改建。",
  },

  // --------------------------------------------------------------------------
  // 第 10 课 牙的发育与萌出
  // --------------------------------------------------------------------------
  {
    id: "dev-01",
    topic: "development",
    lessonId: "development",
    difficulty: 1,
    prompt: "乳牙一般开始萌出和全部萌出完毕的时间分别为：",
    options: ["出生时；1 岁", "6 个月左右；2 岁半左右", "1 岁；4 岁", "3 个月；1 岁半"],
    answer: 1,
    explanation:
      "乳牙一般在出生后 6 个月左右开始萌出，2 岁半左右 20 颗乳牙全部萌出。若超过 1 周岁仍未萌出第一颗乳牙，应查找原因。其余选项的时间都与教材常用值不符。",
  },
  {
    id: "dev-02",
    topic: "development",
    lessonId: "development",
    difficulty: 2,
    prompt: "乳牙的萌出顺序是：",
    options: ["乳中切牙→乳侧切牙→乳尖牙→第一乳磨牙→第二乳磨牙", "乳中切牙→乳侧切牙→第一乳磨牙→乳尖牙→第二乳磨牙", "乳中切牙→第一乳磨牙→乳侧切牙→乳尖牙→第二乳磨牙", "第一乳磨牙→乳中切牙→乳侧切牙→乳尖牙→第二乳磨牙"],
    answer: 1,
    explanation:
      "乳牙萌出顺序为乳中切牙、乳侧切牙、第一乳磨牙、乳尖牙、第二乳磨牙，即第一乳磨牙先于乳尖牙萌出，这是最常见的易错点。乳切牙最先萌出，第一乳磨牙不会早于乳侧切牙。",
  },
  {
    id: "dev-03",
    topic: "development",
    lessonId: "development",
    difficulty: 2,
    prompt: "第一恒磨牙开始钙化的时间是：",
    options: ["3 岁左右", "1 岁左右", "出生时", "胚胎第 2 个月"],
    answer: 2,
    explanation:
      "第一恒磨牙在出生时开始钙化，是最早钙化的恒牙，约 2.5–3 岁牙冠完成，6–7 岁萌出，9–10 岁牙根完成。胚胎第 2 个月是乳牙胚开始发生的时间；恒切牙多在出生后 3–4 个月开始钙化；约 2.5–3 岁开始钙化的是第二恒磨牙。",
  },
  {
    id: "dev-04",
    topic: "development",
    lessonId: "development",
    difficulty: 2,
    prompt: "上颌恒牙较常见的萌出顺序是：",
    options: ["6→1→2→4→3→5→7", "1→2→3→4→5→6→7", "6→1→2→3→4→5→7", "6→1→2→4→5→7→3"],
    answer: 0,
    explanation:
      "上颌恒牙多按 6→1→2→4→3→5→7 或 6→1→2→4→5→3→7 的顺序萌出，上颌尖牙常在前磨牙之间或之后萌出。6→1→2→3→4→5→7 是下颌常见的顺序；第二磨牙通常在尖牙之后萌出；按牙位依次萌出不符合实际。",
  },
  {
    id: "dev-05",
    topic: "development",
    lessonId: "development",
    difficulty: 2,
    prompt: "恒牙萌出后，牙根发育完成通常还需要约：",
    options: ["1 个月", "半年", "2–3 年", "10 年"],
    answer: 2,
    explanation:
      "牙萌出时牙根尚未发育完成，恒牙一般在萌出后 2–3 年牙根才发育完成，例如上颌中切牙 7–8 岁萌出、约 10 岁牙根完成。因此年轻恒牙的根尖孔常呈喇叭口状，治疗时应尽量保存活髓。",
  },
  {
    id: "dev-06",
    topic: "development",
    lessonId: "development",
    difficulty: 2,
    prompt: "关于乳牙与恒牙的区别，错误的是：",
    options: ["乳牙釉质较薄，呈乳白色", "乳牙髓腔相对较大，髓角高", "乳前牙牙根的根尖部常向唇侧弯曲", "乳磨牙根干长、根分叉小"],
    answer: 3,
    explanation:
      "乳磨牙根干短、根分叉大而外展，以容纳下方的继承恒牙胚，“乳磨牙根干长、根分叉小”说反了。其余三项均正确：乳牙釉质薄、色乳白，髓腔大、髓角高，乳前牙牙根的根尖部常向唇侧弯曲。",
  },
  {
    id: "dev-07",
    topic: "development",
    lessonId: "development",
    difficulty: 2,
    prompt: "形态与下颌第一恒磨牙最相似的乳牙是：",
    options: ["下颌第一乳磨牙", "上颌第二乳磨牙", "下颌第二乳磨牙", "下颌乳尖牙"],
    answer: 2,
    explanation:
      "下颌第二乳磨牙形似下颌第一恒磨牙，上颌第二乳磨牙形似上颌第一恒磨牙。下颌第一乳磨牙形态特殊，不像任何恒牙；乳尖牙与磨牙的形态差异很大。",
  },
  {
    id: "dev-08",
    topic: "development",
    lessonId: "development",
    difficulty: 2,
    prompt: "牙胚中形成牙本质和牙髓的结构是：",
    options: ["成釉器", "牙乳头", "牙囊", "牙板"],
    answer: 1,
    explanation:
      "牙胚由成釉器、牙乳头和牙囊组成：成釉器形成釉质，牙乳头形成牙本质和牙髓，牙囊形成牙骨质、牙周膜和固有牙槽骨。牙板是牙胚发生的上皮来源，本身不形成牙本质。",
    scene: { focusTooth: 46, layers: ["enamel", "dentin", "cementum", "pulp", "canals"] },
  },
  {
    id: "dev-09",
    topic: "development",
    lessonId: "development",
    difficulty: 2,
    prompt: "牙骨质、牙周膜和固有牙槽骨来源于：",
    options: ["成釉器", "牙乳头", "牙囊", "口腔上皮"],
    answer: 2,
    explanation:
      "牙囊包绕成釉器和牙乳头，形成牙骨质、牙周膜和固有牙槽骨。成釉器形成釉质；牙乳头形成牙本质和牙髓；口腔上皮形成牙板和成釉器，而不直接形成牙周组织。",
  },
  {
    id: "dev-10",
    topic: "clinical",
    lessonId: "development",
    difficulty: 2,
    prompt: "混合牙列期常被家长误认为乳牙而延误治疗的恒牙是：",
    options: ["第一恒磨牙", "上颌中切牙", "第二前磨牙", "第二恒磨牙"],
    answer: 0,
    explanation:
      "第一恒磨牙约 6 岁时在第二乳磨牙远中萌出，不替换任何乳牙，萌出时也没有乳牙脱落，因此常被误认为乳牙；它又是龋病最好发的恒牙，应及时窝沟封闭和治疗。上颌中切牙和第二前磨牙替换乳牙，容易被注意到；第二恒磨牙约 12–13 岁萌出，此时已接近混合牙列期结束。",
  },
  {
    id: "dev-11",
    topic: "development",
    lessonId: "development",
    difficulty: 3,
    prompt: "替牙间隙形成的原因是：",
    options: ["乳尖牙和第一、第二乳磨牙的近远中径总和大于继承的恒尖牙和前磨牙", "乳切牙近远中径大于恒切牙", "恒磨牙比乳磨牙小", "颌骨在替牙期迅速增长"],
    answer: 0,
    explanation:
      "乳尖牙和两颗乳磨牙的近远中径总和大于替换它们的恒尖牙和两颗前磨牙，二者之差即替牙间隙，有助于磨牙关系的调整。恒切牙一般比乳切牙宽；恒磨牙并不替换乳磨牙，不存在大小替换关系；颌骨生长不是替牙间隙的成因定义。",
  },
  {
    id: "dev-12",
    topic: "development",
    lessonId: "development",
    difficulty: 3,
    prompt: "前牙中牙根完成最晚的是：",
    options: ["上颌中切牙", "下颌侧切牙", "尖牙", "上颌侧切牙"],
    answer: 2,
    explanation:
      "尖牙 4–5 个月开始钙化，约 6–7 岁牙冠完成，牙根在 12–15 岁才完成，是前牙中牙根完成最晚的；切牙的牙根一般在 9–11 岁完成。",
  },
  {
    id: "dev-13",
    topic: "development",
    lessonId: "development",
    difficulty: 2,
    prompt: "乳前牙的继承恒牙胚位于：",
    options: ["乳牙根的舌侧", "乳牙根的唇侧", "乳牙牙冠的唇侧", "乳磨牙的根分叉之间"],
    answer: 0,
    explanation:
      "乳前牙的继承恒牙胚位于乳牙根的舌侧，因此乳牙滞留时恒切牙常从舌侧萌出。位于乳磨牙根分叉之间的是前磨牙胚；恒牙胚不位于乳牙的唇侧。",
  },
  {
    id: "dev-14",
    topic: "development",
    lessonId: "development",
    difficulty: 1,
    prompt: "恒牙中不替换任何乳牙的是：",
    options: ["前磨牙", "恒尖牙", "恒切牙", "恒磨牙"],
    answer: 3,
    explanation:
      "恒磨牙（第一、第二、第三磨牙）在乳牙列远中萌出，不替换任何乳牙；恒切牙、恒尖牙替换同名乳牙，前磨牙替换乳磨牙。",
  },
  // --------------------------------------------------------------------------
  // 第 11 课 上颌骨、下颌骨与上颌窦
  // --------------------------------------------------------------------------
  {
    id: "jaw-01",
    topic: "bones",
    lessonId: "jaws-sinus",
    difficulty: 1,
    prompt: "上颌骨的“四突”不包括：",
    options: ["额突", "颧突", "腭突", "喙突"],
    answer: 3,
    explanation:
      "上颌骨由上颌体和额突、颧突、腭突、牙槽突四个突起组成。喙突（冠突）是下颌支前上方的突起，有颞肌附着，不属于上颌骨。",
  },
  {
    id: "jaw-02",
    topic: "bones",
    lessonId: "jaws-sinus",
    difficulty: 2,
    prompt: "眶下孔的位置是：",
    options: ["眶下缘中点下方约 0.5–0.8 cm", "眶上缘中点处", "颧骨体中央", "上颌第一磨牙根尖处"],
    answer: 0,
    explanation:
      "眶下孔位于眶下缘中点下方约 0.5–0.8 cm，眶下神经和血管由此穿出，是眶下神经阻滞的注射部位。眶上缘中点附近为眶上孔（或眶上切迹）；颧骨体中央和上颌第一磨牙根尖处都不是眶下孔的位置。",
  },
  {
    id: "jaw-03",
    topic: "bones",
    lessonId: "jaws-sinus",
    difficulty: 2,
    prompt: "下颌孔位于：",
    options: ["下颌体外侧面前磨牙下方", "下颌支外侧面咬肌粗隆处", "下颌体内侧面正中", "下颌支内侧面中央"],
    answer: 3,
    explanation:
      "下颌孔位于下颌支内侧面中央稍偏后上方，孔前方有下颌小舌，下牙槽神经和血管由此进入下颌管，是下牙槽神经阻滞的目标区域。下颌体外侧面前磨牙下方为颏孔；咬肌粗隆是咬肌的附着处；下颌体内侧面正中为颏棘。",
  },
  {
    id: "jaw-04",
    topic: "bones",
    lessonId: "jaws-sinus",
    difficulty: 2,
    prompt: "颏孔的孔口朝向：",
    options: ["前、上、内方", "正前方", "后、上、外方", "下方"],
    answer: 2,
    explanation:
      "颏孔孔口朝向后、上、外方，颏神经出孔后向前上方分布于下唇和颏部。因此行颏孔注射时，注射针应从后上外方向前下内方刺入，才容易进入孔内。",
  },
  {
    id: "jaw-05",
    topic: "bones",
    lessonId: "jaws-sinus",
    difficulty: 2,
    prompt: "下列不属于下颌骨骨折好发部位的是：",
    options: ["正中联合", "颏孔区", "下颌角", "喙突"],
    answer: 3,
    explanation:
      "正中联合、颏孔区、下颌角和髁突颈部是下颌骨的薄弱部位，也是骨折的好发部位。喙突位于颧弓深面，受颧弓和咀嚼肌保护，骨折少见。",
    scene: { view: "three-quarter", layers: ["mandible", "teeth"] },
  },
  {
    id: "jaw-06",
    topic: "sinus",
    lessonId: "jaws-sinus",
    difficulty: 1,
    prompt: "上颌窦开口于：",
    options: ["中鼻道", "上鼻道", "下鼻道", "蝶筛隐窝"],
    answer: 0,
    explanation:
      "上颌窦口开口于中鼻道的半月裂孔。上鼻道有后组筛窦开口；下鼻道有鼻泪管开口；蝶筛隐窝有蝶窦开口。",
    scene: { view: "front", layers: ["maxilla", "sinus", "skull"], ghost: ["maxilla", "skull"] },
  },
  {
    id: "jaw-07",
    topic: "sinus",
    lessonId: "jaws-sinus",
    difficulty: 2,
    prompt: "上颌窦口的位置高于窦底，其临床意义是：",
    options: ["有利于窦内分泌物引流", "窦内分泌物不易引流，炎症容易迁延", "使上颌窦不易感染", "便于经窦口取出进入窦内的断根"],
    answer: 1,
    explanation:
      "上颌窦口位于内侧壁的上部，高于窦底，直立时窦内分泌物难以自然引流，感染后炎症容易迁延。窦口位置高并不能防止感染；进入窦内的断根需经牙槽窝或窦前壁等入路取出，而不是经窦口。",
  },
  {
    id: "jaw-08",
    topic: "sinus",
    lessonId: "jaws-sinus",
    difficulty: 2,
    prompt: "通常与上颌窦底关系最密切、根尖距窦底最近的牙是：",
    options: ["上颌第一、第二磨牙", "上颌中切牙", "上颌尖牙", "上颌第一前磨牙"],
    answer: 0,
    explanation:
      "上颌窦底与上颌第二前磨牙至第三磨牙的根尖相邻，其中以第一、第二磨牙根尖最近，有时仅隔一层薄骨或窦底黏膜。上颌前牙根尖距窦底较远；第一前磨牙也比磨牙远。",
  },
  {
    id: "jaw-09",
    topic: "clinical",
    lessonId: "jaws-sinus",
    difficulty: 3,
    prompt: "拔除上颌第一磨牙后，患者捏鼻鼓气时拔牙窝有气体溢出，饮水时液体从同侧鼻腔流出，最可能的诊断是：",
    options: ["口腔上颌窦交通", "干槽症", "下颌骨骨髓炎", "颞下颌关节脱位"],
    answer: 0,
    explanation:
      "上颌第一磨牙根尖与上颌窦底接近，拔牙时可能穿通窦底，形成口腔上颌窦交通，表现为捏鼻鼓气时拔牙窝漏气、饮水时液体经鼻腔流出。干槽症以拔牙后剧烈疼痛、牙槽窝空虚腐臭为特点；下颌骨骨髓炎和关节脱位都与本情况无关。",
  },
  {
    id: "jaw-10",
    topic: "bones",
    lessonId: "jaws-sinus",
    difficulty: 2,
    prompt: "腭大孔的位置通常在：",
    options: ["上颌中切牙腭侧的腭中缝前端", "上颌尖牙腭侧龈缘处", "软腭中央", "上颌第三磨牙腭侧，约在腭中缝至龈缘连线的中、外 1/3 交界处"],
    answer: 3,
    explanation:
      "腭大孔位于上颌第三磨牙腭侧，约在腭中缝至龈缘连线的中、外 1/3 交界处，腭大神经和血管由此穿出，是腭大孔注射的标志。上颌中切牙腭侧的腭中缝前端是切牙孔；尖牙腭侧龈缘和软腭中央都不是腭大孔的位置。",
  },
  {
    id: "jaw-11",
    topic: "bones",
    lessonId: "jaws-sinus",
    difficulty: 3,
    prompt: "上颌骨的三对支柱中，经蝶骨翼突将咀嚼力传至颅底的是：",
    options: ["尖牙支柱", "颧突支柱", "翼突支柱", "腭突支柱"],
    answer: 2,
    explanation:
      "上颌骨有尖牙支柱（鼻额支柱）、颧突支柱和翼突支柱三对垂直支柱。翼突支柱由上颌骨后部与蝶骨翼突相连构成，将后牙区的咀嚼力传至颅底。尖牙支柱经额突传至额骨；颧突支柱经颧骨传导；腭突不构成支柱。",
  },
  {
    id: "jaw-12",
    topic: "bones",
    lessonId: "jaws-sinus",
    difficulty: 3,
    prompt: "下颌骨内侧面的上颏棘是哪块肌的起点？",
    options: ["颏舌肌", "颏舌骨肌", "二腹肌前腹", "下颌舌骨肌"],
    answer: 0,
    explanation:
      "下颌骨内侧面正中有上、下颏棘：上颏棘为颏舌肌的起点，下颏棘为颏舌骨肌的起点。二腹肌前腹起于二腹肌窝；下颌舌骨肌起于内斜线（下颌舌骨线）。",
  },
  {
    id: "jaw-13",
    topic: "sinus",
    lessonId: "jaws-sinus",
    difficulty: 2,
    prompt: "上颌窦哪一部位骨质最薄，是传统上颌窦根治术的入路？",
    options: ["上壁（眶底）", "前壁的尖牙窝处", "后壁", "底壁"],
    answer: 1,
    explanation:
      "上颌窦前壁即上颌体前面，尖牙窝处骨质最薄，传统的上颌窦根治术经口内前庭沟切口由此进入窦腔。上壁为眶底，内有眶下管；后壁与翼腭窝、颞下窝相邻；底壁由牙槽突构成。",
  },

  // --------------------------------------------------------------------------
  // 第 12 课 颞下颌关节、下颌运动与咀嚼肌
  // --------------------------------------------------------------------------
  {
    id: "tmj-01",
    topic: "tmj",
    lessonId: "tmj-muscles",
    difficulty: 1,
    prompt: "颞下颌关节盘将关节腔分为：",
    options: ["前、后两腔", "内、外两腔", "上、下两腔", "三个腔"],
    answer: 2,
    explanation:
      "关节盘位于下颌窝与髁突之间，将关节腔分为上腔（盘-颞关节）和下腔（盘-髁关节）。上腔大而松，主要完成滑动；下腔小而紧，主要完成转动。",
  },
  {
    id: "tmj-02",
    topic: "tmj",
    lessonId: "tmj-muscles",
    difficulty: 2,
    prompt: "关节盘中最薄、位于关节主要负重区的是：",
    options: ["前带", "中间带", "后带", "双板区"],
    answer: 1,
    explanation:
      "关节盘的中间带最薄，位于髁突前斜面与关节结节后斜面之间，是关节的主要负重区，也是关节盘穿孔的好发部位之一。后带最厚；前带较厚；双板区富含血管神经，不是负重区。",
  },
  {
    id: "tmj-03",
    topic: "tmj",
    lessonId: "tmj-muscles",
    difficulty: 2,
    prompt: "正常闭口位时，位于髁突顶部的关节盘部分是：",
    options: ["前带", "中间带", "后带", "双板区下层"],
    answer: 2,
    explanation:
      "正常闭口位时，关节盘最厚的后带位于髁突顶部，中间带位于髁突前斜面与关节结节后斜面之间。若后带移到髁突前方，即为关节盘前移位。双板区位于后带的后方，其下层止于髁突后斜面。",
  },
  {
    id: "tmj-04",
    topic: "tmj",
    lessonId: "tmj-muscles",
    difficulty: 2,
    prompt: "关于颞下颌关节上、下腔的运动，正确的是：",
    options: ["上腔主要完成转动，下腔主要完成滑动", "上腔主要完成滑动，下腔主要完成转动", "上、下腔都只完成转动", "上、下腔都只完成滑动"],
    answer: 1,
    explanation:
      "关节上腔大而松，关节盘连同髁突可在此沿关节结节滑动；下腔小而紧，髁突在关节盘下方主要做转动运动。“上腔转动、下腔滑动”把二者说反了；上、下腔的运动方式不同，并非只做同一种运动。",
  },
  {
    id: "tmj-05",
    topic: "tmj",
    lessonId: "tmj-muscles",
    difficulty: 2,
    prompt: "小张口运动（切牙间距约 2 cm 以内）时，髁突的运动主要是：",
    options: ["沿关节结节向前下滑动", "向后上移位", "向外侧滑动", "在关节下腔内转动"],
    answer: 3,
    explanation:
      "小张口时，髁突主要在关节下腔内做转动运动，位置基本不变；大张口时，髁突才与关节盘一起沿关节结节后斜面向前下滑动。髁突不会向后上移位；向内、前、下滑动是侧方运动时非工作侧髁突的运动。",
  },
  {
    id: "tmj-06",
    topic: "muscles",
    lessonId: "tmj-muscles",
    difficulty: 1,
    prompt: "主要使下颌前伸并参与张口的咀嚼肌是：",
    options: ["咬肌", "颞肌", "翼内肌", "翼外肌"],
    answer: 3,
    explanation:
      "翼外肌两侧同时收缩时牵引髁突和关节盘向前，使下颌前伸并参与张口；一侧收缩时使下颌向对侧运动。咬肌、颞肌和翼内肌主要上提下颌，属于闭口肌。",
  },
  {
    id: "tmj-07",
    topic: "muscles",
    lessonId: "tmj-muscles",
    difficulty: 2,
    prompt: "颞肌止于：",
    options: ["喙突及下颌支前缘", "髁突颈的关节翼肌窝", "下颌角外侧的咬肌粗隆", "下颌角内侧的翼肌粗隆"],
    answer: 0,
    explanation:
      "颞肌起自颞窝和颞深筋膜深面，肌束向下汇聚成腱，经颧弓深面止于喙突及下颌支前缘；其后部纤维近水平走行，可使下颌后退。关节翼肌窝是翼外肌的止点；咬肌粗隆是咬肌的止点；翼肌粗隆是翼内肌的止点。",
  },
  {
    id: "tmj-08",
    topic: "muscles",
    lessonId: "tmj-muscles",
    difficulty: 2,
    prompt: "翼内肌的止点是：",
    options: ["下颌角内侧面的翼肌粗隆", "下颌支外侧面的咬肌粗隆", "喙突", "关节盘前缘"],
    answer: 0,
    explanation:
      "翼内肌起自翼外板内侧面、腭骨锥突和上颌结节，止于下颌角内侧面的翼肌粗隆，与咬肌共同在下颌角形成肌悬带。咬肌粗隆是咬肌的止点；喙突是颞肌的止点；关节盘前缘有翼外肌上头的部分纤维附着。",
  },
  {
    id: "tmj-09",
    topic: "muscles",
    lessonId: "tmj-muscles",
    difficulty: 2,
    prompt: "咀嚼肌的运动神经支配来自：",
    options: ["面神经", "下颌神经", "上颌神经", "舌下神经"],
    answer: 1,
    explanation:
      "咬肌、颞肌、翼内肌和翼外肌都由三叉神经下颌神经的运动纤维支配。面神经支配表情肌；上颌神经只含感觉纤维；舌下神经支配舌肌。",
  },
  {
    id: "tmj-10",
    topic: "tmj",
    lessonId: "tmj-muscles",
    difficulty: 2,
    prompt: "下颌向一侧做侧方运动时，工作侧髁突的运动是：",
    options: ["基本在原位转动并稍向外移", "向前、下、内滑动", "向后上脱出下颌窝", "与非工作侧髁突完全相同"],
    answer: 0,
    explanation:
      "侧方运动时，工作侧髁突基本在原位转动并稍向外移，非工作侧髁突则沿关节结节向前、下、内滑动。两侧髁突的运动方式不同；正常情况下髁突不会向后上脱出下颌窝。",
  },
  {
    id: "tmj-11",
    topic: "clinical",
    lessonId: "tmj-muscles",
    difficulty: 2,
    prompt: "颞下颌关节前脱位手法复位时，正确的用力方向是：",
    options: ["先向上推，再向前拉", "直接向后推", "先向下压，再向后推", "先向后推，再向上抬"],
    answer: 2,
    explanation:
      "前脱位时髁突位于关节结节前方。复位时双手拇指置于两侧下颌磨牙咬合面上，先向下压，使髁突降至关节结节水平以下，再向后推，使髁突越过关节结节回到下颌窝。若不先下压而直接后推，髁突会被关节结节阻挡。",
  },
  {
    id: "tmj-12",
    topic: "tmj",
    lessonId: "tmj-muscles",
    difficulty: 3,
    prompt: "可复性关节盘前移位的患者张口时出现弹响，其机制是：",
    options: ["髁突从关节结节前方滑回下颌窝", "张口时髁突越过移位关节盘的后带，关节盘恢复到髁突上方", "关节盘穿孔", "咀嚼肌痉挛"],
    answer: 1,
    explanation:
      "可复性关节盘前移位时，闭口位关节盘位于髁突前方；张口时髁突向前滑动并越过关节盘后带，关节盘回到髁突上方的正常位置，此时产生弹响。髁突从关节结节前方滑回描述的是脱位复位；关节盘穿孔常表现为多声破碎音；咀嚼肌痉挛以疼痛和张口受限为主。",
  },
  {
    id: "tmj-13",
    topic: "tmj",
    lessonId: "tmj-muscles",
    difficulty: 2,
    prompt: "正常成人的张口度约相当于：",
    options: ["五横指", "本人示指、中指、无名指三指末节并拢的宽度", "两横指", "一横指"],
    answer: 1,
    explanation:
      "正常张口度约相当于本人示指、中指、无名指三指末节并拢的宽度，平均约 3.7 cm。张口度只能容纳一至两横指时为张口受限，常见于颞下颌关节疾病、咀嚼肌痉挛或间隙感染等。",
  },
  {
    id: "tmj-14",
    topic: "muscles",
    lessonId: "tmj-muscles",
    difficulty: 3,
    prompt: "一侧翼外肌瘫痪的患者张口时，下颌偏向：",
    options: ["健侧", "不偏斜", "先偏健侧后偏患侧", "患侧"],
    answer: 3,
    explanation:
      "张口时两侧翼外肌牵引髁突向前。一侧翼外肌瘫痪后，患侧髁突不能前移，健侧髁突仍向前滑动，使下颌被推向患侧，因此张口时下颌偏向患侧。",
  },
  // --------------------------------------------------------------------------
  // 第 13 课 口腔的神经支配与局部麻醉解剖
  // --------------------------------------------------------------------------
  {
    id: "ner-01",
    topic: "nerves",
    lessonId: "nerves-anesthesia",
    difficulty: 1,
    prompt: "上颌神经出颅经过：",
    options: ["眶上裂", "圆孔", "卵圆孔", "棘孔"],
    answer: 1,
    explanation:
      "上颌神经（V2）经圆孔出颅进入翼腭窝。眼神经（V1）经眶上裂入眶；下颌神经（V3）经卵圆孔出颅；棘孔有脑膜中动脉通过。",
  },
  {
    id: "ner-02",
    topic: "nerves",
    lessonId: "nerves-anesthesia",
    difficulty: 1,
    prompt: "下颌神经出颅经过：",
    options: ["圆孔", "卵圆孔", "茎乳孔", "颈静脉孔"],
    answer: 1,
    explanation:
      "下颌神经（V3）经卵圆孔出颅至颞下窝。圆孔有上颌神经通过；茎乳孔有面神经穿出；颈静脉孔有舌咽神经、迷走神经、副神经和颈内静脉通过。",
    scene: { view: "bottom", layers: ["skull", "nerves"], ghost: ["skull"] },
  },
  {
    id: "ner-03",
    topic: "nerves",
    lessonId: "nerves-anesthesia",
    difficulty: 2,
    prompt: "三叉神经三大分支中含有运动纤维的是：",
    options: ["下颌神经", "眼神经", "上颌神经", "三支都是纯感觉神经"],
    answer: 0,
    explanation:
      "下颌神经是混合神经，三叉神经运动根的纤维随其分布，支配咀嚼肌等；眼神经和上颌神经都只含感觉纤维，因此“三支都是纯感觉神经”的说法错误。",
  },
  {
    id: "ner-04",
    topic: "nerves",
    lessonId: "nerves-anesthesia",
    difficulty: 2,
    prompt: "传统教材认为上颌第一磨牙的近中颊根由哪支神经支配？",
    options: ["上牙槽后神经", "上牙槽中神经", "上牙槽前神经", "腭大神经"],
    answer: 1,
    explanation:
      "传统教材认为上牙槽中神经分布于上颌前磨牙和第一磨牙近中颊根，上牙槽后神经分布于其余磨牙部分，因此上颌结节注射后，第一磨牙近中颊根有时需要补充浸润麻醉。上牙槽中神经并非人人都有，缺如时由上牙槽前、后神经代偿。腭大神经分布于腭侧软组织，不支配牙髓。",
  },
  {
    id: "ner-05",
    topic: "nerves",
    lessonId: "nerves-anesthesia",
    difficulty: 2,
    prompt: "上颌切牙和尖牙牙髓的神经支配来自：",
    options: ["上牙槽后神经", "上牙槽中神经", "上牙槽前神经", "鼻腭神经"],
    answer: 2,
    explanation:
      "上牙槽前神经在眶下管前段由眶下神经发出，沿上颌窦前壁下行，分布于上颌切牙、尖牙及其唇侧牙龈。鼻腭神经分布于前牙的腭侧牙龈和黏膜，不支配牙髓；上牙槽中、后神经分别分布于前磨牙和磨牙。",
  },
  {
    id: "ner-06",
    topic: "nerves",
    lessonId: "nerves-anesthesia",
    difficulty: 2,
    prompt: "上颌两侧尖牙之间的腭侧牙龈和黏骨膜主要由哪支神经支配？",
    options: ["腭大神经", "上牙槽前神经", "眶下神经", "鼻腭神经"],
    answer: 3,
    explanation:
      "鼻腭神经经切牙孔穿出，分布于两侧上颌尖牙之间的腭侧牙龈和腭前部黏膜，在尖牙腭侧与腭大神经的分布区重叠。腭大神经分布于尖牙以后的腭侧组织；上牙槽前神经和眶下神经分布于唇侧。",
  },
  {
    id: "ner-07",
    topic: "nerves",
    lessonId: "nerves-anesthesia",
    difficulty: 2,
    prompt: "下颌磨牙颊侧牙龈的神经支配来自：",
    options: ["颏神经", "颊神经", "舌神经", "下颌舌骨肌神经"],
    answer: 1,
    explanation:
      "颊神经是下颌神经前干唯一的感觉支，分布于颊部皮肤和黏膜以及下颌磨牙和第二前磨牙的颊侧牙龈，因此拔除下颌磨牙时需另行麻醉颊神经。颏神经分布于前牙和前磨牙的唇颊侧牙龈；舌神经分布于舌侧牙龈；下颌舌骨肌神经是运动神经。",
  },
  {
    id: "ner-08",
    topic: "nerves",
    lessonId: "nerves-anesthesia",
    difficulty: 2,
    prompt: "舌前 2/3 黏膜的一般感觉由哪支神经传导？",
    options: ["舌神经", "舌咽神经", "舌下神经", "鼓索"],
    answer: 0,
    explanation:
      "舌神经是下颌神经后干的分支，传导舌前 2/3 黏膜、口底黏膜和下颌舌侧牙龈的一般感觉。鼓索加入舌神经，传导舌前 2/3 的味觉而不是一般感觉；舌后 1/3 的感觉由舌咽神经传导；舌下神经是舌肌的运动神经。",
    scene: { view: "right", layers: ["teeth", "mandible", "nerves"], ghost: ["mandible"] },
  },
  {
    id: "ner-09",
    topic: "clinical",
    lessonId: "nerves-anesthesia",
    difficulty: 2,
    prompt: "下牙槽神经阻滞麻醉口内法的进针点是：",
    options: ["翼下颌皱襞内侧", "磨牙后垫中央", "下颌第一磨牙颊侧前庭沟", "颊脂垫尖，或翼下颌皱襞中点外侧 3–4 mm 处"],
    answer: 3,
    explanation:
      "口内法以颊脂垫尖为进针点；颊脂垫尖不明显时，以翼下颌皱襞中点外侧 3–4 mm 处为进针点。进针点在翼下颌皱襞内侧易刺入咽侧壁；磨牙后垫和第一磨牙颊侧前庭沟都不是阻滞下牙槽神经的进针点。",
    scene: { view: "right", layers: ["teeth", "mandible", "nerves"], ghost: ["mandible"], jawOpen: 0.8 },
  },
  {
    id: "ner-10",
    topic: "clinical",
    lessonId: "nerves-anesthesia",
    difficulty: 3,
    prompt: "下牙槽神经阻滞麻醉时，注射针应高于下颌咬合平面约多少并与之平行？",
    options: ["与咬合平面平齐", "约 1 cm", "约 2.5 cm", "约 4 cm"],
    answer: 1,
    explanation:
      "患者大张口、下颌咬合平面与地面平行，注射器置于对侧口角第一、二前磨牙之间，与中线约成 45°，针头高于咬合平面约 1 cm 并与之平行，进针约 2.5 cm 触及骨面。2.5 cm 是进针深度而不是高度；与咬合平面平齐则位置偏低。",
  },
  {
    id: "ner-11",
    topic: "clinical",
    lessonId: "nerves-anesthesia",
    difficulty: 3,
    prompt: "下牙槽神经阻滞后出现同侧暂时性面瘫，最可能的原因是：",
    options: ["麻药注入了翼静脉丛", "刺伤了舌神经", "进针过深、过后，麻药进入腮腺麻醉了面神经", "麻药注入了颞下颌关节"],
    answer: 2,
    explanation:
      "下颌支后缘后方为腮腺，面神经在腮腺内穿行。进针过深、过后时，针尖可越过下颌支后缘进入腮腺，麻药浸润面神经，引起暂时性面瘫，药效消失后可恢复。麻药入血管可致全身反应或血肿；舌神经损伤表现为舌麻木；注入关节不会引起面瘫。",
  },
  {
    id: "ner-12",
    topic: "clinical",
    lessonId: "nerves-anesthesia",
    difficulty: 2,
    prompt: "上颌结节注射法（上牙槽后神经阻滞）进针过深时，可能刺破而引起血肿的结构是：",
    options: ["面动脉", "颈内静脉", "舌动脉", "翼静脉丛"],
    answer: 3,
    explanation:
      "上颌结节后上方的颞下窝内有翼静脉丛，进针过深可刺破翼丛引起颞下窝血肿，表现为面颊部迅速肿胀。面动脉在咬肌前缘处走行于面部浅层；颈内静脉和舌动脉都远离上颌结节。",
  },
  {
    id: "ner-13",
    topic: "nerves",
    lessonId: "nerves-anesthesia",
    difficulty: 3,
    prompt: "关于舌神经与下牙槽神经的位置关系，正确的是：",
    options: ["舌神经位于下牙槽神经的后外方", "舌神经位于下牙槽神经的前内方", "两者走行完全重合", "舌神经与下牙槽神经一起经下颌孔进入下颌管"],
    answer: 1,
    explanation:
      "两神经在翼内肌与下颌支之间下行，舌神经位于下牙槽神经的前内方，因此下牙槽神经阻滞注药后将针退出少许再注药，即可麻醉舌神经。只有下牙槽神经经下颌孔进入下颌管，舌神经则继续向前下进入口底。",
  },
  {
    id: "ner-14",
    topic: "clinical",
    lessonId: "nerves-anesthesia",
    difficulty: 3,
    prompt: "下牙槽神经和舌神经阻滞后拔除下颌第一磨牙，患者仍感颊侧牙龈疼痛，应补充麻醉的神经是：",
    options: ["颏神经", "颊神经", "上牙槽后神经", "耳颞神经"],
    answer: 1,
    explanation:
      "下颌磨牙颊侧牙龈由颊神经支配，不在下牙槽神经和舌神经阻滞的范围内，需在磨牙颊侧另行麻醉。颏神经分布于前牙和前磨牙唇颊侧，已被下牙槽神经阻滞覆盖；上牙槽后神经分布于上颌磨牙；耳颞神经分布于耳前和颞部皮肤。",
  },
  {
    id: "ner-15",
    topic: "nerves",
    lessonId: "nerves-anesthesia",
    difficulty: 2,
    prompt: "下牙槽神经由哪个孔进入下颌管？",
    options: ["下颌孔", "颏孔", "切牙孔", "卵圆孔"],
    answer: 0,
    explanation:
      "下牙槽神经经下颌支内侧面的下颌孔进入下颌管，沿途分支至下颌牙，在颏孔附近分出颏神经，颏神经出颏孔分布于下唇和颏部。切牙孔位于上颌，有鼻腭神经穿出；卵圆孔是下颌神经出颅的部位。",
  },

  // --------------------------------------------------------------------------
  // 第 14 课 口腔颌面部血供与静脉回流
  // --------------------------------------------------------------------------
  {
    id: "ves-01",
    topic: "vessels",
    lessonId: "vessels",
    difficulty: 1,
    prompt: "颈外动脉的两个终支是：",
    options: ["面动脉和舌动脉", "甲状腺上动脉和舌动脉", "枕动脉和耳后动脉", "上颌动脉和颞浅动脉"],
    answer: 3,
    explanation:
      "颈外动脉上行穿入腮腺，至下颌颈后方分为上颌动脉和颞浅动脉两个终支。面动脉、舌动脉、甲状腺上动脉、枕动脉和耳后动脉都是颈外动脉在行程中发出的侧支。",
  },
  {
    id: "ves-02",
    topic: "vessels",
    lessonId: "vessels",
    difficulty: 2,
    prompt: "下牙槽动脉发自上颌动脉的：",
    options: ["第一段（下颌段）", "第二段（翼肌段）", "第三段（翼腭段）", "颈外动脉主干"],
    answer: 0,
    explanation:
      "上颌动脉以翼外肌为标志分为三段，下牙槽动脉和脑膜中动脉发自第一段（下颌段）。第二段发出咀嚼肌支和颊动脉；第三段发出上牙槽后动脉、眶下动脉、腭降动脉和蝶腭动脉；下牙槽动脉并不直接发自颈外动脉主干。",
  },
  {
    id: "ves-03",
    topic: "vessels",
    lessonId: "vessels",
    difficulty: 2,
    prompt: "上牙槽后动脉发自：",
    options: ["上颌动脉第一段", "上颌动脉第二段", "上颌动脉第三段（翼腭段）", "面动脉"],
    answer: 2,
    explanation:
      "上牙槽后动脉发自上颌动脉第三段（翼腭段），沿上颌结节后面下行，经牙槽孔入骨，供应上颌磨牙、前磨牙和上颌窦。第一段发出下牙槽动脉；第二段发出咀嚼肌支和颊动脉；面动脉分布于面浅部。",
  },
  {
    id: "ves-04",
    topic: "vessels",
    lessonId: "vessels",
    difficulty: 2,
    prompt: "面动脉绕过下颌骨下缘进入面部的位置是：",
    options: ["下颌角处", "咬肌前缘处", "颏孔下方", "下颌支后缘"],
    answer: 1,
    explanation:
      "面动脉在咬肌前缘处绕过下颌骨下缘进入面部，此处位置表浅，可触及搏动，面部出血时可在此压迫止血。下颌角、颏孔下方和下颌支后缘都不是它绕行的部位。",
    scene: { view: "right", layers: ["mandible", "muscles", "skull"], ghost: ["skull"] },
  },
  {
    id: "ves-05",
    topic: "vessels",
    lessonId: "vessels",
    difficulty: 2,
    prompt: "翼丛（翼静脉丛）的血液主要经哪条静脉回流？",
    options: ["面静脉", "颈外静脉", "上颌静脉", "舌静脉"],
    answer: 2,
    explanation:
      "翼丛的血液主要经上颌静脉向后汇入下颌后静脉；翼丛虽借面深静脉与面静脉相通，但这不是其主要回流途径。颈外静脉由下颌后静脉后支与耳后静脉汇合而成，不直接收集翼丛的血液；舌静脉收集舌的静脉血。",
  },
  {
    id: "ves-06",
    topic: "vessels",
    lessonId: "vessels",
    difficulty: 2,
    prompt: "下颌后静脉由哪两条静脉汇合而成？",
    options: ["面静脉和舌静脉", "颞浅静脉和上颌静脉", "上颌静脉和面深静脉", "耳后静脉和枕静脉"],
    answer: 1,
    explanation:
      "下颌后静脉由颞浅静脉和上颌静脉在腮腺内汇合而成，下行至下颌角附近分为前、后两支：前支汇入面静脉，后支与耳后静脉合成颈外静脉。其余组合都不形成下颌后静脉。",
  },
  {
    id: "ves-07",
    topic: "clinical",
    lessonId: "vessels",
    difficulty: 1,
    prompt: "面部危险三角是指：",
    options: ["两侧口角至鼻根连线所形成的三角区", "两侧下颌角与颏部连线所形成的三角区", "两侧外眦与鼻尖连线所形成的三角区", "两侧耳屏与颏部连线所形成的三角区"],
    answer: 0,
    explanation:
      "面部危险三角是两侧口角至鼻根连线所形成的三角区。该区的静脉经内眦静脉、眼静脉等与颅内海绵窦交通，感染处理不当可向颅内扩散，因此严禁挤压该区的疖肿。其余三个区域都不是危险三角的定义。",
    scene: { view: "front", layers: ["veins", "maxilla", "skull"], ghost: ["maxilla", "skull"] },
  },
  {
    id: "ves-08",
    topic: "clinical",
    lessonId: "vessels",
    difficulty: 2,
    prompt: "面部危险三角区的疖肿被挤压后，最危险的颅内并发症是：",
    options: ["海绵窦血栓性静脉炎", "乙状窦血栓形成", "上矢状窦血栓形成", "硬脑膜外血肿"],
    answer: 0,
    explanation:
      "危险三角区的静脉经内眦静脉、眼上静脉与海绵窦交通，挤压疖肿可使细菌栓子逆行入颅，引起海绵窦血栓性静脉炎，表现为眼睑水肿、眼球突出、眼球运动障碍等。乙状窦血栓多与中耳乳突感染有关；硬脑膜外血肿多由外伤出血引起；上矢状窦并不经此途径直接受累。",
  },
  {
    id: "ves-09",
    topic: "vessels",
    lessonId: "vessels",
    difficulty: 3,
    prompt: "面静脉与颅内海绵窦交通的主要途径是：",
    options: ["经颈外静脉", "经舌静脉", "经甲状腺上静脉", "经内眦静脉和眼静脉"],
    answer: 3,
    explanation:
      "面静脉起自内眦静脉，内眦静脉经眼上静脉与海绵窦相通；面深部的翼丛也经面深静脉和卵圆孔网等导血管与海绵窦交通。颈外静脉、舌静脉和甲状腺上静脉都向下回流至颈部，不是面静脉与海绵窦交通的途径。",
  },
  {
    id: "ves-10",
    topic: "vessels",
    lessonId: "vessels",
    difficulty: 2,
    prompt: "腭降动脉出腭大孔后称为：",
    options: ["腭小动脉", "蝶腭动脉", "腭大动脉", "切牙动脉"],
    answer: 2,
    explanation:
      "腭降动脉发自上颌动脉第三段，经翼腭管下行，出腭大孔后称腭大动脉，沿硬腭向前，供应硬腭黏膜和腭侧牙龈。腭小动脉出腭小孔分布于软腭；蝶腭动脉供应鼻腔；切牙动脉是下牙槽动脉在下颌骨内向前延续的分支。",
  },
  {
    id: "ves-11",
    topic: "clinical",
    lessonId: "vessels",
    difficulty: 3,
    prompt: "结扎颈外动脉时，鉴别颈外动脉与颈内动脉最可靠的解剖依据是：",
    options: ["颈外动脉较粗", "颈外动脉位于颈内动脉的后外侧", "颈内动脉有搏动，颈外动脉无搏动", "颈外动脉在颈部有分支，颈内动脉在颈部无分支"],
    answer: 3,
    explanation:
      "颈内动脉在颈部不发出分支，颈外动脉在颈部发出甲状腺上动脉、舌动脉、面动脉等分支，这是二者鉴别的可靠依据，确认后一般在甲状腺上动脉与舌动脉之间结扎颈外动脉。颈外动脉起始段位于颈内动脉的前内侧；两者都有搏动；粗细不能作为可靠依据。",
  },
  {
    id: "ves-12",
    topic: "clinical",
    lessonId: "vessels",
    difficulty: 2,
    prompt: "局部麻醉注射前必须回抽，主要目的是：",
    options: ["避免将麻药注入血管", "检查针头是否通畅", "减少麻药用量", "确认针尖已触及骨面"],
    answer: 0,
    explanation:
      "口腔颌面部血管丰富，下牙槽动、静脉和翼丛都邻近常用注射部位，注药前回抽无血可避免麻药直接注入血管，减少全身毒性反应等并发症。回抽不能确认针尖是否触及骨面，也与针头是否通畅和用药量无关。",
  },
  {
    id: "ves-13",
    topic: "vessels",
    lessonId: "vessels",
    difficulty: 2,
    prompt: "上、下唇动脉是哪条动脉的分支？",
    options: ["上颌动脉", "颞浅动脉", "舌动脉", "面动脉"],
    answer: 3,
    explanation:
      "上、下唇动脉是面动脉在口角附近发出的分支，在唇内与对侧同名动脉吻合形成动脉环，因此唇部外伤出血较多，可捏住两侧口角处的唇组织压迫止血。上颌动脉供应深部结构；颞浅动脉分布于颞部；舌动脉供应舌和口底。",
  },
  {
    id: "ves-14",
    topic: "vessels",
    lessonId: "vessels",
    difficulty: 3,
    prompt: "关于上颌动脉的分段，正确的是：",
    options: ["以咬肌为标志分为三段", "以翼外肌为标志分为三段", "以颞肌为标志分为两段", "以下颌支后缘为标志分为两段"],
    answer: 1,
    explanation:
      "上颌动脉以翼外肌为标志分为三段：第一段（下颌段）位于下颌颈深面，第二段（翼肌段）位于翼外肌浅面或深面，第三段（翼腭段）进入翼腭窝。咬肌、颞肌和下颌支后缘都不是分段标志。",
  },
];
