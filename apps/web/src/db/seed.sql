-- DataEasy 初始数据插入脚本

-- 1. 反演数据
INSERT INTO inversion_data (id, name, study_area, date, type, size) VALUES
('e4a7b9c2f6d1', 'DZ01V_L2_E110.3_N29.2_20251225031144_01_T1_MTL', '湖南省张家界市', '2025-12-25', '高光谱', '34MB'),
('9f2d4e8a1c5b', '高光谱影像数据_2024Q1', '研究区A', '2024-03-15', '高光谱', '125MB'),
('7c3a8d5e2f9b', '地形数据_DEM', '研究区A', '2024-03-10', '地形', '45MB');

-- 2. 图层配置
INSERT INTO image_layers (id, name, description, url, visible, opacity, category, display_order) VALUES
('raw_rgb', '原始高光谱RGB', '原始高光谱场景RGB预览图，显示研究区域的真彩合成图像', '/demo_bundle/raw/raw_rgb_preview.png', 0, 80, 'raw', 1),
('ndvi', '植被指数NDVI', '归一化植被指数，反映植被生长状态和覆盖度', '/demo_bundle/processed/ndvi_preview.png', 0, 70, 'processed', 2),
('dem', '地形DEM', '数字高程模型，显示地表起伏和地形特征', '/demo_bundle/processed/dem_preview.png', 0, 60, 'processed', 3),
('pred_oc', '有机碳预测', '土壤有机碳含量预测图（0-5cm深度）', '/demo_bundle/results/pred_OC_0-5cm_1km_mean_preview.png', 0, 65, 'prediction', 4),
('pred_tn', '全氮预测', '土壤全氮含量预测图（0-5cm深度）', '/demo_bundle/results/pred_TN_0-5cm_1km_mean_preview.png', 0, 65, 'prediction', 5),
('pred_tp', '全磷预测', '土壤全磷含量预测图（0-5cm深度）', '/demo_bundle/results/pred_TP_0-5cm_1km_mean_preview.png', 0, 65, 'prediction', 6),
('unc_oc', '有机碳不确定性', '有机碳预测的不确定性评估，反映预测的可靠度', '/demo_bundle/results/unc_OC_0-5cm_1km_mean_preview.png', 1, 60, 'uncertainty', 7),
('unc_tn', '全氮不确定性', '全氮预测的不确定性评估，反映预测的可靠度', '/demo_bundle/results/unc_TN_0-5cm_1km_mean_preview.png', 0, 60, 'uncertainty', 8),
('unc_tp', '全磷不确定性', '全磷预测的不确定性评估，反映预测的可靠度', '/demo_bundle/results/unc_TP_0-5cm_1km_mean_preview.png', 0, 60, 'uncertainty', 9),
('explain_top1_factor_oc', '有机碳证据因子', '每像元Top1证据因子类别图层（有机碳）', '/evidence_delivery_demo/rasters/explain_top1_factor_OC_0-5cm_1km_mean.tif', 0, 70, 'prediction', 10),
('explain_top1_strength_oc', '有机碳证据强度', '每像元Top1证据强度图层（有机碳）', '/evidence_delivery_demo/rasters/explain_top1_strength_OC_0-5cm_1km_mean.tif', 0, 70, 'prediction', 11),
('explain_top1_factor_tn', '全氮证据因子', '每像元Top1证据因子类别图层（全氮）', '/evidence_delivery_demo/rasters/explain_top1_factor_TN_0-5cm_1km_mean.tif', 0, 70, 'prediction', 12),
('explain_top1_strength_tn', '全氮证据强度', '每像元Top1证据强度图层（全氮）', '/evidence_delivery_demo/rasters/explain_top1_strength_TN_0-5cm_1km_mean.tif', 0, 70, 'prediction', 13);

-- 3. 风险区域
INSERT INTO risk_zones (id, label, risk_level, risk_text, confidence, hint, action, tag_type, lon, lat) VALUES
(1, '西北部盐渍化区', 'high', '高', '高', '高风险 + 高可信，建议优先复核', '优先复核', 'danger', 110.15, 29.35),
(2, '中部有机质低洼区', 'medium', '中', '高', '中风险 + 高可信，建议加强监测', '加强监测', 'warning', 110.32, 29.24),
(3, '东南部优质耕地', 'low', '低', '高', '低风险 + 高可信，可信度良好', '定期巡查', 'success', 110.50, 29.05);

-- 4. 归因因子（默认数据）
INSERT INTO attribution_factors (name, pct, color, hint, display_order) VALUES
('有机质含量', 42, '#00ffcc', '该因子在该区域异常偏低，影响最大', 1),
('土壤含水量', 31, '#3b82f6', '该因子在该区域偏低，旱情显著', 2),
('地形起伏', 15, '#b794f6', '该因子导致局部盐分聚集', 3),
('盐分特征', 12, '#ff6b35', '该因子在该区域异常偏高', 4);

-- 5. 土壤指标配置
INSERT INTO soil_indicators (code, label, unit, mean, max, min, std, median, cv, levels, distribution) VALUES
('OC', '土壤有机碳', 'g/kg', 18.5, 45.2, 5.3, 8.6, 16.8, 46.5, 
 '["非常高","高","中等","低","非常低"]', '[12,28,35,20,5]'),
('TN', '土壤全氮', 'g/kg', 1.45, 3.2, 0.4, 0.62, 1.38, 42.8,
 '["非常高","高","中等","低","非常低"]', '[10,25,40,20,5]'),
('TP', '土壤全磷', 'g/kg', 0.82, 1.8, 0.2, 0.35, 0.78, 42.7,
 '["非常高","高","中等","低","非常低"]', '[8,22,45,20,5]'),
('pH', '土壤pH值', '', 6.8, 8.2, 5.5, 0.65, 6.7, 9.6,
 '["强碱性","碱性","中性","酸性","强酸性"]', '[5,15,55,20,5]');

-- 6. 时序数据
INSERT INTO timeline_data (date, seq) VALUES
('2024-01-15', 1),
('2024-02-15', 2),
('2024-03-15', 3),
('2024-04-15', 4),
('2024-05-15', 5),
('2024-06-15', 6);

-- 7. 报告列表
INSERT INTO reports (id, name, create_time, start_date, end_date, study_area, analysis_type, quality_score, quality_level, summary, recommendations, indicators) VALUES
('report-001', '2024年Q1土壤质量分析报告', '2024-03-20', '2024-01-01', '2024-03-31', '研究区A', 'timeseries', 72, '中等', 
 '该区域整体土壤质量处于中等偏好水平',
 '["加强西北部区域的排水改良工作","适当增施有机肥，提高土壤肥力","建立长期监测机制，跟踪土壤质量变化趋势"]',
 '{"organicMatter":{"avg":45.8,"min":35.2,"max":58.6,"std":6.5,"trend":"up","status":"good","description":"整体呈上升趋势，说明土壤肥力状况良好"},"moisture":{"avg":32.5,"min":22.1,"max":45.8,"std":7.2,"trend":"stable","status":"normal","description":"处于适中水平，有利于作物生长"},"salinity":{"level":"light","area":"西北部","coverage":"约15%","status":"warning","description":"建议加强监测和改良"}}'),
('report-002', '2023年度土壤质量年报', '2024-01-10', '2023-01-01', '2023-12-31', '研究区B', 'timeseries', 68, '中等',
 '整体土壤质量保持稳定',
 '["持续监测土壤质量变化"]',
 '{"organicMatter":{"avg":42.3,"min":32.5,"max":53.2,"std":5.8,"trend":"stable","status":"normal","description":"保持稳定水平"},"moisture":{"avg":28.7,"min":18.3,"max":38.9,"std":6.1,"trend":"down","status":"normal","description":"略有下降，需要关注"},"salinity":{"level":"none","area":"无","coverage":"0%","status":"good","description":"未检测到盐渍化"}}');

-- 8. 土壤综合指数（单行配置）
INSERT INTO soil_index (id, value, uncertainty, confidence_text, confidence_level, confidence_type, confidence_pct, organic_matter, water_content, terrain_undulation, salinity_feature, ph_level) VALUES
(1, 72.4, 3, '高', 'high', 'success', 85, 42, 31, 15, 12, '适中');

-- 9. 证据链区域数据（关联到 report-001）
INSERT INTO evidence_regions (report_id, region_id, target, pixel_count, pred_mean, pred_p50, pred_p95) VALUES
('report-001', 0, 'OC_0-5cm_1km_mean', 2382, 1.847, 1.851, 1.978),
('report-001', 1, 'OC_0-5cm_1km_mean', 1144, 1.754, 1.756, 1.853);

-- 10. 证据链因子数据
-- Region 0 的 Top-3 证据
INSERT INTO evidence_factors (evidence_region_id, factor_id, factor_label, baseline_type, freq, delta_mean, direction, score, rank) VALUES
(1, 43, 'terrain_relief', 'region_mean', 0.726, 0.465, 'increase', 0.338, 1),
(1, 40, 'climate_bio15', 'region_mean', 0.183, -0.402, 'decrease', 0.073, 2),
(1, 19, 'ndre', 'region_mean', 0.064, -0.419, 'decrease', 0.027, 3);

-- Region 1 的 Top-3 证据
INSERT INTO evidence_factors (evidence_region_id, factor_id, factor_label, baseline_type, freq, delta_mean, direction, score, rank) VALUES
(2, 43, 'terrain_relief', 'region_mean', 0.743, 0.420, 'increase', 0.312, 1),
(2, 40, 'climate_bio15', 'region_mean', 0.230, -0.375, 'decrease', 0.086, 2),
(2, 37, 'climate_bio1', 'region_mean', 0.027, 0.392, 'increase', 0.011, 3);
