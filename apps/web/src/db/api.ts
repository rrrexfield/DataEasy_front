/**
 * 数据库 API 层
 * 提供类型安全的数据库访问接口
 */

import db from './database'

// ========== 类型定义 ==========

export interface InversionData {
  id: string
  name: string
  studyArea: string
  date: string
  type: string
  size: string
}

export interface ImageLayer {
  id: string
  name: string
  description: string
  url: string
  visible: boolean
  opacity: number
  category: 'raw' | 'processed' | 'prediction' | 'uncertainty'
  layer?: any
}

export interface RiskZone {
  id: number
  label: string
  riskLevel: 'high' | 'medium' | 'low'
  riskText: string
  confidence: string
  hint: string
  action: string
  tagType: 'danger' | 'warning' | 'success'
  lonLat: [number, number]
  pixelPosition?: [number, number]
}

export interface AttributionFactor {
  id?: number
  name: string
  pct: number
  color: string
  hint: string
}

export interface SoilIndicator {
  code: string
  label: string
  unit: string
  mean: number
  max: number
  min: number
  std: number
  median: number
  cv: number
  levels: string[]
  distribution: number[]
}

export interface TimelineData {
  id?: number
  date: string
  seq: number
}

export interface Report {
  id: string
  name: string
  createTime: string
  startDate: string
  endDate?: string
  studyArea: string
  analysisType: 'single' | 'timeseries'
  qualityScore: number
  qualityLevel: string
  summary: string
  recommendations: string[]
  indicators: any
  dataSource?: any
  evidenceData?: any
}

export interface SoilIndex {
  value: number
  uncertainty: number
  confidenceText: string
  confidenceLevel: 'low' | 'medium' | 'high'
  confidenceType: 'success' | 'warning' | 'danger'
  confidencePct: number
  organicMatter: number
  waterContent: number
  terrainUndulation: number
  salinityFeature: number
  phLevel: string
}

export interface EvidenceFactor {
  id?: number
  evidenceRegionId: number
  factorId: number
  factorLabel: string
  baselineType: string
  freq: number
  deltaMean: number
  direction: string
  score: number
  rank: number
}

export interface EvidenceRegion {
  id?: number
  reportId: string
  regionId: number
  target: string
  pixelCount: number
  predMean: number
  predP50: number
  predP95: number
  topEvidence?: EvidenceFactor[]
}

// ========== 反演数据 API ==========

export const inversionDataAPI = {
  getAll(): InversionData[] {
    const rows = db.query(`
      SELECT id, name, study_area as studyArea, date, type, size 
      FROM inversion_data 
      ORDER BY date DESC
    `)
    return rows
  },

  getById(id: string): InversionData | null {
    return db.queryOne(`
      SELECT id, name, study_area as studyArea, date, type, size 
      FROM inversion_data 
      WHERE id = ?
    `, [id])
  },

  create(data: Omit<InversionData, 'id'>): void {
    db.execute(`
      INSERT INTO inversion_data (id, name, study_area, date, type, size)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [crypto.randomUUID(), data.name, data.studyArea, data.date, data.type, data.size])
  },

  delete(id: string): void {
    db.execute('DELETE FROM inversion_data WHERE id = ?', [id])
  }
}

// ========== 图层配置 API ==========

export const imageLayerAPI = {
  getAll(): ImageLayer[] {
    const rows = db.query<any>(`
      SELECT id, name, description, url, visible, opacity, category 
      FROM image_layers 
      ORDER BY display_order, id
    `)
    return rows.map(row => ({
      ...row,
      visible: row.visible === 1,
      layer: null
    }))
  },

  getById(id: string): ImageLayer | null {
    const row = db.queryOne<any>(`
      SELECT id, name, description, url, visible, opacity, category 
      FROM image_layers 
      WHERE id = ?
    `, [id])
    return row ? { ...row, visible: row.visible === 1, layer: null } : null
  },

  updateVisibility(id: string, visible: boolean): void {
    db.execute(
      'UPDATE image_layers SET visible = ? WHERE id = ?',
      [visible ? 1 : 0, id]
    )
  },

  updateOpacity(id: string, opacity: number): void {
    db.execute(
      'UPDATE image_layers SET opacity = ? WHERE id = ?',
      [opacity, id]
    )
  }
}

// ========== 风险区域 API ==========

export const riskZoneAPI = {
  getAll(): RiskZone[] {
    const rows = db.query<any>(`
      SELECT id, label, risk_level as riskLevel, risk_text as riskText,
             confidence, hint, action, tag_type as tagType, lon, lat
      FROM risk_zones
      ORDER BY id
    `)
    return rows.map(row => ({
      ...row,
      lonLat: [row.lon, row.lat] as [number, number]
    }))
  }
}

// ========== 归因因子 API ==========

export const attributionFactorAPI = {
  getAll(): AttributionFactor[] {
    return db.query(`
      SELECT id, name, pct, color, hint 
      FROM attribution_factors 
      ORDER BY display_order, id
    `)
  },

  reset(factors: AttributionFactor[]): void {
    db.execute('DELETE FROM attribution_factors')
    factors.forEach((factor, index) => {
      db.execute(`
        INSERT INTO attribution_factors (name, pct, color, hint, display_order)
        VALUES (?, ?, ?, ?, ?)
      `, [factor.name, factor.pct, factor.color, factor.hint, index])
    })
  }
}

// ========== 土壤指标 API ==========

export const soilIndicatorAPI = {
  getAll(): SoilIndicator[] {
    const rows = db.query<any>(`
      SELECT code, label, unit, mean, max, min, std, median, cv, levels, distribution
      FROM soil_indicators
    `)
    return rows.map(row => ({
      ...row,
      levels: JSON.parse(row.levels),
      distribution: JSON.parse(row.distribution)
    }))
  },

  getByCode(code: string): SoilIndicator | null {
    const row = db.queryOne<any>(`
      SELECT code, label, unit, mean, max, min, std, median, cv, levels, distribution
      FROM soil_indicators
      WHERE code = ?
    `, [code])
    return row ? {
      ...row,
      levels: JSON.parse(row.levels),
      distribution: JSON.parse(row.distribution)
    } : null
  }
}

// ========== 时序数据 API ==========

export const timelineDataAPI = {
  getAll(): TimelineData[] {
    const rows = db.query<TimelineData>(`
      SELECT id, date, seq FROM timeline_data ORDER BY seq
    `)
    return rows
  }
}

// ========== 报告 API ==========

export const reportAPI = {
  getAll(): Report[] {
    const rows = db.query<any>(`
      SELECT id, name, create_time as createTime, start_date as startDate,
             end_date as endDate, study_area as studyArea, analysis_type as analysisType,
             quality_score as qualityScore, quality_level as qualityLevel,
             summary, recommendations, indicators, data_source as dataSource,
             evidence_data as evidenceData
      FROM reports
      ORDER BY create_time DESC
    `)
    return rows.map(row => ({
      ...row,
      recommendations: JSON.parse(row.recommendations),
      indicators: JSON.parse(row.indicators),
      dataSource: row.dataSource ? JSON.parse(row.dataSource) : undefined,
      evidenceData: row.evidenceData ? JSON.parse(row.evidenceData) : undefined
    }))
  },

  getById(id: string): Report | null {
    try {
      const row = db.queryOne<any>(`
        SELECT id, name, create_time as createTime, start_date as startDate,
               end_date as endDate, study_area as studyArea, analysis_type as analysisType,
               quality_score as qualityScore, quality_level as qualityLevel,
               summary, recommendations, indicators, data_source as dataSource,
               evidence_data as evidenceData
        FROM reports
        WHERE id = ?
      `, [id])
      
      if (!row) {
        console.warn(`报告 ${id} 在数据库中不存在`)
        return null
      }

      // 从证据链表加载证据数据
      let evidenceData: any = undefined
      try {
        const evidenceRegions = evidenceAPI.getByReportId(id)
        
        if (evidenceRegions.length > 0) {
          evidenceData = {
            sampleRegions: evidenceRegions.map(region => ({
              region_id: region.regionId,
              target: region.target,
              pixel_count: region.pixelCount,
              pred_mean: region.predMean,
              pred_p50: region.predP50,
              pred_p95: region.predP95,
              top_evidence: (region.topEvidence || []).map(factor => ({
                factor_id: factor.factorId,
                factor_label: factor.factorLabel,
                baseline_type: factor.baselineType,
                freq: factor.freq,
                delta_mean: factor.deltaMean,
                direction: factor.direction,
                score: factor.score
              }))
            }))
          }
        } else {
          // 如果证据链表中没有数据，尝试从报告表的 evidence_data 字段加载
          if (row.evidenceData) {
            evidenceData = JSON.parse(row.evidenceData)
          }
        }
      } catch (err) {
        console.error(`加载报告 ${id} 的证据链数据失败:`, err)
        // 回退到报告表的 evidence_data 字段
        if (row.evidenceData) {
          try {
            evidenceData = JSON.parse(row.evidenceData)
          } catch (parseErr) {
            console.error(`解析报告 ${id} 的 evidence_data 字段失败:`, parseErr)
          }
        }
      }

      return {
        ...row,
        recommendations: JSON.parse(row.recommendations),
        indicators: JSON.parse(row.indicators),
        dataSource: row.dataSource ? JSON.parse(row.dataSource) : undefined,
        evidenceData
      }
    } catch (err) {
      console.error(`获取报告 ${id} 详情失败:`, err)
      throw err
    }
  },

  create(report: Report): void {
    db.execute(`
      INSERT INTO reports (
        id, name, create_time, start_date, end_date, study_area, analysis_type,
        quality_score, quality_level, summary, recommendations, indicators,
        data_source, evidence_data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      report.id,
      report.name,
      report.createTime,
      report.startDate,
      report.endDate || null,
      report.studyArea,
      report.analysisType,
      report.qualityScore,
      report.qualityLevel,
      report.summary,
      JSON.stringify(report.recommendations),
      JSON.stringify(report.indicators),
      report.dataSource ? JSON.stringify(report.dataSource) : null,
      report.evidenceData ? JSON.stringify(report.evidenceData) : null
    ])
  },

  delete(id: string): void {
    db.execute('DELETE FROM reports WHERE id = ?', [id])
  }
}

// ========== 土壤综合指数 API ==========

export const soilIndexAPI = {
  get(): SoilIndex | null {
    const row = db.queryOne<any>(`
      SELECT value, uncertainty, confidence_text as confidenceText,
             confidence_level as confidenceLevel, confidence_type as confidenceType,
             confidence_pct as confidencePct, organic_matter as organicMatter,
             water_content as waterContent, terrain_undulation as terrainUndulation,
             salinity_feature as salinityFeature, ph_level as phLevel
      FROM soil_index
      WHERE id = 1
    `)
    return row
  },

  update(data: SoilIndex): void {
    db.execute(`
      INSERT OR REPLACE INTO soil_index (
        id, value, uncertainty, confidence_text, confidence_level, confidence_type,
        confidence_pct, organic_matter, water_content, terrain_undulation,
        salinity_feature, ph_level
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.value, data.uncertainty, data.confidenceText, data.confidenceLevel,
      data.confidenceType, data.confidencePct, data.organicMatter,
      data.waterContent, data.terrainUndulation, data.salinityFeature, data.phLevel
    ])
  }
}

// ========== 证据链 API ==========

export const evidenceAPI = {
  // 获取报告的所有证据链区域（包含 top evidence）
  getByReportId(reportId: string): EvidenceRegion[] {
    const regions = db.query<any>(`
      SELECT id, report_id as reportId, region_id as regionId, target,
             pixel_count as pixelCount, pred_mean as predMean,
             pred_p50 as predP50, pred_p95 as predP95
      FROM evidence_regions
      WHERE report_id = ?
      ORDER BY region_id
    `, [reportId])

    // 为每个 region 加载 top evidence
    return regions.map(region => {
      const factors = db.query<any>(`
        SELECT id, evidence_region_id as evidenceRegionId,
               factor_id as factorId, factor_label as factorLabel,
               baseline_type as baselineType, freq, delta_mean as deltaMean,
               direction, score, rank
        FROM evidence_factors
        WHERE evidence_region_id = ?
        ORDER BY rank
      `, [region.id])

      return {
        ...region,
        topEvidence: factors
      }
    })
  },

  // 创建证据链区域
  createRegion(region: Omit<EvidenceRegion, 'id' | 'topEvidence'>): number {
    db.execute(`
      INSERT INTO evidence_regions (report_id, region_id, target, pixel_count, pred_mean, pred_p50, pred_p95)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [region.reportId, region.regionId, region.target, region.pixelCount, region.predMean, region.predP50, region.predP95])
    
    // 返回新插入的 ID
    const result = db.queryOne<{ id: number }>('SELECT last_insert_rowid() as id')
    return result?.id || 0
  },

  // 创建证据因子
  createFactor(factor: Omit<EvidenceFactor, 'id'>): void {
    db.execute(`
      INSERT INTO evidence_factors (evidence_region_id, factor_id, factor_label, baseline_type, 
                                     freq, delta_mean, direction, score, rank)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      factor.evidenceRegionId, factor.factorId, factor.factorLabel, factor.baselineType,
      factor.freq, factor.deltaMean, factor.direction, factor.score, factor.rank
    ])
  },

  // 批量创建证据链数据（区域 + 因子）
  createEvidenceData(reportId: string, regions: Array<{
    regionId: number
    target: string
    pixelCount: number
    predMean: number
    predP50: number
    predP95: number
    topEvidence: Array<{
      factorId: number
      factorLabel: string
      baselineType: string
      freq: number
      deltaMean: number
      direction: string
      score: number
    }>
  }>): void {
    regions.forEach(region => {
      // 创建区域
      const regionDbId = evidenceAPI.createRegion({
        reportId,
        regionId: region.regionId,
        target: region.target,
        pixelCount: region.pixelCount,
        predMean: region.predMean,
        predP50: region.predP50,
        predP95: region.predP95
      })

      // 创建该区域的证据因子
      region.topEvidence.forEach((factor, index) => {
        evidenceAPI.createFactor({
          evidenceRegionId: regionDbId,
          factorId: factor.factorId,
          factorLabel: factor.factorLabel,
          baselineType: factor.baselineType,
          freq: factor.freq,
          deltaMean: factor.deltaMean,
          direction: factor.direction,
          score: factor.score,
          rank: index + 1
        })
      })
    })
  },

  // 删除报告的所有证据链数据
  deleteByReportId(reportId: string): void {
    // 由于设置了外键级联删除，只需删除 regions 即可
    db.execute('DELETE FROM evidence_regions WHERE report_id = ?', [reportId])
  }
}
