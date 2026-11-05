// ============================================================================
// 病变演示的参考文献。每条都已通过 Crossref（DOI 解析）核对题名、作者、期刊与页码，
// 核对日期 2026-11-05。卷期年份以 DOI 页面为准。
// ============================================================================

export interface Reference {
  id: string;
  /** 引文（温哥华格式） */
  citation: string;
  doi?: string;
  /** 本站用它支持哪些内容 */
  usedFor: string;
  usedForEn: string;
}

export const REFERENCES: Record<string, Reference> = {
  ICDAS: {
    id: "ICDAS",
    citation:
      "Ismail AI, Sohn W, Tellez M, et al. The International Caries Detection and Assessment System (ICDAS): an integrated system for measuring dental caries. Community Dent Oral Epidemiol. 2007;35(3):170–178.",
    doi: "10.1111/j.1600-0528.2007.00347.x",
    usedFor: "龋病各阶段的视觉分级（ICDAS 0–6）及各编码的视觉表现描述。",
    usedForEn: "Visual grading of caries stages (ICDAS 0–6) and the description of the visual appearance for each code.",
  },
  Pitts2017: {
    id: "Pitts2017",
    citation: "Pitts NB, Zero DT, Marsh PD, et al. Dental caries. Nat Rev Dis Primers. 2017;3:17030.",
    doi: "10.1038/nrdp.2017.30",
    usedFor: "龋病作为菌斑生物膜介导、受糖摄入驱动的动态疾病的总体概念；病损可进展也可停止。",
    usedForEn: "The overall concept of caries as a dynamic disease mediated by plaque biofilm and driven by sugar intake; lesions can progress or arrest.",
  },
  Featherstone2008: {
    id: "Featherstone2008",
    citation: "Featherstone JDB. Dental caries: a dynamic disease process. Aust Dent J. 2008;53(3):286–291.",
    doi: "10.1111/j.1834-7819.2008.00064.x",
    usedFor: "产酸—脱矿与唾液/氟化物—再矿化交替进行的机制；早期病损可再矿化。",
    usedForEn: "The mechanism of alternating acid production/demineralization and saliva/fluoride remineralization; early lesions can remineralize.",
  },
  Stephan1944: {
    id: "Stephan1944",
    citation:
      "Stephan RM. Intra-oral hydrogen-ion concentrations associated with dental caries activity. J Dent Res. 1944;23(4):257–266.",
    doi: "10.1177/00220345440230040401",
    usedFor: "进食糖后菌斑 pH 快速下降、随后缓慢回升的曲线形态（“Stephan 曲线”）。图中曲线为示意形态，非原文数据点。",
    usedForEn: "The shape of the curve in which plaque pH falls rapidly after sugar intake and then slowly recovers (the “Stephan curve”). The curve in the chart is schematic, not the original data points.",
  },
  Ekstrand1997: {
    id: "Ekstrand1997",
    citation:
      "Ekstrand KR, Ricketts DNJ, Kidd EAM. Reproducibility and accuracy of three methods for assessment of demineralization depth on the occlusal surface: an in vitro examination. Caries Res. 1997;31(3):224–231.",
    doi: "10.1159/000262404",
    usedFor: "咬合面病损的组织学深度分级（釉质外半、釉质内半至牙本质外 1/3、牙本质中 1/3、内 1/3），用于设定各阶段病损深度的相对比例。",
    usedForEn: "The histological depth scale of occlusal lesions (outer half of enamel; inner half of enamel to outer third of dentin; middle third of dentin; inner third of dentin), used to set the relative lesion depth of each stage.",
  },
  Machiulskiene2020: {
    id: "Machiulskiene2020",
    citation:
      "Machiulskiene V, Campus G, Carvalho JC, et al. Terminology of dental caries and dental caries management: consensus report of a workshop organized by ORCA and Cariology Research Group of IADR. Caries Res. 2020;54(1):7–14.",
    doi: "10.1159/000503309",
    usedFor: "龋病、龋损、活动性/静止性病损等术语的规范用法。",
    usedForEn: "Standard usage of terms such as caries, carious lesion, and active/arrested lesion.",
  },
  Glickman2009: {
    id: "Glickman2009",
    citation:
      "Glickman GN. AAE Consensus Conference on Diagnostic Terminology: background and perspectives. J Endod. 2009;35(12):1619–1620.",
    doi: "10.1016/j.joen.2009.09.029",
    usedFor: "牙髓与根尖周诊断术语（可复性/不可复性牙髓炎、牙髓坏死、根尖周炎）。",
    usedForEn: "Pulpal and periapical diagnostic terms (reversible/irreversible pulpitis, pulp necrosis, apical periodontitis).",
  },
  Ricucci2014: {
    id: "Ricucci2014",
    citation:
      "Ricucci D, Loghin S, Siqueira JF Jr. Correlation between clinical and histologic pulp diagnoses. J Endod. 2014;40(12):1932–1939.",
    doi: "10.1016/j.joen.2014.08.010",
    usedFor: "龋源性牙髓炎的组织学进程与临床诊断（可复性/不可复性）之间的对应关系。",
    usedForEn: "The correspondence between the histological course of caries-induced pulpitis and the clinical diagnosis (reversible/irreversible).",
  },
  Kakehashi1965: {
    id: "Kakehashi1965",
    citation:
      "Kakehashi S, Stanley HR, Fitzgerald RJ. The effects of surgical exposures of dental pulps in germ-free and conventional laboratory rats. Oral Surg Oral Med Oral Pathol. 1965;20(3):340–349.",
    doi: "10.1016/0030-4220(65)90166-0",
    usedFor: "细菌是牙髓坏死与根尖周病变发生的必要条件（无菌动物牙髓暴露后可愈合）。",
    usedForEn: "Bacteria are necessary for pulp necrosis and periapical lesions to develop (exposed pulps healed in germ-free animals).",
  },
  Nair2004: {
    id: "Nair2004",
    citation:
      "Nair PNR. Pathogenesis of apical periodontitis and the causes of endodontic failures. Crit Rev Oral Biol Med. 2004;15(6):348–381.",
    doi: "10.1177/154411130401500604",
    usedFor: "根管内感染经根尖孔引起根尖周炎症与骨吸收的发病机制。",
    usedForEn: "The pathogenesis by which intracanal infection causes periapical inflammation and bone resorption through the apical foramen.",
  },
};
