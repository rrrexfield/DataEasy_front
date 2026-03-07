/**
 * 报告模板解析工具
 * 用于从 .md 文件中解析报告内容
 */

export interface ReportTemplate {
  summary: string
  dataSource: {
    productId: string
    spacecraft: string
    sensor: string
    date: string
    bounds: {
      north: number
      south: number
      east: number
      west: number
    }
    area: string
  }
  indicators: {
    organicMatter: {
      description: string
      stats: {
        avg: number
        min: number
        max: number
        std: number
        trend: string
        status: string
      }
    }
    moisture: {
      description: string
      stats: {
        avg: number
        min: number
        max: number
        std: number
        trend: string
        status: string
      }
    }
    salinity: {
      description: string
      stats: {
        level: string
        area: string
        coverage: string
        status: string
      }
    }
  }
  recommendations: string[]
  qualityScore: number
  qualityLevel: string
}

/**
 * 从报告 MD 文件中解析内容
 * @param productId - 产品ID (例如: DZ01V_L2_E110.3_N29.2_20251225031144)
 * @returns 解析后的报告模板
 */
export async function parseReportTemplate(productId: string): Promise<ReportTemplate | null> {
  try {
    const response = await fetch(`/reports/${productId}.md`)
    if (!response.ok) {
      console.warn(`报告模板未找到: ${productId}`)
      return null
    }

    const markdown = await response.text()
    
    // 解析 Markdown 内容
    return parseMarkdownContent(markdown)
  } catch (error) {
    console.error('解析报告模板失败:', error)
    return null
  }
}

/**
 * 解析 Markdown 内容为结构化数据
 */
function parseMarkdownContent(markdown: string): ReportTemplate {
  const lines = markdown.split('\n')
  
  const template: ReportTemplate = {
    summary: '',
    dataSource: {
      productId: '',
      spacecraft: '',
      sensor: '',
      date: '',
      bounds: { north: 0, south: 0, east: 0, west: 0 },
      area: ''
    },
    indicators: {
      organicMatter: {
        description: '',
        stats: { avg: 0, min: 0, max: 0, std: 0, trend: 'stable', status: 'normal' }
      },
      moisture: {
        description: '',
        stats: { avg: 0, min: 0, max: 0, std: 0, trend: 'stable', status: 'normal' }
      },
      salinity: {
        description: '',
        stats: { level: 'none', area: '', coverage: '', status: 'good' }
      }
    },
    recommendations: [],
    qualityScore: 0,
    qualityLevel: '良好'
  }

  let currentSection = ''
  let currentSubsection = ''
  let buffer: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // 识别主要章节
    if (line.startsWith('## 概述')) {
      saveBuffer(template, currentSection, currentSubsection, buffer)
      currentSection = 'summary'
      currentSubsection = ''
      buffer = []
      continue
    }

    if (line.startsWith('## 数据源信息')) {
      saveBuffer(template, currentSection, currentSubsection, buffer)
      currentSection = 'dataSource'
      currentSubsection = ''
      buffer = []
      continue
    }

    if (line.startsWith('## 指标分析')) {
      saveBuffer(template, currentSection, currentSubsection, buffer)
      currentSection = 'indicators'
      currentSubsection = ''
      buffer = []
      continue
    }

    if (line.startsWith('## AI智能分析结论与建议')) {
      saveBuffer(template, currentSection, currentSubsection, buffer)
      currentSection = 'recommendations'
      currentSubsection = ''
      buffer = []
      continue
    }

    // 识别子章节
    if (line.startsWith('### 3.1')) {
      saveBuffer(template, currentSection, currentSubsection, buffer)
      currentSubsection = 'organicMatter'
      buffer = []
      continue
    }

    if (line.startsWith('### 3.2')) {
      saveBuffer(template, currentSection, currentSubsection, buffer)
      currentSubsection = 'moisture'
      buffer = []
      continue
    }

    if (line.startsWith('### 3.3')) {
      saveBuffer(template, currentSection, currentSubsection, buffer)
      currentSubsection = 'salinity'
      buffer = []
      continue
    }

    if (line.startsWith('### 建议措施')) {
      saveBuffer(template, currentSection, currentSubsection, buffer)
      currentSubsection = 'measures'
      buffer = []
      continue
    }

    // 解析数据源的列表项
    if (currentSection === 'dataSource' && line.startsWith('- **')) {
      parseDataSourceLine(line, template.dataSource)
      continue
    }

    // 解析统计数据
    if (line.startsWith('**统计数据**')) {
      // 读取后续的统计数据
      const statsLines: string[] = []
      i++
      while (i < lines.length && lines[i].trim().startsWith('- ')) {
        statsLines.push(lines[i].trim())
        i++
      }
      i-- // 回退一行
      if (currentSubsection) {
        parseStatsData(statsLines, template, currentSubsection)
      }
      continue
    }

    // 解析建议措施
    if (currentSection === 'recommendations' && currentSubsection === 'measures') {
      if (line.match(/^\d+\.\s+\*\*【/)) {
        const recommendation = line.replace(/^\d+\.\s+\*\*/, '').replace(/\*\*\s*/, '')
        template.recommendations.push(recommendation)
        continue
      }
    }

    // 收集段落内容
    if (line && !line.startsWith('#') && !line.startsWith('**统计数据**')) {
      buffer.push(line)
    }
  }

  // 保存最后一个缓冲区
  saveBuffer(template, currentSection, currentSubsection, buffer)

  return template
}

/**
 * 保存缓冲区内容到模板对象
 */
function saveBuffer(
  template: ReportTemplate, 
  section: string, 
  subsection: string, 
  buffer: string[]
) {
  if (buffer.length === 0) return

  const content = buffer.join(' ').trim()

  if (section === 'summary') {
    template.summary = content
    // 从概述中提取质量分数
    const scoreMatch = content.match(/综合指数为(\d+)分/)
    if (scoreMatch) {
      template.qualityScore = parseInt(scoreMatch[1])
    }
    const levelMatch = content.match(/质量等级为"([^"]+)"/)
    if (levelMatch) {
      template.qualityLevel = levelMatch[1]
    }
  }

  if (section === 'indicators') {
    if (subsection === 'organicMatter') {
      template.indicators.organicMatter.description = content
    } else if (subsection === 'moisture') {
      template.indicators.moisture.description = content
    } else if (subsection === 'salinity') {
      template.indicators.salinity.description = content
    }
  }
}

/**
 * 解析数据源行
 */
function parseDataSourceLine(line: string, dataSource: ReportTemplate['dataSource']) {
  if (line.includes('产品ID:')) {
    dataSource.productId = line.split('产品ID:')[1].trim()
  } else if (line.includes('卫星平台:')) {
    dataSource.spacecraft = line.split('卫星平台:')[1].trim()
  } else if (line.includes('传感器:')) {
    dataSource.sensor = line.split('传感器:')[1].trim()
  } else if (line.includes('采集日期:')) {
    dataSource.date = line.split('采集日期:')[1].trim()
  } else if (line.includes('影像范围:')) {
    const rangeText = line.split('影像范围:')[1].trim()
    const matches = rangeText.match(/北纬([\d.]+)° ~ ([\d.]+)°.*东经([\d.]+)° ~ ([\d.]+)°/)
    if (matches) {
      dataSource.bounds.south = parseFloat(matches[1])
      dataSource.bounds.north = parseFloat(matches[2])
      dataSource.bounds.west = parseFloat(matches[3])
      dataSource.bounds.east = parseFloat(matches[4])
    }
  } else if (line.includes('监测面积:')) {
    dataSource.area = line.split('监测面积:')[1].trim()
  }
}

/**
 * 解析统计数据
 */
function parseStatsData(lines: string[], template: ReportTemplate, subsection: string) {
  const stats: any = {}
  
  for (const line of lines) {
    if (line.includes('平均值:')) {
      const match = line.match(/平均值:\s*([\d.]+)/)
      if (match) stats.avg = parseFloat(match[1])
    } else if (line.includes('范围:')) {
      const match = line.match(/范围:\s*([\d.]+)\s*~\s*([\d.]+)/)
      if (match) {
        stats.min = parseFloat(match[1])
        stats.max = parseFloat(match[2])
      }
    } else if (line.includes('标准差:')) {
      const match = line.match(/标准差:\s*([\d.]+)/)
      if (match) stats.std = parseFloat(match[1])
    } else if (line.includes('趋势:')) {
      const match = line.match(/趋势:\s*(\S+)/)
      if (match) stats.trend = match[1]
    } else if (line.includes('状态:')) {
      const match = line.match(/状态:\s*(\S+)/)
      if (match) stats.status = match[1]
    } else if (line.includes('等级:')) {
      const match = line.match(/等级:\s*(\S+)/)
      if (match) stats.level = match[1]
    } else if (line.includes('区域:')) {
      const match = line.match(/区域:\s*(.+)/)
      if (match) stats.area = match[1]
    } else if (line.includes('覆盖面积:')) {
      const match = line.match(/覆盖面积:\s*(.+)/)
      if (match) stats.coverage = match[1]
    }
  }

  // 将统计数据赋值到对应的指标
  if (subsection === 'organicMatter') {
    template.indicators.organicMatter.stats = { ...template.indicators.organicMatter.stats, ...stats }
  } else if (subsection === 'moisture') {
    template.indicators.moisture.stats = { ...template.indicators.moisture.stats, ...stats }
  } else if (subsection === 'salinity') {
    template.indicators.salinity.stats = { ...template.indicators.salinity.stats, ...stats }
  }
}
