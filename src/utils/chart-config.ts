import type { EChartsOption } from 'echarts'

/**
 * 仪表盘图表配置
 */
export function createGaugeConfig(value: number, title: string): EChartsOption {
  return {
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
            width: 6,
            color: [
              [0.25, '#f56c6c'],
              [0.5, '#e6a23c'],
              [0.75, '#95d475'],
              [1, '#67c23a'],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '12%',
          width: 20,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          length: 12,
          lineStyle: {
            color: 'auto',
            width: 2,
          },
        },
        splitLine: {
          length: 20,
          lineStyle: {
            color: 'auto',
            width: 5,
          },
        },
        axisLabel: {
          color: '#464646',
          fontSize: 14,
          distance: -60,
        },
        title: {
          offsetCenter: [0, '-10%'],
          fontSize: 16,
        },
        detail: {
          fontSize: 30,
          offsetCenter: [0, '-35%'],
          valueAnimation: true,
          formatter: '{value}',
          color: 'inherit',
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
 * 热力图配置
 */
export function createHeatmapConfig(data: number[][]): EChartsOption {
  return {
    tooltip: {
      position: 'top',
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
      inRange: {
        color: ['#f56c6c', '#e6a23c', '#95d475', '#67c23a'],
      },
    },
    series: [
      {
        type: 'heatmap',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }
}

/**
 * 柱状图配置
 */
export function createBarConfig(
  categories: string[],
  data: number[],
  title?: string
): EChartsOption {
  return {
    title: {
      text: title,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
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
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'bar',
        data,
        itemStyle: {
          color: '#409eff',
        },
      },
    ],
  }
}

/**
 * 折线图配置
 */
export function createLineConfig(
  xData: string[],
  series: Array<{ name: string; data: number[] }>,
  title?: string
): EChartsOption {
  return {
    title: {
      text: title,
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: series.map(s => s.name),
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
    },
    yAxis: {
      type: 'value',
    },
    series: series.map(s => ({
      name: s.name,
      type: 'line',
      data: s.data,
      smooth: true,
    })),
  }
}
