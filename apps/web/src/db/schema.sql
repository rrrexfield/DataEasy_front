-- DataEasy 展示数据 SQLite 表结构
-- 用于替代硬编码的展示数据

-- 1. 反演数据表
CREATE TABLE IF NOT EXISTS inversion_data (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  study_area TEXT NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  size TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. 图层配置表
CREATE TABLE IF NOT EXISTS image_layers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  visible INTEGER DEFAULT 0,  -- 0=false, 1=true
  opacity INTEGER DEFAULT 80,  -- 0-100
  category TEXT NOT NULL,  -- raw, processed, prediction, uncertainty
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. 风险区域表
CREATE TABLE IF NOT EXISTS risk_zones (
  id INTEGER PRIMARY KEY,
  label TEXT NOT NULL,
  risk_level TEXT NOT NULL,  -- high, medium, low
  risk_text TEXT NOT NULL,
  confidence TEXT NOT NULL,
  hint TEXT NOT NULL,
  action TEXT NOT NULL,
  tag_type TEXT NOT NULL,  -- danger, warning, success
  lon REAL NOT NULL,
  lat REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. 归因因子表（默认数据）
CREATE TABLE IF NOT EXISTS attribution_factors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  pct INTEGER NOT NULL,
  color TEXT NOT NULL,
  hint TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. 土壤指标配置表
CREATE TABLE IF NOT EXISTS soil_indicators (
  code TEXT PRIMARY KEY,  -- OC, TN, TP, etc.
  label TEXT NOT NULL,
  unit TEXT NOT NULL,
  mean REAL NOT NULL,
  max REAL NOT NULL,
  min REAL NOT NULL,
  std REAL NOT NULL,
  median REAL NOT NULL,
  cv REAL NOT NULL,
  levels TEXT NOT NULL,  -- JSON array
  distribution TEXT NOT NULL,  -- JSON array
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 6. 时序数据表
CREATE TABLE IF NOT EXISTS timeline_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  seq INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 7. 报告列表表
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  create_time TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  study_area TEXT NOT NULL,
  analysis_type TEXT NOT NULL,  -- single, timeseries
  quality_score INTEGER NOT NULL,
  quality_level TEXT NOT NULL,
  summary TEXT NOT NULL,
  recommendations TEXT NOT NULL,  -- JSON array
  indicators TEXT NOT NULL,  -- JSON object
  data_source TEXT,  -- JSON object (for single analysis)
  evidence_data TEXT,  -- JSON object
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 8. 土壤综合指数表
CREATE TABLE IF NOT EXISTS soil_index (
  id INTEGER PRIMARY KEY CHECK (id = 1),  -- 确保单行
  value REAL NOT NULL,
  uncertainty INTEGER NOT NULL,
  confidence_text TEXT NOT NULL,
  confidence_level TEXT NOT NULL,  -- low, medium, high
  confidence_type TEXT NOT NULL,-- success, warning, danger
  confidence_pct INTEGER NOT NULL,
  organic_matter INTEGER NOT NULL,
  water_content INTEGER NOT NULL,
  terrain_undulation INTEGER NOT NULL,
  salinity_feature INTEGER NOT NULL,
  ph_level TEXT NOT NULL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 9. 证据链区域表
CREATE TABLE IF NOT EXISTS evidence_regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT NOT NULL,  -- 关联到 reports 表
  region_id INTEGER NOT NULL,
  target TEXT NOT NULL,
  pixel_count INTEGER NOT NULL,
  pred_mean REAL NOT NULL,
  pred_p50 REAL NOT NULL,
  pred_p95 REAL NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

-- 10. 证据链因子表
CREATE TABLE IF NOT EXISTS evidence_factors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evidence_region_id INTEGER NOT NULL,  -- 关联到 evidence_regions 表的 id
  factor_id INTEGER NOT NULL,
  factor_label TEXT NOT NULL,
  baseline_type TEXT NOT NULL,
  freq REAL NOT NULL,
  delta_mean REAL NOT NULL,
  direction TEXT NOT NULL,
  score REAL NOT NULL,
  rank INTEGER NOT NULL,  -- Top-K 排序 (1, 2, 3...)
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evidence_region_id) REFERENCES evidence_regions(id) ON DELETE CASCADE
);

-- 索引优化
CREATE INDEX IF NOT EXISTS idx_inversion_data_date ON inversion_data(date);
CREATE INDEX IF NOT EXISTS idx_image_layers_category ON image_layers(category);
CREATE INDEX IF NOT EXISTS idx_reports_analysis_type ON reports(analysis_type);
CREATE INDEX IF NOT EXISTS idx_evidence_regions_report_id ON evidence_regions(report_id);
CREATE INDEX IF NOT EXISTS idx_evidence_factors_region_id ON evidence_factors(evidence_region_id);
