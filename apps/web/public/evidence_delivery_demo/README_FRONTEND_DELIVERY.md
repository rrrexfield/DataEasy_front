# PlanC 前端交付数据说明（README）

本说明用于前端页面直接接入 `planC/outputs/evidence_delivery_demo` 数据包。  

## 1. 数据包目录

```text
evidence_delivery_demo/
  evidence_manifest.json
  summary_stats.json
  evidence_list_<target>.json
  evidence_list_<target>.csv
  region_evidence_<target>.geojson
  rasters/
    pred_<target>.tif
    unc_<target>.tif
    explain_top1_factor_<target>.tif
    explain_top1_strength_<target>.tif
```

## 2. 读取的文件

优先读取：
1. `evidence_manifest.json`（总索引，入口文件）
2. `summary_stats.json`（统计信息）
3. `rasters/*.tif`（栅格图层）
4. `region_evidence_*.geojson`（区域证据矢量层）
5. `evidence_list_*.json/.csv`（解释清单）

## 3. 最小接入流程（前端）

1. 读取 `evidence_manifest.json`。
2. 从 `layers` 中拿到栅格路径，渲染图层切换：
   - 预测值图层：`pred_*`
   - 不确定性图层：`unc_*`
   - 像元证据图层：`explain_top1_factor_*`
   - 证据强度图层：`explain_top1_strength_*`
3. 从 `region_layers` 中读取 `region_evidence_*.geojson`，实现区域点击。
4. 点击区域后，按 `region_id` 展示该区域的证据信息：
   - 可直接用 GeoJSON 的 `properties.top_evidence`
   - 或从 `evidence_list_<target>.json` 中按 `region_id` 查询
5. 在页面右侧展示证据表（Top-K）和预测统计（`pred_stat`）。

## 4. 关键字段说明

### 4.1 `evidence_manifest.json`

- `layers[]`
  - `id`: 图层ID
  - `role`: `prediction` / `uncertainty` / `categorical_factor` / `strength`
  - `path`: 相对路径（相对于 `evidence_delivery_demo`）
  - `legend`: 图例信息（可直接用于渲染）
  - `stats`: 该图层统计值
- `region_layers[]`
  - `path`: `region_evidence_<target>.geojson`
  - `id_field`: `region_id`
  - `target_field`: `target`
- `evidence_lists[]`
  - `json_path`, `csv_path`: 解释清单路径

### 4.2 `region_evidence_<target>.geojson`

每个 Feature 的 `properties` 至少包含：
- `region_id`
- `target`
- `pixel_count`
- `pred_stat`
- `top_evidence`（数组，审计字段）

`top_evidence` 条目字段：
- `factor_id`
- `factor_label`
- `factor_kind`
- `baseline_type`
- `baseline_value`
- `freq`
- `delta_mean`
- `direction`
- `score`

### 4.3 `evidence_list_<target>.json/.csv`

按治理单元逐条输出，与 GeoJSON 信息一致，便于导出、检索和审计。

## 5. 图层语义（页面文案可直接用）

- `pred_*`: 预测值图层
- `unc_*`: 不确定性图层（值越大，模型分歧越大）
- `explain_top1_factor_*`: 每像元 Top1 证据因子类别
- `explain_top1_strength_*`: 每像元 Top1 证据强度

## 6. 单位建议

不同指标单位不同，建议按目标名做前端映射（示例）：
- `TN/OC/TP/TK/GRAVEL`: `g/100g`
- `AP/AN/AK`: `mg/kg`
- `BD`: `g/cm3`
- `POROSITY`: `cm3/cm3`
- `CLAY/SILT/SAND`: `%`
- `PH`: 无单位

