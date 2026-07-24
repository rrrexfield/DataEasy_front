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

-- 7. 报告 — 湖南省张家界市单期综合分析报告
INSERT INTO reports (id, name, create_time, start_date, end_date, study_area, analysis_type, quality_score, quality_level, summary, recommendations, indicators, data_source) VALUES
('report-zjj-2025', '张家界市2025年土壤质量综合分析报告', '2025-12-26', '2025-12-25', '2025-12-25', '湖南省张家界市', 'single', 76, '良好',
 '该区域土壤质量整体处于良好水平。有机质丰富（47.3 g/kg，高于全国均值约60%），含水量适中（35.2%），全氮中上（1.52 g/kg）。西北部河谷平原存在轻度盐渍化（约3.2 km²，占总面积12%，年增0.8%）；中部农田区速效钾偏低（78.2 mg/kg，35%区域缺乏）；东南坡地NDVI下降（1.8 km²），存在水土流失风险。总体适宜农业生产，建议实施分区精准管理。',
 '["【盐渍化治理-紧急】C区（3.2km²）实施排水工程（渠深2.5-3.0m）+春灌淋洗（2-3次，200-300mm/次）+增施有机肥3000-5000 kg/亩+石膏50-100 kg/亩。连续治理3年降盐至1.5 g/kg以下。","【精准施肥-重要】A区N-P₂O₅-K₂O=12-8-10，B区15-10-15（重点补钾），C区18-12-12（补氮补磷）。有机肥按区投放2000-5000 kg/亩。","【作物布局-重要】C区选耐盐品种（海稻86、盐丰47号），B区玉米-大豆轮作，A区经济林。全区推广3年轮作制。","【风险监测-重要】建立12点监测网络（天-空-地一体化），季度遥感+月度无人机+每周地面采样。","【科技推广-常规】GPS/北斗变量施肥（减化肥20-30%）、测土配方到户、EM菌应用、农技培训2-3次/年。"]',
 '{"organicMatter":{"avg":47.3,"min":32.1,"max":65.8,"std":8.2,"trend":"stable","status":"good","description":"东南森林区最高（65.8 g/kg），中部农田区45.2 g/kg，西北河谷区最低（32.1 g/kg）。全区41%面积>50 g/kg（优质），34%面积30-50 g/kg。与含水量正相关（r=0.68）。"},"moisture":{"avg":35.2,"min":18.5,"max":52.7,"std":7.8,"trend":"stable","status":"good","description":"东部森林区最高（52.7%），中部30-40%适宜，西北部偏低（18.5-25%）。冬季枯水期，夏季预计回升至42%。"},"salinity":{"level":"light","area":"西北部河谷平原（澧水沿岸低洼带）","coverage":"约12%（约3.2 km²）","status":"warning","description":"全盐量2-4 g/kg（轻度），硫酸盐-氯化物混合型。地下水位1.5-2.5m。过去3年年均扩张0.8%。"},"totalNitrogen":{"avg":1.52,"min":0.95,"max":2.15,"std":0.31,"trend":"stable","status":"good","description":"与有机质高度正相关（r=0.82），东南最高（2.15 g/kg），西北最低（0.95 g/kg）。"},"availablePhosphorus":{"avg":18.7,"min":8.2,"max":28.5,"std":7.2,"trend":"up","status":"normal","description":"空间变异大（CV=38.5%），中部最高（28.5 mg/kg），东南最低（8.2 mg/kg），约30%区域缺乏。"},"availablePotassium":{"avg":95.3,"min":78.2,"max":132.5,"std":15.8,"trend":"down","status":"warning","description":"中部农田区最低（78.2 mg/kg），东部最高（132.5 mg/kg），约35%区域<80 mg/kg（缺乏），是主要营养短板。"},"ndvi":{"avg":0.62,"min":0.25,"max":0.85,"std":0.14,"trend":"down","status":"normal","description":"东部最高（0.78-0.85），中部0.45-0.65（冬季休耕），西北最低（0.25-0.40）。东南坡地（1.8 km²）较去年降0.08。"}}',
 '{"id":"e4a7b9c2f6d1","name":"DZ01V_L2_E110.3_N29.2_20251225031144_01_T1_MTL","date":"2025-12-25","productId":"DZ01V_L2_E110.3_N29.2_20251225031144_01_T1","spacecraft":"DZ01","sensor":"VNIR","bounds":{"north":29.509381,"south":28.971594,"east":110.617518,"west":110.024867}}');

-- 8. 土壤综合指数（单行配置）
INSERT INTO soil_index (id, value, uncertainty, confidence_text, confidence_level, confidence_type, confidence_pct, organic_matter, water_content, terrain_undulation, salinity_feature, ph_level) VALUES
(1, 72.4, 3, '高', 'high', 'success', 85, 42, 31, 15, 12, '适中');

-- 9. 证据链区域数据（关联到 report-zjj-2025）
INSERT INTO evidence_regions (report_id, region_id, target, pixel_count, pred_mean, pred_p50, pred_p95) VALUES
('report-zjj-2025', 0, 'OC_0-5cm_1km_mean', 2382, 1.847, 1.851, 1.978),
('report-zjj-2025', 1, 'OC_0-5cm_1km_mean', 1144, 1.754, 1.756, 1.853);

-- 10. 证据链因子数据
INSERT INTO evidence_factors (evidence_region_id, factor_id, factor_label, baseline_type, freq, delta_mean, direction, score, rank) VALUES
(1, 43, 'terrain_relief', 'region_mean', 0.726, 0.465, 'increase', 0.338, 1),
(1, 40, 'climate_bio15', 'region_mean', 0.183, -0.402, 'decrease', 0.073, 2),
(1, 19, 'ndre', 'region_mean', 0.064, -0.419, 'decrease', 0.027, 3);
INSERT INTO evidence_factors (evidence_region_id, factor_id, factor_label, baseline_type, freq, delta_mean, direction, score, rank) VALUES
(2, 43, 'terrain_relief', 'region_mean', 0.743, 0.420, 'increase', 0.312, 1),
(2, 40, 'climate_bio15', 'region_mean', 0.230, -0.375, 'decrease', 0.086, 2),
(2, 37, 'climate_bio1', 'region_mean', 0.027, 0.392, 'increase', 0.011, 3);
