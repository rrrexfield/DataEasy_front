/**
 * SQLite 数据库服务层
 * 使用 sql.js 在浏览器环境中运行 SQLite
 */

import initSqlJs, { type Database } from 'sql.js'
// 使用 Vite 的 ?raw 导入将 SQL 文件作为字符串导入
import schemaSQL from './schema.sql?raw'
import seedSQL from './seed.sql?raw'

class DatabaseService {
  private db: Database | null = null
  private dbName = 'dataeasy.db'
  private dbVersion = 2 // 🆕 数据库版本号（增加了证据链表）
  private versionKey = 'dataeasy.db.version'

  /**
   * 初始化数据库
   */
  async initialize(): Promise<void> {
    try {
      // 初始化 sql.js，使用 unpkg CDN 自动解析版本
      const SQL = await initSqlJs({
        locateFile: (file) => `https://unpkg.com/sql.js@1.14.1/dist/${file}`
      })

      // 检查数据库版本
      const savedVersion = localStorage.getItem(this.versionKey)
      const needsReset = !savedVersion || parseInt(savedVersion) < this.dbVersion

      if (needsReset && localStorage.getItem(this.dbName)) {
        console.log(`🔄 检测到数据库版本过旧（${savedVersion || 0} < ${this.dbVersion}），将重新初始化`)
        localStorage.removeItem(this.dbName)
        localStorage.removeItem(this.versionKey)
      }

      // 从 localStorage 加载已有数据库
      const savedDb = localStorage.getItem(this.dbName)
      if (savedDb && !needsReset) {
        const buffer = this.base64ToUint8Array(savedDb)
        this.db = new SQL.Database(buffer)
        console.log('✅ 数据库已从缓存加载')
      } else {
        // 创建新数据库
        this.db = new SQL.Database()
        this.createTables()
        this.insertInitialData()
        this.save()
        // 保存版本号
        localStorage.setItem(this.versionKey, this.dbVersion.toString())
        console.log(`✅ 新数据库已创建并初始化（版本 ${this.dbVersion}）`)
      }
    } catch (error) {
      console.error('❌ 数据库初始化失败:', error)
      throw error
    }
  }

  /**
   * 创建数据库表
   */
  private createTables(): void {
    if (!this.db) throw new Error('数据库未初始化')

    this.db.run(schemaSQL)
    console.log('✅ 数据库表结构已创建')
  }

  /**
   * 插入初始数据
   */
  private insertInitialData(): void {
    if (!this.db) throw new Error('数据库未初始化')

    this.db.run(seedSQL)
    console.log('✅ 初始数据已插入')
  }

  /**
   * 保存数据库到 localStorage
   */
  save(): void {
    if (!this.db) return
    const data = this.db.export()
    const base64 = this.uint8ArrayToBase64(data)
    localStorage.setItem(this.dbName, base64)
  }

  /**
   * 执行查询
   */
  query<T = any>(sql: string, params: any[] = []): T[] {
    if (!this.db) throw new Error('数据库未初始化')
    
    const stmt = this.db.prepare(sql)
    stmt.bind(params)
    
    const results: T[] = []
    while (stmt.step()) {
      const row = stmt.getAsObject()
      results.push(row as T)
    }
    stmt.free()
    
    return results
  }

  /**
   * 执行单行查询
   */
  queryOne<T = any>(sql: string, params: any[] = []): T | null {
    const results = this.query<T>(sql, params)
    return results.length > 0 ? results[0] : null
  }

  /**
   * 执行插入/更新/删除
   */
  execute(sql: string, params: any[] = []): void {
    if (!this.db) throw new Error('数据库未初始化')
    
    this.db.run(sql, params)
    this.save()
  }

  /**
   * 工具方法：Uint8Array 转 Base64
   */
  private uint8ArrayToBase64(buffer: Uint8Array): string {
    let binary = ''
    const len = buffer.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(buffer[i])
    }
    return btoa(binary)
  }

  /**
   * 工具方法：Base64 转 Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64)
    const len = binary.length
    const buffer = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i)
    }
    return buffer
  }

  /**
   * 清除数据库
   */
  clear(): void {
    localStorage.removeItem(this.dbName)
    this.db = null
    console.log('✅ 数据库已清除')
  }

  /**
   * 导出数据库文件
   */
  export(): Uint8Array | null {
    return this.db ? this.db.export() : null
  }

  /**
   * 关闭数据库
   */
  close(): void {
    if (this.db) {
      this.save()
      this.db.close()
      this.db = null
    }
  }
}

// 导出单例
export const db = new DatabaseService()
export default db
