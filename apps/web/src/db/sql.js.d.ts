/**
 * Type definitions for sql.js
 * sql.js - SQLite compiled to WebAssembly
 */

declare module 'sql.js' {
  export interface Statement {
    bind(values?: any[]): boolean
    step(): boolean
    get(params?: any[]): any[]
    getAsObject(params?: any[]): any
    getColumnNames(): string[]
    free(): boolean
    reset(): void
  }

  export interface Database {
    run(sql: string, params?: any[]): Database
    exec(sql: string): QueryExecResult[]
    prepare(sql: string): Statement
    export(): Uint8Array
    close(): void
    getRowsModified(): number
    create_function(name: string, func: (...args: any[]) => any): Database
  }

  export interface QueryExecResult {
    columns: string[]
    values: any[][]
  }

  export interface SqlJsStatic {
    Database: {
      new (): Database
      new (data: Uint8Array): Database
    }
  }

  export interface SqlJsConfig {
    locateFile?: (file: string) => string
    /** @deprecated Use locateFile instead */
    wasmBinary?: ArrayBuffer
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>

  export { SqlJsStatic as SQL }
}
