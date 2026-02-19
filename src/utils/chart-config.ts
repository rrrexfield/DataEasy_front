import type { EChartsOption } from 'echarts'

// 霓虹色系
const NEON_COLORS = {
  cyan: '#00ffcc',
  purple: '#b794f6',
  pink: '#ff006e',
  blue: '#3b82f6',
  orange: '#ff6b35',
}

/**
 * 仪表盘图表配置（霓虹风格）
 */
export function createGaugeConfig(value: number, title: string): EChartsOption {
  return {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        center: ['50%', '75%'],
        radius: '90%',
        min: 0,
        max: 100,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 8,
            color: [
              [0.25, '#f56c6c'],
              [0.5, '#e6a23c'],
              [0.75, '#95d475'],
              [1, NEON_COLORS.cyan],
            ],
            shadowBlur: 15,
            shadowColor: 'rgba(0, 255, 204, 0.5)',
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 20,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'auto',
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 2,
            shadowBlur: 5,
          },
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: 'auto',
            width: 5,
            shadowBlur: 5,
          },
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: 14,
          distance: -60,
        },
        title: {
          offsetCenter: [0, '-10%'],
          fontSize: 16,
          color: 'rgba(255, 255, 255, 0.8)',
        },
        detail: {
          fontSize: 36,
          offsetCenter: [0, '-35%'],
          valueAnimation: true,
          formatter: '{value}',
          color: NEON_COLORS.cyan,
          textShadowBlur: 20,
          textShadowColor: 'rgba(0, 255, 204, 0.8)',
          fontWeight: 'bold',
        },
        data: [
          {
            value,
            name: title,
          },
        ],
      },
    ],
  }
}

/**
 * 霓虹风格仪表盘（完全自定义霓虹风格）
 */
export function createNeonGaugeConfig(value: number, title: string): EChartsOption {
  return {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'gauge',
        startAngle: 200,
        endAngle: -20,
        center: ['50%', '75%'],
        radius: '90%',
        min: 0,
        max: 100,
        splitNumber: 5,
        axisLine: {
          lineStyle: {
            width: 10,
            color: [
              [0.2, '#f56c6c'],
              [0.4, '#e6a23c'],
              [0.6, '#95d475'],
              [0.8, NEON_COLORS.cyan],
              [1, NEON_COLORS.purple],
            ],
            shadowBlur: 20,
            shadowColor: 'rgba(0, 255, 204, 0.8)',
          },
        },
        pointer: {
          icon: 'triangle',
          length: '60%',
          width: 8,
          offsetCenter: [0, 0],
          itemStyle: {
            color: NEON_COLORS.cyan,
            shadowBlur: 15,
            shadowColor: 'rgba(0, 255, 204, 1)',
          },
        },
        axisTick: {
          distance: -10,
          length: 8,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.3)',
            width: 2,
          },
        },
        splitLine: {
          distance: -15,
          length: 15,
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.5)',
            width: 3,
            shadowBlur: 8,
            shadowColor: 'rgba(255, 255, 255, 0.5)',
          },
        },
        axisLabel: {
          distance: -40,
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 14,
          formatter: (value: number) => {
            if (value === 100) return '优'
            if (value === 75) return '良'
            if (value === 50) return '中'
            if (value === 25) return '差'
            return ''
          },
        },
        title: {
          offsetCenter: [0, '10%'],
          fontSize: 14,
          color: 'rgba(255, 255, 255, 0.6)',
        },
        detail: {
          fontSize: 40,
          offsetCenter: [0, '-20%'],
          valueAnimation: true,
          formatter: '{value}',
          color: NEON_COLORS.cyan,
          textShadowBlur: 25,
          textShadowColor: 'rgba(0, 255, 204, 1)',
          fontWeight: 'bold',
          borderWidth: 2,
          borderColor: NEON_COLORS.cyan,
          borderRadius: 8,
          padding: [5, 10],
          backgroundColor: 'rgba(0, 255, 204, 0.1)',
        },
        data: [
          {
            value,
            name: title,
          },
        ],
      },
    ],
  }
}

/**
 * 热力图配置（霓虹风格）
 */
export function createHeatmapConfig(data: number[][]): EChartsOption {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      position: 'top',
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: {
        color: '#e0e0e0',
      },
    },
    grid: {
      height: '50%',
      top: '10%',
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%',
      textStyle: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
      inRange: {
        color: ['#f56c6c', '#e6a23c', '#95d475', NEON_COLORS.cyan],
      },
    },
    series: [
      {
        type: 'heatmap',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 255, 204, 0.8)',
          },
        },
        itemStyle: {
          borderColor: 'rgba(0, 0, 0, 0.5)',
          borderWidth: 1,
        },
      },
    ],
  }
}

/**
 * 柱状图配置（霓虹风格）
 */
export function createBarConfig(
  categories: string[],
  data: number[],
  title?: string
): EChartsOption {
  return {
    backgroundColor: 'transparent',
    title: {
      text: title,
      textStyle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        shadowStyle: {
          color: 'rgba(0, 255, 204, 0.1)',
        },
      },
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      borderColor: 'rgba(0, 255, 204, 0.3)',
      textStyle: {
        color: '#e0e0e0',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    series: [
      {
        type: 'bar',
        data,
        itemStyle: {
          color: NEON_COLORS.cyan,
          borderColor: NEON_COLORS.cyan,
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 255, 204, 0.5)',
        },
        emphasis: {
          itemStyle: {
            color: NEON_COLORS.purple,
            shadowBlur: 20,
            shadowColor: 'rgba(183, 148, 246, 0.8)',
          },
        },
      },
    ],
  }
}

/**
 * 折线图配置（霓虹风格）
 */
export function createLineConfig(
  xData: string[],
  series: Array<{ name: string; data: number[] }>,
  title?: string
): EChartsOption {
  return {
    backgroundColor: 'transparent',
    title: {
      text: title,
      textStyle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: {
        color: '#e0e0e0',
      },
    },
    legend: {
      data: series.map(s => s.name),
      textStyle: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 255, 204, 0.5)',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData,
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.7)',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
    series: series.map((s, index) => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2,
        shadowBlur: 10,
        shadowColor: `rgba(0, 255, 204, 0.5)`,
      },
      itemStyle: {
        color: index === 0 ? NEON_COLORS.cyan : NEON_COLORS.purple,
        borderWidth: 2,
        shadowBlur: 10,
        shadowColor: index === 0 ? 'rgba(0, 255, 204, 0.8)' : 'rgba(183, 148, 246, 0.8)',
      },
      emphasis: {
        scale: true,
        itemStyle: {
          shadowBlur: 20,
        },
      },
    })),
  }
}

/**
 * 霓虹折线图（带辉光区域填充）
 */
export function createNeonLineConfig(
  xData: string[],
  series: Array<{ name: string; data: number[] }>,
  title?: string
): EChartsOption {
  const colors = [NEON_COLORS.cyan, NEON_COLORS.purple, NEON_COLORS.pink]
  
  return {
    backgroundColor: 'transparent',
    title: {
      text: title,
      textStyle: {
        color: NEON_COLORS.cyan,
        fontSize: 18,
        fontWeight: 'bold',
        textShadowBlur: 10,
        textShadowColor: 'rgba(0, 255, 204, 0.8)',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        lineStyle: {
          color: NEON_COLORS.cyan,
          type: 'dashed',
        },
        crossStyle: {
          color: NEON_COLORS.cyan,
        },
      },
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      borderColor: NEON_COLORS.cyan,
      borderWidth: 1,
      textStyle: {
        color: '#e0e0e0',
      },
    },
    legend: {
      data: series.map(s => s.name),
      textStyle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12,
      },
      itemStyle: {
        shadowBlur: 10,
        shadowColor: 'rgba(0, 255, 204, 0.5)',
      },
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '5%',
      top: title ? '15%' : '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xData,
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 255, 204, 0.3)',
          shadowBlur: 5,
          shadowColor: 'rgba(0, 255, 204, 0.3)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
      axisTick: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(0, 255, 204, 0.3)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.08)',
          type: 'dashed',
        },
      },
    },
    series: series.map((s, index) => {
      const color = colors[index % colors.length]
      return {
        name: s.name,
        type: 'line',
        data: s.data,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color,
          shadowBlur: 15,
          shadowColor: `rgba(${index === 0 ? '0, 255, 204' : index === 1 ? '183, 148, 246' : '255, 0, 110'}, 0.8)`,
        },
        itemStyle: {
          color,
          borderWidth: 2,
          borderColor: color,
          shadowBlur: 15,
          shadowColor: `rgba(${index === 0 ? '0, 255, 204' : index === 1 ? '183, 148, 246' : '255, 0, 110'}, 1)`,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: `rgba(${index === 0 ? '0, 255, 204' : index === 1 ? '183, 148, 246' : '255, 0, 110'}, 0.5)`,
              },
              {
                offset: 1,
                color: 'rgba(0, 0, 0, 0)',
              },
            ],
          },
          shadowBlur: 20,
          shadowColor: `rgba(${index === 0 ? '0, 255, 204' : index === 1 ? '183, 148, 246' : '255, 0, 110'}, 0.3)`,
        },
        emphasis: {
          scale: true,
          itemStyle: {
            shadowBlur: 30,
          },
        },
      }
    }),
  }
}

/**
 * 霓虹柱状图（渐变发光）
 */
export function createNeonBarConfig(
  categories: string[],
  data: number[],
  title?: string
): EChartsOption {
  return {
    backgroundColor: 'transparent',
    title: {
      text: title,
      textStyle: {
        color: NEON_COLORS.cyan,
        fontSize: 18,
        fontWeight: 'bold',
        textShadowBlur: 10,
        textShadowColor: 'rgba(0, 255, 204, 0.8)',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: 'rgba(26, 26, 26, 0.95)',
      borderColor: NEON_COLORS.cyan,
      borderWidth: 1,
      textStyle: {
        color: '#e0e0e0',
      },
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '5%',
      top: title ? '15%' : '5%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: {
        lineStyle: {
          color: 'rgba(0, 255, 204, 0.3)',
          shadowBlur: 5,
          shadowColor: 'rgba(0, 255, 204, 0.3)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: true,
        lineStyle: {
          color: 'rgba(0, 255, 204, 0.3)',
        },
      },
      axisLabel: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.08)',
          type: 'dashed',
        },
      },
    },
    series: [
      {
        type: 'bar',
        data,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: NEON_COLORS.cyan },
              { offset: 1, color: NEON_COLORS.purple },
            ],
          },
          borderColor: NEON_COLORS.cyan,
          borderWidth: 2,
          shadowBlur: 20,
          shadowColor: 'rgba(0, 255, 204, 0.8)',
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 30,
            shadowColor: 'rgba(183, 148, 246, 1)',
          },
        },
        barMaxWidth: 40,
      },
    ],
  }
}
