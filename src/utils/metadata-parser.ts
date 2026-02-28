/**
 * 遥感图像元数据解析工具
 */

export interface ImageBounds {
  ul: [number, number] // 左上角 [lon, lat]
  ur: [number, number] // 右上角
  ll: [number, number] // 左下角
  lr: [number, number] // 右下角
}

export interface ImageMetadata {
  productId: string
  bounds: ImageBounds
  center: [number, number]
  extent: [number, number, number, number] // [minLon, minLat, maxLon, maxLat]
}

/**
 * 解析 MTL 元数据文件
 */
export async function parseMTLFile(mtlUrl: string): Promise<ImageMetadata | null> {
  try {
    const response = await fetch(mtlUrl)
    const text = await response.text()

    // 解析关键字段
    const productId = extractValue(text, 'PRODUCT_ID')
    const ulLat = parseFloat(extractValue(text, 'CORNER_UL_LAT_PRODUCT') || '0')
    const ulLon = parseFloat(extractValue(text, 'CORNER_UL_LON_PRODUCT') || '0')
    const urLat = parseFloat(extractValue(text, 'CORNER_UR_LAT_PRODUCT') || '0')
    const urLon = parseFloat(extractValue(text, 'CORNER_UR_LON_PRODUCT') || '0')
    const llLat = parseFloat(extractValue(text, 'CORNER_LL_LAT_PRODUCT') || '0')
    const llLon = parseFloat(extractValue(text, 'CORNER_LL_LON_PRODUCT') || '0')
    const lrLat = parseFloat(extractValue(text, 'CORNER_LR_LAT_PRODUCT') || '0')
    const lrLon = parseFloat(extractValue(text, 'CORNER_LR_LON_PRODUCT') || '0')

    // 计算中心点和范围
    const centerLon = (ulLon + lrLon) / 2
    const centerLat = (ulLat + lrLat) / 2

    const minLon = Math.min(ulLon, llLon)
    const maxLon = Math.max(urLon, lrLon)
    const minLat = Math.min(llLat, lrLat)
    const maxLat = Math.max(ulLat, urLat)

    return {
      productId: productId || 'Unknown',
      bounds: {
        ul: [ulLon, ulLat],
        ur: [urLon, urLat],
        ll: [llLon, llLat],
        lr: [lrLon, lrLat],
      },
      center: [centerLon, centerLat],
      extent: [minLon, minLat, maxLon, maxLat],
    }
  } catch (error) {
    console.error('解析 MTL 文件失败:', error)
    return null
  }
}

/**
 * 从文本中提取键值对
 */
function extractValue(text: string, key: string): string | null {
  const regex = new RegExp(`${key}\\s*=\\s*"?([^"\\n]+)"?`, 'i')
  const match = text.match(regex)
  return match ? match[1].trim() : null
}
