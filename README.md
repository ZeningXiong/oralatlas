# OralAtlas · 口腔三维解剖图谱

面向口腔医学生自学的交互式 3D 口腔解剖网站。基于真实解剖数据（BodyParts3D / Z-Anatomy，经 Dental Scope 处理），
在浏览器中系统学习牙体形态、牙体与牙周组织、颌骨与颞下颌关节、口腔颌面部神经血管。

## 功能

| 模块 | 内容 |
|---|---|
| **探索** | 颅骨、上下颌骨、牙槽骨、牙龈、32 颗恒牙、颞下颌关节、鼻旁窦、48 条神经、14 条动脉、12 条静脉、咀嚼肌与口周肌；图层显示 / 半透明 / 隐藏 / 仅显示；预设视角；上下颌分离；张口（神经血管与肌肉随下颌拉伸）；任意方向剖切（带断面着色）；结构标签与骨性标志点 |
| **单牙解剖** | 双击任意牙齿：釉质、冠部/根部牙本质、牙骨质、牙周膜、髓室、各根管逐层开关与分层展开；沿牙体坐标系剖切（近远中向 / 颊舌向 / 水平向）；牙尖、嵴、窝、髓角、根尖孔等标注 |
| **牙位记录** | FDI、通用编号、Palmer 随时切换；牙位图（面对患者视角）浏览与学习进度 |
| **知识内容** | 16 种牙型完整形态学指南（按面描述、牙根、髓腔、根管数文献统计、发育时间、鉴别要点、临床意义、变异）；全部结构释义（定义、解剖要点、临床意义、相关结构）；每个结构标注模型几何可信度 |
| **课程** | 14 节系统课程，每一节自动切换到对应的 3D 场景 |
| **测验** | 知识题库（按主题 / 课程，错题重练）；3D 找牙；牙位编号换算；3D 结构识别；掌握情况统计 |
| **术语表** | 中英拉丁对照，按分组浏览与搜索 |
| **其他** | 全局搜索（牙位号任一记录法、中英文名、术语、课程章节）；深链接（`#/tooth/36`、`#/dissect/16`、`#/s/inferior-alveolar-nerve-right`、`#/lesson/molars`）；深浅色主题；键盘快捷键；保存画面；移动端适配；学习进度本地保存 |

## 运行

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # 类型检查 + 生产构建（dist/，可部署到任意静态托管）
npm run preview
```

需要支持 WebGL 2 的现代浏览器。首次加载约 7 MB（核心模型），单牙内部结构按需加载。

## 架构

底层方法沿用 [thebuggeddev/anatomy](https://github.com/thebuggeddev/anatomy)：命令式 three.js 引擎 + React 界面，引擎订阅全局状态、按需渲染，覆盖层由引擎直接定位。

```
src/
  engine/        Engine.ts（场景、分阶段加载、可见性、颌骨运动、剖切、拾取、标签、相机）
                 materials.ts（组织材质 + 着色器补丁：断面、X 光半透明、高亮、颌骨联动顶点插值）
                 weights.ts（肌肉“颌骨权重”的三维距离场）  smooth.ts（Taubin 平滑）
  anatomy/       registry.ts（网格 → 类别 / 运动层级 / 名称）  notation.ts（三种牙位记录法）
  content/       types.ts（内容接口） teeth.ts toothParts.ts structures.ts lessons.ts quiz.ts glossary.ts
  state/         store.ts（zustand：场景、界面、学习进度）
  search/        全局搜索索引
  ui/            React 组件（顶栏、图层、牙位图、结构树、详情、工具条、课程、测验、术语、对话框）
public/models/   GLB 模型与 manifest.json
```

关键设计：

- **数据驱动**：所有结构 ID、类别、牙体坐标系、根管、标志点都来自 `manifest.json`，界面不硬编码。
- **一个可见性函数**：`Engine.resolve()` 统一处理类别、单牙解剖、牙弓过滤、仅显示、隐藏、半透明、神经血管时骨骼自动透视。
- **颌骨联动**：神经血管网格的顶点色记录“随颅骨 / 随下颌”权重；肌肉在加载时用距离场计算权重；着色器在两套变换间插值，张口和分离时不断裂。
- **可见区域居中**：`setInsets()` + `camera.setViewOffset()`，模型始终在面板之外的区域居中。
- **性能**：加载后用真实材质向 1×1 离屏目标预热绘制（避免首次显示/透明切换时编译着色器卡顿）；
  “流畅”画质（集成显卡自动启用，也可在“视角”菜单手动切换）关闭清漆/光泽层、像素比上限 1.25、
  旋转与过渡时临时降分辨率，并用 meshoptimizer 生成简化几何（默认视图约 122 万 → 32 万三角形）。

## 数据与许可

- 3D 模型：BodyParts3D，© The Database Center for Life Science，CC BY-SA 2.1 Japan；神经血管中心线来自 Z-Anatomy（CC BY-SA 4.0）；
  由 [Dental Scope](https://github.com/Yoosseph/dental-scope) 处理后以相同许可共享。`public/models/` 中的文件因此按 **CC BY-SA** 分发。
- 根管统计：Monsarrat et al., PLOS ONE 2016（CC BY）；Al-Qudah et al., Sci Rep 2023（CC BY 4.0）。
- 教学文字（牙型指南、结构释义、课程、题库、术语表）**由 AI（Claude）辅助编写，尚未经口腔专业人员逐条审校**。
  撰写时参照国内《口腔解剖生理学》教材体系与规范名词，但未逐条对照教材原文；部分事实与 Dental Scope 的英文资料（CC BY-SA 4.0）交叉核对。
  根管百分比转引自 Dental Scope 整理的数据，未与论文原文核对。依 CC BY-SA 4.0 共享。
- 代码：MIT。

**声明**：教学文字由 AI 辅助编写、正在审校中；本站为教学参考，不用于诊断、治疗计划或任何临床决策。
