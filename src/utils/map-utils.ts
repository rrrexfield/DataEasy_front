import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import { fromLonLat, toLonLat } from 'ol/proj'
import type { Coordinate } from 'ol/coordinate'

/**
 * 创建基础地图
 */
export function createBaseMap(target: string | HTMLElement, center: Coordinate, zoom: number) {
  const map = new Map({
    target,
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
    ],
    view: new View({
      center: fromLonLat(center),
      zoom,
    }),
  })

  return map
}

/**
 * 经纬度转换为地图坐标
 */
export function lonLatToMapCoord(lonLat: Coordinate): Coordinate {
  return fromLonLat(lonLat)
}

/**
 * 地图坐标转换为经纬度
 */
export function mapCoordToLonLat(coord: Coordinate): Coordinate {
  return toLonLat(coord)
}

/**
 * 获取地图中心点（经纬度）
 */
export function getMapCenter(map: Map): Coordinate {
  const view = map.getView()
  const center = view.getCenter()
  return center ? mapCoordToLonLat(center) : [0, 0]
}

/**
 * 设置地图中心点
 */
export function setMapCenter(map: Map, lonLat: Coordinate, animate = true) {
  const view = map.getView()
  if (animate) {
    view.animate({
      center: lonLatToMapCoord(lonLat),
      duration: 500,
    })
  } else {
    view.setCenter(lonLatToMapCoord(lonLat))
  }
}

/**
 * 设置地图缩放级别
 */
export function setMapZoom(map: Map, zoom: number, animate = true) {
  const view = map.getView()
  if (animate) {
    view.animate({
      zoom,
      duration: 500,
    })
  } else {
    view.setZoom(zoom)
  }
}

/**
 * 地图截图
 */
export function captureMap(map: Map): Promise<string> {
  return new Promise(resolve => {
    map.once('rendercomplete', () => {
      const mapCanvas = document.createElement('canvas')
      const size = map.getSize()
      if (!size) {
        resolve('')
        return
      }

      mapCanvas.width = size[0]
      mapCanvas.height = size[1]
      const mapContext = mapCanvas.getContext('2d')
      if (!mapContext) {
        resolve('')
        return
      }

      const viewportElement = map.getViewport()
      const canvases = viewportElement.querySelectorAll('.ol-layer canvas, canvas.ol-layer')
      Array.from(canvases).forEach((canvas: any) => {
        if (canvas.width > 0) {
          const opacity = canvas.parentNode.style.opacity || canvas.style.opacity
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity)

          const transform = canvas.style.transform
          const matrix = transform
            .match(/^matrix\(([^(]*)\)$/)?.[1]
            .split(',')
            .map(Number)

          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContext,
            matrix || [1, 0, 0, 1, 0, 0]
          )
          mapContext.drawImage(canvas, 0, 0)
        }
      })

      mapContext.globalAlpha = 1
      mapContext.setTransform(1, 0, 0, 1, 0, 0)
      resolve(mapCanvas.toDataURL())
    })

    map.renderSync()
  })
}
