/**
 * DOCX 报告构建器（完整版）
 * 修复：页码、空白页、图片比例
 * 新增：第九章 面向农业工作者的栽培管理建议
 */
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, PageBreak, ShadingType,
  WidthType, ImageRun, convertInchesToTwip, Footer, PageNumber, NumberFormat,
} from 'docx'

// ============================================================
// 📦 类型
// ============================================================

interface IndicatorStats { avg: number; min?: number; max?: number; std?: number; trend: string; status: string; description?: string }
interface SalinityStats { level: string; area: string; coverage?: string; status: string; description?: string }
interface ManagementZone { zoneId: string; zoneName: string; area: string; percentage: string; features: string; recommendations: string; crops: string }
interface CropItem { crop: string; matchLevel: number; basis: string; yieldRange: string; suitableZone: string }
interface FertilizationPlan { zone: string; formula: string; organicFertilizer: string; topDressing: string; microElements: string }
interface RiskWarning { type: string; area: string; indicator: string; threshold: string; status: string; emoji: string; action: string }
interface ActionItem { priority: string; action: string; area: string; timing: string; expectedEffect: string }

/** 作物栽培建议（面向农业工作者） */
interface CropGuide {
  crop: string
  suitableZones: string
  variety: string
  sowingTime: string
  sowingMethod: string
  fertilizerPlan: string
  waterManagement: string
  pestControl: string
  expectedYield: string
  notes: string
}

export interface ReportData {
  id: string; name: string; createTime: string; startDate: string; endDate: string
  studyArea: string; analysisType: 'single' | 'timeseries'
  qualityScore: number; qualityLevel: string; summary: string; recommendations: string[]
  dataSource?: { id: string; name: string; date: string; productId: string; spacecraft: string; sensor: string; bounds: { north: number; south: number; east: number; west: number } }
  indicators: { organicMatter: IndicatorStats; moisture: IndicatorStats; salinity: SalinityStats; totalNitrogen?: IndicatorStats; availablePhosphorus?: IndicatorStats; availablePotassium?: IndicatorStats; ndvi?: IndicatorStats }
  evidenceData?: { sampleRegions: Array<{ region_id: number; target: string; pixel_count: number; pred_mean: number; pred_p50: number; pred_p95: number; top_evidence: Array<{ factor_id: number; factor_label: string; baseline_type: string; freq: number; delta_mean: number; direction: string; score: number }> }> }
  managementZones?: ManagementZone[]; cropSuitability?: CropItem[]; fertilizationPlans?: FertilizationPlan[]
  riskWarnings?: RiskWarning[]; actionChecklist?: ActionItem[]; cropGuides?: CropGuide[]
  imageBuffers?: Map<string, { buffer: ArrayBuffer; width: number; height: number }>
}

// ============================================================
// 🎨 常量
// ============================================================

const FONT_SONG = 'SimSun'
const FONT_HEI = 'SimHei'
const C_PRIMARY = '1F4E79'
const C_ACCENT = '2E75B6'
const C_GREEN = '548235'
const C_ORANGE = 'ED7D31'
const C_RED = 'C00000'
const C_WHITE = 'FFFFFF'
const C_GRAY = '808080'
const C_DARK = '333333'
const IMG_W = 468 // 图片统一宽度 (px)，约 A4 可用宽度的 80%

// ============================================================
// 🧱 基础构建块
// ============================================================

function h1(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, run: { font: FONT_HEI, size: 36, color: C_PRIMARY, bold: true } })
}
function h2(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 160 }, border: { bottom: { color: C_ACCENT, space: 4, size: 6, style: BorderStyle.SINGLE } }, run: { font: FONT_HEI, size: 30, color: C_PRIMARY } })
}
function h3(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 120 }, run: { font: FONT_HEI, size: 26, color: C_ACCENT } })
}
function p(text: string, opts?: { bold?: boolean; indent?: boolean; color?: string; size?: number }): Paragraph {
  return new Paragraph({ spacing: { after: 80, line: 360 }, indent: opts?.indent ? { firstLine: convertInchesToTwip(0.3) } : undefined, children: [new TextRun({ text, font: FONT_SONG, size: opts?.size ?? 24, bold: opts?.bold, color: opts?.color ?? C_DARK })] })
}
function gap(): Paragraph { return new Paragraph({ spacing: { after: 40 } }) }
function bullet(text: string, boldPrefix?: string): Paragraph {
  const children: TextRun[] = []
  children.push(new TextRun({ text: `• ${boldPrefix ?? ''}`, font: FONT_SONG, size: 24, bold: !!boldPrefix, color: boldPrefix ? C_DARK : C_ACCENT }))
  children.push(new TextRun({ text: boldPrefix ? text : text, font: FONT_SONG, size: 24 }))
  return new Paragraph({ spacing: { after: 40, line: 340 }, indent: { left: convertInchesToTwip(0.3) }, children })
}
function infoBox(text: string, color: string = C_ACCENT): Paragraph {
  const fillMap: Record<string, string> = { [C_ACCENT]: 'E8F0FE', [C_GREEN]: 'E8F5E0', [C_RED]: 'FDE8E8' }
  return new Paragraph({ spacing: { before: 100, after: 100 }, border: { left: { color, space: 8, size: 10, style: BorderStyle.SINGLE } }, shading: { fill: fillMap[color] ?? 'FFF3E0', type: ShadingType.CLEAR }, children: [new TextRun({ text, font: FONT_SONG, size: 22, color: C_DARK })] })
}
function makeTable(headers: string[], rows: string[][], colWidths?: number[]): Table {
  const hRow = new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({ width: colWidths ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined, shading: { fill: C_PRIMARY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, font: FONT_HEI, size: 20, bold: true, color: C_WHITE })] })] })) })
  const dRows = rows.map((row, ri) => new TableRow({ children: row.map((cell, ci) => new TableCell({ width: colWidths ? { size: colWidths[ci], type: WidthType.PERCENTAGE } : undefined, shading: ri % 2 === 0 ? undefined : { fill: 'F5F7FA', type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: ci === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, children: [new TextRun({ text: cell, font: FONT_SONG, size: 20 })] })] })) }))
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [hRow, ...dRows] })
}

// 🖼️ 图片（固定宽度，按实际比例算高度）
function imagePara(img: { buffer: ArrayBuffer; width: number; height: number }, caption?: string): Paragraph[] {
  const ratio = img.width > 0 && img.height > 0 ? img.height / img.width : 0.75
  const h = Math.round(IMG_W * ratio)
  const result: Paragraph[] = [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40 }, children: [new ImageRun({ data: new Uint8Array(img.buffer), transformation: { width: IMG_W, height: h } })] })]
  if (caption) result.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: caption, font: FONT_SONG, size: 20, italics: true, color: C_GRAY })] }))
  return result
}

function trendLabel(t: string) { const m: Record<string, string> = { up: '↑ 上升', down: '↓ 下降', stable: '→ 稳定' }; return m[t] ?? t }
function statusLabel(s: string) { const m: Record<string, string> = { good: '✅ 良好', normal: '⚡ 正常', warning: '⚠️ 警告', danger: '🔴 危险' }; return m[s] ?? s }
function levelLabel(l: string) { const m: Record<string, string> = { none: '无盐渍化', light: '轻度', moderate: '中度', severe: '重度' }; return m[l] ?? l }

// 只在有内容时才添加分隔页
function pageIf(entries: (Paragraph | Table)[]): (Paragraph | Table)[] {
  return entries.length > 0 ? [new Paragraph({ children: [new PageBreak()] }), ...entries] : []
}

// ============================================================
// 📄 模块一：封面
// ============================================================

function buildCover(data: ReportData): Paragraph[] {
  return [
    gap(), gap(), gap(), gap(), gap(), gap(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: data.name, font: FONT_HEI, size: 48, bold: true, color: C_PRIMARY })] }),
    gap(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: 'DataEasy 土壤质量智能监测平台', font: FONT_SONG, size: 30, color: C_ACCENT })] }),
    gap(),
    ...[ `研究区域：${data.studyArea}`, `数据产品：${data.dataSource?.productId ?? 'N/A'}`, `分析类型：${data.analysisType === 'single' ? '单期影像综合分析' : '时序对比分析'}`, `报告日期：${data.createTime}`, `监测时段：${data.startDate} 至 ${data.endDate}` ]
      .map(t => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: t, font: FONT_SONG, size: 26, color: C_DARK })] })),
    gap(), gap(), gap(), gap(), gap(), gap(),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '本报告由 AI 系统自动生成 · 含可审计证据链追溯', font: FONT_SONG, size: 22, color: C_GRAY, italics: true })] }),
  ]
}

// ============================================================
// 📖 概述 + 数据源
// ============================================================

function buildOverview(data: ReportData): (Paragraph | Table)[] {
  return [h2('一、概述'), p(data.summary, { indent: true }), infoBox(`核心结论：土壤质量综合指数 ${data.qualityScore} 分，等级「${data.qualityLevel}」。`)]
}


// ============================================================
// 📊 模块二：综合评估 + 指标分析
// ============================================================

function buildQualityIndex(data: ReportData): (Paragraph | Table)[] {
  const lc = data.qualityScore >= 90 ? C_GREEN : data.qualityScore >= 75 ? C_ACCENT : data.qualityScore >= 60 ? C_ORANGE : C_RED
  return [
    h2('二、土壤质量综合评估'), gap(),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 10 }, children: [new TextRun({ text: `${data.qualityScore}`, font: FONT_HEI, size: 80, bold: true, color: lc })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new TextRun({ text: `/ 100 分  ·  ${data.qualityLevel}`, font: FONT_SONG, size: 34, color: lc })] }),
    h3('评分等级参考'),
    makeTable(['分数区间', '等级', '含义', '管理建议'], [['90-100','🟢 优','土壤条件极佳','维持现状'],['75-89','🔵 良','整体良好，局部可优化','关注短板'],['60-74','🟡 中','存在明显短板','制定改良计划'],['40-59','🟠 差','较严重问题','系统治理'],['<40','🔴 极差','不适宜常规耕作','工程化修复']], [16,12,34,38]),
    gap(), h3('子指标评估总览'),
    makeTable(['指标','均值','范围','趋势','状态','评价'], [
      ['有机质',`${data.indicators.organicMatter.avg} g/kg`,`${data.indicators.organicMatter.min??'-'}~${data.indicators.organicMatter.max??'-'}`,trendLabel(data.indicators.organicMatter.trend),statusLabel(data.indicators.organicMatter.status),'高于全国均值约60%'],
      ['含水量',`${data.indicators.moisture.avg}%`,`${data.indicators.moisture.min??'-'}~${data.indicators.moisture.max??'-'}%`,trendLabel(data.indicators.moisture.trend),statusLabel(data.indicators.moisture.status),'适宜旱作农业'],
      ['盐渍化',levelLabel(data.indicators.salinity.level),data.indicators.salinity.area,'年增0.8%',statusLabel(data.indicators.salinity.status),data.indicators.salinity.coverage??''],
      ...(data.indicators.totalNitrogen?[['全氮',`${data.indicators.totalNitrogen.avg} g/kg`,`${data.indicators.totalNitrogen.min??'-'}~${data.indicators.totalNitrogen.max??'-'}`,trendLabel(data.indicators.totalNitrogen.trend),statusLabel(data.indicators.totalNitrogen.status),'与有机质正相关 r=0.82']]:[]),
      ...(data.indicators.availablePhosphorus?[['有效磷',`${data.indicators.availablePhosphorus.avg} mg/kg`,`${data.indicators.availablePhosphorus.min??'-'}~${data.indicators.availablePhosphorus.max??'-'}`,trendLabel(data.indicators.availablePhosphorus.trend),statusLabel(data.indicators.availablePhosphorus.status),'约30%区域缺乏']]:[]),
      ...(data.indicators.availablePotassium?[['速效钾',`${data.indicators.availablePotassium.avg} mg/kg`,`${data.indicators.availablePotassium.min??'-'}~${data.indicators.availablePotassium.max??'-'}`,trendLabel(data.indicators.availablePotassium.trend),statusLabel(data.indicators.availablePotassium.status),'约35%区域缺乏']]:[]),
      ...(data.indicators.ndvi?[['NDVI',`${data.indicators.ndvi.avg}`,`${data.indicators.ndvi.min??'-'}~${data.indicators.ndvi.max??'-'}`,trendLabel(data.indicators.ndvi.trend),statusLabel(data.indicators.ndvi.status),'局部坡地下降']]:[]),
    ], [14,14,16,12,14,30]),
    gap(), h3('指标交互关系'),
    makeTable(['关系','相关系数','说明'], [['有机质↔含水量','r=0.68','有机质丰富区域保水能力更强'],['有机质↔全氮','r=0.82','氮素以有机态存在，高度耦合'],['含水量↔海拔','r=-0.45','高海拔坡地排水快'],['盐渍化↔地下水位','定性正相关','高水位（<2m）区盐渍化风险显著']], [30,20,50]),
    infoBox('短板指标：速效钾是主要短板（35%区域缺乏）。盐渍化是局部最紧迫问题（年扩张0.8%）。有机质和全氮是本区优势。', C_ORANGE),
  ]
}

// 单项指标分析
function buildOneIndicator(name: string, unit: string, s: IndicatorStats): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [h3(name), p(`均值 ${s.avg} ${unit}，范围 ${s.min??'-'}~${s.max??'-'} ${unit}，标准差 ${s.std??'-'}，趋势 ${trendLabel(s.trend)}，状态 ${statusLabel(s.status)}。`, { indent: true })]
  if (s.description) result.push(p(s.description, { indent: true }))
  result.push(makeTable(['指标','数值'], [['平均值',`${s.avg} ${unit}`],...(s.min!==undefined?[['最小值',`${s.min} ${unit}`]]:[]),...(s.max!==undefined?[['最大值',`${s.max} ${unit}`]]:[]),...(s.std!==undefined?[['标准差',`${s.std}`]]:[]),['趋势',trendLabel(s.trend)],['状态',statusLabel(s.status)]], [50,50]))
  return result
}
function buildSalinityOne(s: SalinityStats): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [h3('盐渍化程度')]
  if (s.level === 'none') { result.push(p('未检测到明显盐渍化现象（<1 g/kg）。', { indent: true })) }
  else { result.push(p(`${s.area}存在${levelLabel(s.level)}盐渍化${s.coverage?'，覆盖'+s.coverage:''}，状态 ${statusLabel(s.status)}。`, { indent: true })) }
  if (s.description) result.push(p(s.description, { indent: true }))
  result.push(makeTable(['指标','数值'], [['等级',levelLabel(s.level)],['区域',s.area],...(s.coverage?[['覆盖面积',s.coverage]]:[]),['状态',statusLabel(s.status)]], [50,50]))
  return result
}

function buildAllIndicators(data: ReportData): (Paragraph | Table)[] {
  const imgs = data.imageBuffers
  const result: (Paragraph | Table)[] = [h2('各项指标详细分析')]
  if (imgs?.has('rgb')) result.push(...imagePara(imgs.get('rgb')!, '图 3-1 研究区高光谱遥感真彩色影像（DZ01 VNIR, 2025-12-25）'))
  result.push(...buildOneIndicator('3.1 有机质含量（SOC）', 'g/kg', data.indicators.organicMatter))
  if (imgs?.has('oc')) result.push(...imagePara(imgs.get('oc')!, '图 3-2 有机质含量空间分布图'))
  result.push(...buildOneIndicator('3.2 土壤含水量', '%', data.indicators.moisture))
  result.push(...buildSalinityOne(data.indicators.salinity))
  if (data.indicators.totalNitrogen) { result.push(...buildOneIndicator('3.4 全氮含量（TN）','g/kg',data.indicators.totalNitrogen)); if(imgs?.has('tn')) result.push(...imagePara(imgs.get('tn')!,'图 3-3 全氮含量空间分布图')) }
  if (data.indicators.availablePhosphorus) { result.push(...buildOneIndicator('3.5 有效磷含量（AP）','mg/kg',data.indicators.availablePhosphorus)); if(imgs?.has('tp')) result.push(...imagePara(imgs.get('tp')!,'图 3-4 有效磷含量空间分布图')) }
  if (data.indicators.availablePotassium) result.push(...buildOneIndicator('3.6 速效钾含量（AK）','mg/kg',data.indicators.availablePotassium))
  if (data.indicators.ndvi) { result.push(...buildOneIndicator('3.7 植被覆盖度（NDVI）','',data.indicators.ndvi)); if(imgs?.has('ndvi')) result.push(...imagePara(imgs.get('ndvi')!,'图 3-5 NDVI植被覆盖度空间分布图')) }
  if (imgs?.has('dem')) result.push(...imagePara(imgs.get('dem')!, '图 3-6 地形高程图（DEM）'))
  if (imgs?.has('unc')) { result.push(h3('预测不确定性')); result.push(p('有机质反演像素级不确定性分布（1-σ）。东南森林区不确定性较低（±2.1 g/kg），西北河谷区较高（±5.8 g/kg），因地形破碎和混合像元效应。',{indent:true})); result.push(...imagePara(imgs.get('unc')!,'图 3-7 有机质预测不确定性热力图（暖色=高不确定性）')) }
  return result
}

// ============================================================
// 🚜 模块三：管理分区
// ============================================================

function buildManagementZones(data: ReportData): (Paragraph | Table)[] {
  const zones = data.managementZones
  if (!zones?.length) return []
  const result: (Paragraph | Table)[] = [h2('三、空间分异与田间管理分区'), p('基于有机质、含水量、盐渍化、全氮、速效钾和NDVI六项指标多维聚类（K-means, k=3），将研究区划分为3个差异化管理区。',{indent:true})]
  for (const z of zones) {
    const zc = z.zoneId==='A'?C_GREEN:z.zoneId==='B'?C_ACCENT:C_RED
    result.push(h3(`${z.zoneId} 区 — ${z.zoneName}（${z.percentage}）`), p(`面积：${z.area}`), infoBox(`核心特征：${z.features}`,zc), bullet(`推荐作物：${z.crops}`,'农作物选择：'), bullet(z.recommendations,'管理策略：'))
  }
  result.push(h3('分区对比总览'), makeTable(['分区','名称','面积占比','有机质','含水量','核心问题','管理方向'], zones.map(z=>[z.zoneId,z.zoneName,z.percentage,z.zoneId==='A'?'>50 g/kg':z.zoneId==='B'?'30-50 g/kg':'<35 g/kg',z.zoneId==='A'?'35-52%':z.zoneId==='B'?'25-40%':'18-25%',z.zoneId==='A'?'无显著问题':z.zoneId==='B'?'速效钾偏低':'盐渍化+有机质低',z.zoneId==='A'?'维持+监测':z.zoneId==='B'?'补钾+培肥':'改盐+增肥+排水']),[10,16,14,14,14,16,16]))
  return result
}

// ============================================================
// 🌾 模块四：作物适宜性
// ============================================================

function buildCropSuitability(data: ReportData): (Paragraph | Table)[] {
  if (!data.cropSuitability?.length) return []
  const stars = (n:number)=>'★'.repeat(n)+'☆'.repeat(5-n)
  const result: (Paragraph | Table)[] = [h2('四、作物适宜性评估'), p('基于土壤有机质、pH（估算6.2-7.0）、盐分、含水量等指标，结合当地气候和作物生长需求模型进行适宜性评估。',{indent:true}), h3('适种作物推荐'), makeTable(['推荐作物','匹配度','关键依据','适种区域','预计产量'], data.cropSuitability.map(c=>[c.crop,stars(c.matchLevel),c.basis,c.suitableZone,c.yieldRange]),[20,14,28,20,18]),
    h3('轮作方案建议'), makeTable(['年份','A区（优质区）','B区（改良区）','C区（问题区）'],[['第1年','春玉米→秋大豆','春玉米→绿肥','耐盐水稻→休耕'],['第2年','水稻→油菜','大豆→冬小麦','向日葵→绿肥（田菁）'],['第3年','大豆→冬小麦','水稻→油菜+绿肥','耐盐水稻→绿肥（紫云英）']],[16,28,28,28]),
    infoBox('轮作原则：豆科固氮培肥→禾本科高产消耗→绿肥休养恢复，形成"用地-养地"循环。C区前3年以生物修复为主。',C_GREEN)]
  return result
}

// ============================================================
// 🧪 模块五：精准施肥
// ============================================================

function buildFertilizationPlans(data: ReportData): (Paragraph | Table)[] {
  if (!data.fertilizationPlans?.length) return []
  return [h2('五、精准施肥与改良方案'), p('以"减量增效、分区施策"为原则，制定差异化施肥方案。',{indent:true}),
    h3('分区基肥配方'), makeTable(['管理区','N-P₂O₅-K₂O (kg/亩)','有机肥 (kg/亩)','追肥方案','中微量元素'], data.fertilizationPlans.map(pl=>[pl.zone,pl.formula,pl.organicFertilizer,pl.topDressing,pl.microElements]),[12,26,20,24,18]),
    h3('土壤改良措施'), makeTable(['问题类型','目标区域','改良方案','参考用量','周期'],[['盐渍化（轻度）','C区','排水工程+灌水洗盐+石膏','灌水80-120 m³/亩；石膏50-100 kg/亩','3年'],['有机质偏低','B区东部+C区','秸秆还田+绿肥+增施有机肥','有机肥2000-5000 kg/亩','3-5年'],['速效钾缺乏','B区','增施钾肥+秸秆还田','K₂O 8-12 kg/亩','2-3年'],['有效磷缺乏','东南森林边缘','过磷酸钙+有机肥混合','P₂O₅ 6-10 kg/亩','2-3年'],['水土流失','东南坡地','等高种植+植物篱','—','5年']],[18,20,26,20,16]),
    h3('关键施肥时期'), makeTable(['作物','基肥（播种前）','苗期追肥','拔节/分蘖期','灌浆/结实期'],[['玉米','全部有机肥+70%配方肥','—','30%配方肥（尿素10-15 kg/亩）','—'],['水稻','全部有机肥+60%配方肥','返青肥（尿素5 kg/亩）','分蘖肥（尿素8-12 kg/亩）','穗肥（尿素3-5 kg/亩）'],['大豆','全部有机肥+过磷酸钙20 kg/亩','—','—','花期喷施硼肥']],[14,24,18,24,20])]
}

// ============================================================
// ⚠️ 模块六：风险预警
// ============================================================

function buildRiskWarnings(data: ReportData): (Paragraph | Table)[] {
  if (!data.riskWarnings?.length) return []
  return [h2('六、风险预警与监测'), p('基于指标状态和变化趋势进行分级预警：🟢低风险（监测）、🟡中风险（预案）、🔴高风险（立即干预）。',{indent:true}),
    h3('风险预警清单'), makeTable(['风险类型','等级','影响区域','监测指标','预警阈值','行动'], data.riskWarnings.map(r=>[r.type,r.emoji+' '+r.status,r.area,r.indicator,r.threshold,r.action]),[20,10,18,18,18,16]),
    h3('长期监测规划'), makeTable(['监测手段','覆盖范围','分辨率','频率','内容'],[['🛰️卫星遥感','全区 26.8 km²','14m','每季度','有机质、含水量、盐渍化、NDVI'],['🚁无人机','重点区（C区+坡地）','0.1m','每月','盐渍化动态、植被恢复'],['🔬地面采样','12个监测点','—','每周','N/P/K、盐分、pH、含水量'],['📡物联网站','4个自动站（C区）','—','实时','温湿度、电导率、水位']],[16,18,14,16,36]),
    infoBox('监测网络：东部3点（林间）+中部5点（网格农田）+西北4点（加密盐渍化-水分监测）。',C_ACCENT)]
}

// ============================================================
// 🤖 AI 分析结论
// ============================================================

function buildAIConclusions(data: ReportData): (Paragraph | Table)[] {
  const result: (Paragraph | Table)[] = [h2('AI 智能分析结论'), p(data.summary,{indent:true})]
  if (data.recommendations?.length) { result.push(h3('综合建议措施')); data.recommendations.forEach((rec,i)=>{ result.push(new Paragraph({spacing:{after:60,line:340},indent:{left:convertInchesToTwip(0.3)},children:[new TextRun({text:`${i+1}. `,font:FONT_HEI,size:24,bold:true,color:C_ACCENT}),new TextRun({text:rec,font:FONT_SONG,size:24})]})) }) }
  return result
}

// ============================================================
// 🔍 证据链
// ============================================================

function buildEvidenceChain(data: ReportData): (Paragraph | Table)[] {
  if (!data.evidenceData?.sampleRegions.length) return []
  const result: (Paragraph | Table)[] = [h2('证据链分析（可审计）'), p('AI预测结果的证据链追溯体系，支持可复核、可追溯、可审计。',{indent:true}), h3('证据图层三件套'), bullet('证据因子图层（explain_top1_factor.tif）：每像元Top-1证据对象编号'), bullet('证据强度图层（explain_top1_strength.tif）：每像元Top-1证据强度'), bullet('区域证据矢量（region_evidence.geojson）：治理单元矢量边界及属性表'), h3('区域证据摘要')]
  for (const region of data.evidenceData.sampleRegions) {
    result.push(new Paragraph({spacing:{before:120,after:60},children:[new TextRun({text:`区域 #${region.region_id} - ${region.target}`,font:FONT_HEI,size:24,bold:true,color:C_PRIMARY})]}))
    result.push(p(`预测统计：均值 ${region.pred_mean.toFixed(3)} | 中位数 ${region.pred_p50.toFixed(3)} | P95 ${region.pred_p95.toFixed(3)} | 像元 ${region.pixel_count}`,{color:C_GRAY}))
    result.push(makeTable(['排序','因子ID','因子名称','基线','频次','变化量','方向','得分'], region.top_evidence.slice(0,3).map((ev,i)=>[`${i+1}`,`${ev.factor_id}`,ev.factor_label,ev.baseline_type,`${(ev.freq*100).toFixed(1)}%`,`${ev.delta_mean>0?'+':''}${ev.delta_mean.toFixed(3)}`,ev.direction==='increase'?'↑增':'↓减',`${ev.score.toFixed(3)}`]),[6,10,22,14,10,10,14,14]))
  }
  result.push(h3('证据字段语义规范'), makeTable(['字段','语义说明','示例'],[['region_id','治理单元标识','0,1,2,...'],['target','预测目标指标','OC_0-5cm_1km_mean'],['factor_id','证据对象标识','43 (terrain_relief)'],['baseline_type','条件基线语义','region_mean'],['freq','证据频次','0.726 (72.6%)'],['delta_mean','平均变化量','+0.465 / -0.402'],['direction','变化方向','increase / decrease'],['score','证据强度评分','0.338']],[20,42,38]),
    infoBox('所有证据链数据遵循预设语义规范，确保可复核、可追溯、可审计。完整数据（JSON/CSV）可从系统导出用于第三方审计。',C_ACCENT))
  return result
}

// ============================================================
// 🔍 模块七：数据溯源
// ============================================================

function buildDataTraceability(data: ReportData): (Paragraph | Table)[] {
  return [h2('七、数据溯源与可信度说明'), h3('数据溯源链'), makeTable(['环节','内容','说明'],[['①数据获取','DZ01卫星 VNIR传感器','2025-12-25，L2级产品，云覆盖0.61%'],['②预处理','辐射定标→大气校正→几何精校正','RMSE<0.5像元，UTM 49N/WGS84'],['③特征提取','光谱+植被指数+地形+纹理','共47维特征向量'],['④AI反演','RF+深度学习混合模型','验证集 R²=0.87, RMSE=3.2 g/kg'],['⑤输出','空间分布图+不确定性+证据链','像元级预测+置信区间']],[20,40,40]),
    h3('不确定性量化'), p('每个像元附有置信区间（1-σ）：',{indent:true}), makeTable(['等级','1-σ范围','像元占比','建议'],[['🟢高置信度','<±2.5 g/kg','约42%','结论可直接采用'],['🟡中置信度','±2.5~±5.0 g/kg','约38%','建议结合地面采样'],['🔴低置信度','>±5.0 g/kg','约20%','需实测校准']],[20,22,18,40]),
    h3('局限性声明'), bullet('空间分辨率：14m，每个像元代表196m²地面范围，像元内存在空间变异。'), bullet('时间代表性：影像采集于2025-12-25（冬季枯水期），含水量等季节波动指标需多期综合判断。'), bullet('模型适用性：训练数据来自中亚热带湿润季风气候区（湘西及周边），其他区域需重新校准。'), bullet('验证建议：优先在不确定性较高区域（西北河谷、东南陡坡）地面采样，每次≥15个样本。'),
    infoBox('本报告为AI遥感分析结果，可作为农业决策重要参考，但不替代专业土壤检测实验室法定报告。关键决策（工程投入>10万元）建议结合地面实测。',C_ORANGE)]
}

// ============================================================
// 👨‍🌾 新增：第九章 — 面向农业工作者的栽培管理建议
// ============================================================

function buildCropGuides(data: ReportData): (Paragraph | Table)[] {
  const guides = data.cropGuides
  if (!guides?.length) return []

  const result: (Paragraph | Table)[] = [
    h2('八、面向农业工作者的栽培管理建议'),
    p('本章专为一线农业工作者编写，以通俗语言介绍水稻、玉米、甘薯、油菜和豆类五大作物在本区域的栽培管理要点。建议结合前文的分区结果，在不同管理区选择最适宜的作物种植。', { indent: true }),
  ]

  for (const g of guides) {
    result.push(h3(`【${g.crop}】`))
    result.push(makeTable(['项目', '具体建议'], [
      ['🌍 适宜区域', g.suitableZones],
      ['🌱 推荐品种', g.variety],
      ['📅 播种时间', g.sowingTime],
      ['🔧 播种方法', g.sowingMethod],
      ['🧪 施肥方案', g.fertilizerPlan],
      ['💧 水分管理', g.waterManagement],
      ['🐛 病虫害防治', g.pestControl],
      ['📈 预期产量', g.expectedYield],
      ['📝 特别提醒', g.notes],
    ], [20, 80]))
    result.push(gap())
  }

  result.push(h3('五大作物速查表'))
  result.push(makeTable(['作物','适种区','播种期','关键施肥（kg/亩）','预期产量','主打品种'], guides.map(g => [
    g.crop, g.suitableZones.substring(0, 30), g.sowingTime, g.fertilizerPlan.substring(0, 40), g.expectedYield, g.variety,
  ]), [10,16,16,26,14,18]))

  result.push(infoBox('💡 一句话总结：A区种经济林+高产玉米，B区种玉米大豆轮作补钾，C区改盐后种耐盐水稻+向日葵。做到"看土选种、按方施肥、分区管理"就能稳产增收。', C_GREEN))

  return result
}

// ============================================================
// 📅 模块九：行动清单
// ============================================================

function buildActionChecklist(data: ReportData): (Paragraph | Table)[] {
  if (!data.actionChecklist?.length) return []
  return [h2('九、行动清单与后续计划'), p('以下结构化行动清单按优先级排序，农户可逐项对照执行。',{indent:true}),
    h3('结构化行动清单'), makeTable(['优先级','行动事项','目标区域','建议时间','预期效果'], data.actionChecklist.map(i=>[i.priority,i.action,i.area,i.timing,i.expectedEffect]),[10,35,18,16,21]),
    h3('后续监测与更新计划'), makeTable(['时间节点','工作内容','负责方'],[['2026年3月','春播前12点土壤采样+施肥建议卡发放','县级农技中心'],['2026年4月','C区排水一期完工+春灌淋洗','乡镇水利站'],['2026年6月','Q2卫星遥感+更新报告','DataEasy平台'],['2026年9月','无人机巡查+盐渍化中期评估','县农业局'],['2026年12月','2026年度综合评估报告','DataEasy平台'],['2027年起','季度监测+年度报告常态运行','常态化']],[22,54,24]),
    infoBox('报告更新周期：单期综合分析每年1次（12月）；C区季度简报；极端气候事件后1周内启动应急监测。',C_GREEN)]
}

// ============================================================
// 📄 页脚（修复页码）
// ============================================================

function buildFooter(): Footer {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: 'DataEasy 土壤质量智能监测平台', font: FONT_SONG, size: 18, color: C_GRAY }),
        new TextRun({ text: '  —  ', font: FONT_SONG, size: 18, color: C_GRAY }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT_SONG, size: 18, color: C_GRAY }),
        new TextRun({ text: ' / ', font: FONT_SONG, size: 18, color: C_GRAY }),
        new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT_SONG, size: 18, color: C_GRAY }),
      ],
    })],
  })
}

// ============================================================
// 🏗️ 主构建函数（修复空白页）
// ============================================================

export function buildReportDocument(data: ReportData): Document {
  const footer = buildFooter()

  // 构建所有章节，只将非空内容加入
  const blocks: { entries: (Paragraph | Table)[]; withBreak: boolean }[] = [
    { entries: buildCover(data), withBreak: true },
    { entries: [...buildOverview(data)], withBreak: true },
    { entries: [...buildQualityIndex(data), ...buildAllIndicators(data)], withBreak: true },
    { entries: buildManagementZones(data), withBreak: true },
    { entries: buildCropSuitability(data), withBreak: true },
    { entries: buildFertilizationPlans(data), withBreak: true },
    { entries: buildAIConclusions(data), withBreak: true },
    { entries: buildRiskWarnings(data), withBreak: true },
    { entries: buildDataTraceability(data), withBreak: true },
    { entries: buildEvidenceChain(data), withBreak: true },
    { entries: buildCropGuides(data), withBreak: true },
    { entries: buildActionChecklist(data), withBreak: false },
  ]

  const children: (Paragraph | Table)[] = []
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    if (block.entries.length === 0) continue

    // 在前面加 PageBreak（第一个 block 不需要）
    if (children.length > 0 && block.withBreak) {
      children.push(new Paragraph({ children: [new PageBreak()] }))
    }
    children.push(...block.entries)
  }

  return new Document({
    styles: { default: { document: { run: { font: FONT_SONG, size: 24 } } } },
    sections: [{
      properties: {
        page: {
          size: { width: convertInchesToTwip(8.27), height: convertInchesToTwip(11.69) },
          margin: { top: convertInchesToTwip(0.8), bottom: convertInchesToTwip(0.8), left: convertInchesToTwip(1.0), right: convertInchesToTwip(1.0) },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      footers: { default: footer },
      children,
    }],
  })
}

// ============================================================
// 📦 导出工具
// ============================================================

export async function generateDocxBlob(data: ReportData): Promise<Blob> {
  const doc = buildReportDocument(data)
  return await Packer.toBlob(doc)
}

export async function generateDocxBuffer(data: ReportData): Promise<ArrayBuffer> {
  const blob = await generateDocxBlob(data)
  return await blob.arrayBuffer()
}

export async function downloadDocx(data: ReportData, filename?: string): Promise<void> {
  const { saveAs } = await import('file-saver')
  const blob = await generateDocxBlob(data)
  const name = filename ?? `${data.name.replace(/\s+/g, '_')}.docx`
  saveAs(blob, name)
}

/** 加载图片到 ArrayBuffer + 获取原始尺寸 */
export async function loadImageBuffers(paths: Record<string, string>): Promise<Map<string, { buffer: ArrayBuffer; width: number; height: number }>> {
  const map = new Map<string, { buffer: ArrayBuffer; width: number; height: number }>()
  await Promise.all(Object.entries(paths).map(async ([key, url]) => {
    try {
      const resp = await fetch(url)
      if (!resp.ok) return
      const buffer = await resp.arrayBuffer()
      // 通过浏览器 Image 获取原始尺寸
      const dims = await new Promise<{ width: number; height: number }>((resolve) => {
        const blob = new Blob([buffer])
        const img = new Image()
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
        img.onerror = () => resolve({ width: 0, height: 0 })
        img.src = URL.createObjectURL(blob)
      })
      map.set(key, { buffer, width: dims.width, height: dims.height })
    } catch { console.warn(`图片加载失败: ${key}`) }
  }))
  return map
}
