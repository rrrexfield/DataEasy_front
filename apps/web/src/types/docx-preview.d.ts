declare module 'docx-preview' {
  interface RenderOptions {
    className?: string
    inWrapper?: boolean
    ignoreWidth?: boolean
    ignoreHeight?: boolean
    ignoreFonts?: boolean
    breakPages?: boolean
    ignoreLastRenderedPageBreak?: boolean
    experimental?: boolean
  }

  export function renderAsync(
    data: Blob | ArrayBuffer | Uint8Array,
    container: HTMLElement,
    styleContainer?: HTMLElement | null,
    options?: RenderOptions
  ): Promise<void>
}
