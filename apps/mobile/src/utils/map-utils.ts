import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import ImageLayer from 'ol/layer/Image'
import XYZ from 'ol/source/XYZ'
import Static from 'ol/source/ImageStatic'
import { fromLonLat } from 'ol/proj'

/**
 * 行政区数据
 */
interface RegionItem {
  label: string
  value: string
  center: [number, number]
  zoom?: number
  children?: RegionItem[]
}

export const CHINA_REGIONS = [
  {
    label: '北京市',
    value: 'beijing',
    center: [116.4074, 39.9042],
    zoom: 10,
    children: [
      { label: '东城区', value: 'beijing-dongcheng', center: [116.4167, 39.9290], zoom: 13 },
      { label: '西城区', value: 'beijing-xicheng', center: [116.3664, 39.9127], zoom: 13 },
      { label: '朝阳区', value: 'beijing-chaoyang', center: [116.4435, 39.9211], zoom: 12 },
      { label: '海淀区', value: 'beijing-haidian', center: [116.2980, 39.9590], zoom: 12 },
      { label: '丰台区', value: 'beijing-fengtai', center: [116.2865, 39.8585], zoom: 12 },
      { label: '石景山区', value: 'beijing-shijingshan', center: [116.2226, 39.9056], zoom: 13 },
      { label: '通州区', value: 'beijing-tongzhou', center: [116.6564, 39.9096], zoom: 12 },
      { label: '顺义区', value: 'beijing-shunyi', center: [116.6546, 40.1303], zoom: 12 },
      { label: '昌平区', value: 'beijing-changping', center: [116.2314, 40.2206], zoom: 11 },
      { label: '大兴区', value: 'beijing-daxing', center: [116.3416, 39.7268], zoom: 12 },
      { label: '房山区', value: 'beijing-fangshan', center: [115.9884, 39.7490], zoom: 11 },
      { label: '门头沟区', value: 'beijing-mentougou', center: [116.1016, 39.9405], zoom: 11 },
      { label: '平谷区', value: 'beijing-pinggu', center: [117.1215, 40.1406], zoom: 11 },
      { label: '怀柔区', value: 'beijing-huairou', center: [116.6317, 40.3162], zoom: 11 },
      { label: '密云区', value: 'beijing-miyun', center: [116.8432, 40.3767], zoom: 11 },
      { label: '延庆区', value: 'beijing-yanqing', center: [115.9746, 40.4562], zoom: 11 },
    ],
  },
  {
    label: '上海市',
    value: 'shanghai',
    center: [121.4737, 31.2304],
    zoom: 11,
    children: [
      { label: '黄浦区', value: 'shanghai-huangpu', center: [121.4906, 31.2236], zoom: 13 },
      { label: '徐汇区', value: 'shanghai-xuhui', center: [121.4368, 31.1883], zoom: 13 },
      { label: '长宁区', value: 'shanghai-changning', center: [121.4245, 31.2204], zoom: 13 },
      { label: '静安区', value: 'shanghai-jingan', center: [121.4481, 31.2287], zoom: 13 },
      { label: '普陀区', value: 'shanghai-putuo', center: [121.3968, 31.2495], zoom: 12 },
      { label: '虹口区', value: 'shanghai-hongkou', center: [121.5052, 31.2646], zoom: 13 },
      { label: '杨浦区', value: 'shanghai-yangpu', center: [121.5258, 31.2598], zoom: 12 },
      { label: '浦东新区', value: 'shanghai-pudong', center: [121.5447, 31.2216], zoom: 11 },
      { label: '闵行区', value: 'shanghai-minhang', center: [121.3811, 31.1129], zoom: 11 },
      { label: '宝山区', value: 'shanghai-baoshan', center: [121.4891, 31.4045], zoom: 12 },
      { label: '嘉定区', value: 'shanghai-jiading', center: [121.2655, 31.3747], zoom: 11 },
      { label: '松江区', value: 'shanghai-songjiang', center: [121.2276, 31.0323], zoom: 11 },
      { label: '青浦区', value: 'shanghai-qingpu', center: [121.1244, 31.1515], zoom: 11 },
      { label: '奉贤区', value: 'shanghai-fengxian', center: [121.4749, 30.9179], zoom: 11 },
      { label: '金山区', value: 'shanghai-jinshan', center: [121.3416, 30.7414], zoom: 11 },
      { label: '崇明区', value: 'shanghai-chongming', center: [121.3973, 31.6231], zoom: 10 },
    ],
  },
  {
    label: '天津市',
    value: 'tianjin',
    center: [117.3616, 39.3434],
    zoom: 10,
    children: [
      { label: '和平区', value: 'tianjin-heping', center: [117.2148, 39.1170], zoom: 13 },
      { label: '河东区', value: 'tianjin-hedong', center: [117.2263, 39.1281], zoom: 13 },
      { label: '河西区', value: 'tianjin-hexi', center: [117.2237, 39.1093], zoom: 13 },
      { label: '南开区', value: 'tianjin-nankai', center: [117.1507, 39.1385], zoom: 13 },
      { label: '河北区', value: 'tianjin-hebei', center: [117.2000, 39.1560], zoom: 13 },
      { label: '红桥区', value: 'tianjin-hongqiao', center: [117.1526, 39.1669], zoom: 13 },
      { label: '滨海新区', value: 'tianjin-binhai', center: [117.6975, 39.0300], zoom: 11 },
      { label: '东丽区', value: 'tianjin-dongli', center: [117.3134, 39.0871], zoom: 12 },
      { label: '西青区', value: 'tianjin-xiqing', center: [117.0122, 39.1439], zoom: 11 },
      { label: '津南区', value: 'tianjin-jinnan', center: [117.3824, 38.9889], zoom: 11 },
      { label: '北辰区', value: 'tianjin-beichen', center: [117.1345, 39.2250], zoom: 11 },
      { label: '武清区', value: 'tianjin-wuqing', center: [117.0442, 39.3843], zoom: 11 },
      { label: '宝坻区', value: 'tianjin-baodi', center: [117.3096, 39.7174], zoom: 11 },
      { label: '宁河区', value: 'tianjin-ninghe', center: [117.8259, 39.3308], zoom: 11 },
      { label: '静海区', value: 'tianjin-jinghai', center: [116.9742, 38.9476], zoom: 11 },
      { label: '蓟州区', value: 'tianjin-jizhou', center: [117.4078, 40.0458], zoom: 11 },
    ],
  },
  {
    label: '重庆市',
    value: 'chongqing',
    center: [106.5516, 29.5630],
    zoom: 9,
    children: [
      { label: '渝中区', value: 'chongqing-yuzhong', center: [106.5692, 29.5526], zoom: 13 },
      { label: '江北区', value: 'chongqing-jiangbei', center: [106.5745, 29.6061], zoom: 12 },
      { label: '沙坪坝区', value: 'chongqing-shapingba', center: [106.4542, 29.5411], zoom: 12 },
      { label: '九龙坡区', value: 'chongqing-jiulongpo', center: [106.5103, 29.5023], zoom: 12 },
      { label: '南岸区', value: 'chongqing-nanan', center: [106.6446, 29.5233], zoom: 12 },
      { label: '渝北区', value: 'chongqing-yubei', center: [106.6307, 29.7182], zoom: 11 },
      { label: '巴南区', value: 'chongqing-banan', center: [106.5197, 29.3816], zoom: 11 },
      { label: '北碚区', value: 'chongqing-beibei', center: [106.3959, 29.8252], zoom: 12 },
      { label: '大渡口区', value: 'chongqing-dadukou', center: [106.4820, 29.4842], zoom: 13 },
      { label: '万州区', value: 'chongqing-wanzhou', center: [108.4080, 30.8074], zoom: 11 },
      { label: '涪陵区', value: 'chongqing-fuling', center: [107.3894, 29.7031], zoom: 11 },
      { label: '黔江区', value: 'chongqing-qianjiang', center: [108.7709, 29.5332], zoom: 11 },
    ],
  },
  {
    label: '河北省',
    value: 'hebei',
    center: [114.5024, 38.0455],
    zoom: 8,
    children: [
      { label: '石家庄市', value: 'hebei-shijiazhuang', center: [114.5148, 38.0428], zoom: 11 },
      { label: '唐山市', value: 'hebei-tangshan', center: [118.1752, 39.6351], zoom: 10 },
      { label: '秦皇岛市', value: 'hebei-qinhuangdao', center: [119.6004, 39.9351], zoom: 11 },
      { label: '邯郸市', value: 'hebei-handan', center: [114.5391, 36.6256], zoom: 10 },
      { label: '邢台市', value: 'hebei-xingtai', center: [114.5048, 37.0682], zoom: 10 },
      { label: '保定市', value: 'hebei-baoding', center: [115.4648, 38.8740], zoom: 10 },
      { label: '张家口市', value: 'hebei-zhangjiakou', center: [114.8869, 40.8242], zoom: 9 },
      { label: '承德市', value: 'hebei-chengde', center: [117.9634, 40.9522], zoom: 9 },
      { label: '沧州市', value: 'hebei-cangzhou', center: [116.8387, 38.3045], zoom: 10 },
      { label: '廊坊市', value: 'hebei-langfang', center: [116.7039, 39.5385], zoom: 11 },
      { label: '衡水市', value: 'hebei-hengshui', center: [115.6706, 37.7385], zoom: 10 },
    ],
  },
  { label: '山西省', value: 'shanxi', center: [112.5490, 37.8570], zoom: 8 },
  { label: '内蒙古自治区', value: 'neimenggu', center: [111.6708, 40.8183], zoom: 6 },
  { label: '辽宁省', value: 'liaoning', center: [123.4296, 41.8357], zoom: 7 },
  { label: '吉林省', value: 'jilin', center: [125.3245, 43.8868], zoom: 7 },
  { label: '黑龙江省', value: 'heilongjiang', center: [126.6423, 45.7568], zoom: 7 },
  {
    label: '江苏省',
    value: 'jiangsu',
    center: [118.7674, 32.0415],
    zoom: 8,
    children: [
      { label: '南京市', value: 'jiangsu-nanjing', center: [118.7969, 32.0603], zoom: 11 },
      { label: '无锡市', value: 'jiangsu-wuxi', center: [120.3019, 31.5747], zoom: 11 },
      { label: '徐州市', value: 'jiangsu-xuzhou', center: [117.1847, 34.2616], zoom: 10 },
      { label: '常州市', value: 'jiangsu-changzhou', center: [119.9740, 31.8109], zoom: 11 },
      { label: '苏州市', value: 'jiangsu-suzhou', center: [120.5954, 31.2989], zoom: 11 },
      { label: '南通市', value: 'jiangsu-nantong', center: [120.8945, 31.9804], zoom: 10 },
      { label: '连云港市', value: 'jiangsu-lianyungang', center: [119.2216, 34.5968], zoom: 10 },
      { label: '淮安市', value: 'jiangsu-huaian', center: [119.1130, 33.6104], zoom: 10 },
      { label: '盐城市', value: 'jiangsu-yancheng', center: [120.1633, 33.3799], zoom: 9 },
      { label: '扬州市', value: 'jiangsu-yangzhou', center: [119.4127, 32.3931], zoom: 11 },
      { label: '镇江市', value: 'jiangsu-zhenjiang', center: [119.4252, 32.1872], zoom: 11 },
      { label: '泰州市', value: 'jiangsu-taizhou', center: [119.9229, 32.4849], zoom: 10 },
      { label: '宿迁市', value: 'jiangsu-suqian', center: [118.2758, 33.9630], zoom: 10 },
    ],
  },
  { label: '浙江省', value: 'zhejiang', center: [120.1536, 30.2654], zoom: 8 },
  { label: '安徽省', value: 'anhui', center: [117.2830, 31.8612], zoom: 8 },
  { label: '福建省', value: 'fujian', center: [119.2965, 26.0998], zoom: 8 },
  { label: '江西省', value: 'jiangxi', center: [115.8921, 28.6760], zoom: 8 },
  { label: '山东省', value: 'shandong', center: [117.0007, 36.6758], zoom: 8 },
  { label: '河南省', value: 'henan', center: [113.6654, 34.7578], zoom: 8 },
  {
    label: '湖北省',
    value: 'hubei',
    center: [114.3420, 30.5460],
    zoom: 8,
    children: [
      { label: '武汉市', value: 'hubei-wuhan', center: [114.3055, 30.5931], zoom: 11 },
      { label: '黄石市', value: 'hubei-huangshi', center: [115.0385, 30.1998], zoom: 11 },
      { label: '十堰市', value: 'hubei-shiyan', center: [110.7980, 32.6294], zoom: 10 },
      { label: '宜昌市', value: 'hubei-yichang', center: [111.2860, 30.6920], zoom: 10 },
      { label: '襄阳市', value: 'hubei-xiangyang', center: [112.1226, 32.0090], zoom: 10 },
      { label: '鄂州市', value: 'hubei-ezhou', center: [114.8949, 30.3910], zoom: 11 },
      { label: '荆门市', value: 'hubei-jingmen', center: [112.1991, 31.0354], zoom: 10 },
      { label: '孝感市', value: 'hubei-xiaogan', center: [113.9169, 30.9260], zoom: 10 },
      { label: '荆州市', value: 'hubei-jingzhou', center: [112.2410, 30.3353], zoom: 10 },
      { label: '黄冈市', value: 'hubei-huanggang', center: [114.8722, 30.4536], zoom: 10 },
      { label: '咸宁市', value: 'hubei-xianning', center: [114.3222, 29.8417], zoom: 10 },
      { label: '随州市', value: 'hubei-suizhou', center: [113.3825, 31.6902], zoom: 11 },
      { label: '恩施土家族苗族自治州', value: 'hubei-enshi', center: [109.4878, 30.2729], zoom: 9 },
      { label: '仙桃市', value: 'hubei-xiantao', center: [113.4540, 30.3645], zoom: 11 },
      { label: '潜江市', value: 'hubei-qianjiang', center: [112.8987, 30.4210], zoom: 11 },
      { label: '天门市', value: 'hubei-tianmen', center: [113.1660, 30.6631], zoom: 11 },
      { label: '神农架林区', value: 'hubei-shennongjia', center: [110.6755, 31.7449], zoom: 10 },
    ],
  },
  {
    label: '湖南省',
    value: 'hunan',
    center: [112.9836, 28.1127],
    zoom: 8,
    children: [
      { label: '长沙市', value: 'hunan-changsha', center: [112.9388, 28.2282], zoom: 11 },
      { label: '株洲市', value: 'hunan-zhuzhou', center: [113.1347, 27.8273], zoom: 11 },
      { label: '湘潭市', value: 'hunan-xiangtan', center: [112.9443, 27.8296], zoom: 11 },
      { label: '衡阳市', value: 'hunan-hengyang', center: [112.5719, 26.8936], zoom: 10 },
      { label: '邵阳市', value: 'hunan-shaoyang', center: [111.4677, 27.2395], zoom: 10 },
      { label: '岳阳市', value: 'hunan-yueyang', center: [113.1289, 29.3571], zoom: 10 },
      { label: '常德市', value: 'hunan-changde', center: [111.6982, 29.0319], zoom: 10 },
      { label: '张家界市', value: 'hunan-zhangjiajie', center: [110.4791, 29.1274], zoom: 10 },
      { label: '益阳市', value: 'hunan-yiyang', center: [112.3550, 28.5701], zoom: 10 },
      { label: '郴州市', value: 'hunan-chenzhou', center: [113.0154, 25.7709], zoom: 10 },
      { label: '永州市', value: 'hunan-yongzhou', center: [111.6135, 26.4206], zoom: 10 },
      { label: '怀化市', value: 'hunan-huaihua', center: [109.9783, 27.5501], zoom: 10 },
      { label: '娄底市', value: 'hunan-loudi', center: [111.9937, 27.6983], zoom: 11 },
      { label: '湘西土家族苗族自治州', value: 'hunan-xiangxi', center: [109.7397, 28.3115], zoom: 9 },
    ],
  },
  { label: '广东省', value: 'guangdong', center: [113.2800, 23.1252], zoom: 8 },
  { label: '广西壮族自治区', value: 'guangxi', center: [108.3200, 22.8200], zoom: 8 },
  { label: '海南省', value: 'hainan', center: [110.3312, 20.0316], zoom: 9 },
  { label: '四川省', value: 'sichuan', center: [104.0657, 30.6595], zoom: 7 },
  { label: '贵州省', value: 'guizhou', center: [106.7070, 26.5986], zoom: 8 },
  { label: '云南省', value: 'yunnan', center: [102.7124, 25.0389], zoom: 7 },
  { label: '西藏自治区', value: 'xizang', center: [91.1145, 29.6445], zoom: 6 },
  { label: '陕西省', value: 'shaanxi', center: [108.9541, 34.2655], zoom: 7 },
  { label: '甘肃省', value: 'gansu', center: [103.8236, 36.0580], zoom: 7 },
  { label: '青海省', value: 'qinghai', center: [101.7782, 36.6232], zoom: 7 },
  { label: '宁夏回族自治区', value: 'ningxia', center: [106.2782, 38.4664], zoom: 8 },
  { label: '新疆维吾尔自治区', value: 'xinjiang', center: [87.6177, 43.7928], zoom: 6 },
] as RegionItem[]

/**
 * 创建基础地图 - 使用高德地图 + 移动端优化
 */
export const createBaseMap = (
  target: HTMLElement,
  center: [number, number],
  zoom: number
): Map => {
  // 高德地图瓦片
  const gaodeLayer = new TileLayer({
    source: new XYZ({
      url: 'https://webrd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      attributions: '© 高德地图',
      maxZoom: 18,
    }),
  })

  const map = new Map({
    target,
    layers: [gaodeLayer],
    view: new View({
      center: fromLonLat(center),
      zoom,
      maxZoom: 18,
      minZoom: 3,
      enableRotation: false,
    }),
    pixelRatio: 1,
    controls: [],
  })

  return map
}

/**
 * 添加遥感影像图层
 */
export const addRemoteSensingImage = (
  map: Map,
  imageUrl: string,
  extent: [number, number, number, number],
  opacity: number = 1
): any => {
  const imageExtent = fromLonLat([extent[0], extent[1]]).concat(fromLonLat([extent[2], extent[3]]))

  const imageLayer = new ImageLayer({
    source: new Static({
      url: imageUrl,
      imageExtent: imageExtent as [number, number, number, number],
    }),
    opacity,
  })

  map.addLayer(imageLayer)
  return imageLayer
}

/**
 * 经纬度转像素坐标
 */
export const lonLatToPixel = (map: Map, lon: number, lat: number): [number, number] => {
  const pixel = map.getPixelFromCoordinate(fromLonLat([lon, lat]))
  return pixel as [number, number]
}

/**
 * 飞行到指定坐标
 */
export const flyTo = (map: Map, center: [number, number], zoom: number, duration: number = 1000): void => {
  const view = map.getView()
  view.animate({
    center: fromLonLat(center),
    zoom,
    duration,
  })
}
