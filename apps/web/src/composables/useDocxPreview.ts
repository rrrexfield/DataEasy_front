/**
 * DOCX 预览 Composable
 * 使用 docx-preview 将 .docx 数据渲染到指定 DOM 容器中
 */
import { ref, type Ref } from 'vue'
import { renderAsync } from 'docx-preview'
import { generateDocxBuffer, buildReportDocument, type ReportData } from '@/utils/docx-builder'

export function useDocxPreview() {
  const previewLoading = ref(false)
  const previewError = ref('')

  /**
   * 根据 ReportData 生成并预览 DOCX
   * @param reportData - 报告数据
   * @param container - 渲染目标 DOM 元素
   */
  async function previewReport(reportData: ReportData, container: HTMLElement): Promise<void> {
    previewLoading.value = true
    previewError.value = ''

    try {
      // 1. 生成 DOCX 的 ArrayBuffer
      const buffer = await generateDocxBuffer(reportData)

      // 2. 清空容器
      container.innerHTML = ''

      // 3. 使用 docx-preview 渲染
      await renderAsync(buffer, container, null, {
        className: 'docx-preview',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        ignoreLastRenderedPageBreak: true,
        experimental: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误'
      previewError.value = `DOCX 预览失败：${message}`
      console.error('DOCX 预览错误：', err)
    } finally {
      previewLoading.value = false
    }
  }

  /**
   * 预览一个已存在的 Blob（如从服务器加载的 .docx 文件）
   */
  async function previewBlob(blob: Blob, container: HTMLElement): Promise<void> {
    previewLoading.value = true
    previewError.value = ''

    try {
      const buffer = await blob.arrayBuffer()
      container.innerHTML = ''

      await renderAsync(buffer, container, null, {
        className: 'docx-preview',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        ignoreLastRenderedPageBreak: true,
        experimental: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : '未知错误'
      previewError.value = `DOCX 预览失败：${message}`
      console.error('DOCX 预览错误：', err)
    } finally {
      previewLoading.value = false
    }
  }

  return {
    previewLoading,
    previewError,
    previewReport,
    previewBlob,
  }
}
