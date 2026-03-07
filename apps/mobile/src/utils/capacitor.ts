import { Camera } from '@capacitor/camera'
import { Geolocation } from '@capacitor/geolocation'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

/**
 * 拍照或从相册选择图片
 */
export const takePicture = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: 'uri',
    })
    return image.webPath
  } catch (error) {
    console.error('拍照失败:', error)
    throw error
  }
}

/**
 * 获取当前位置
 */
export const getCurrentPosition = async () => {
  try {
    const position = await Geolocation.getCurrentPosition()
    return {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    }
  } catch (error) {
    console.error('获取位置失败:', error)
    throw error
  }
}

/**
 * 保存文件
 */
export const saveFile = async (data: string, filename: string) => {
  try {
    await Filesystem.writeFile({
      path: filename,
      data,
      directory: Directory.Documents,
    })
    return true
  } catch (error) {
    console.error('保存文件失败:', error)
    throw error
  }
}

/**
 * 触觉反馈
 */
export const vibrate = async (style: ImpactStyle = ImpactStyle.Medium) => {
  try {
    await Haptics.impact({ style })
  } catch (error) {
    console.warn('触觉反馈不可用:', error)
  }
}
