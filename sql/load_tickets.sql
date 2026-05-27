-- Train tickets (Italy trip) — all shared 2-way since 5/15 misses count too
INSERT INTO transactions
  (trans_date, merchant, rmb_amount, country, txn_type, category, note, is_trip, is_shared, share_count, status, source)
VALUES
  ('2026-05-13', '佛罗伦萨→卢卡 RE 18480',         70.00,  'IT', 'consumption', '交通', '火车票 17:37-19:23',                  TRUE, TRUE, 2, 'completed', 'trip_app'),
  ('2026-05-15', '卢卡省→比萨 RE 19151 (错过)',     126.00, 'IT', 'consumption', '交通', '火车票 07:56-09:18 (未赶上)',           TRUE, TRUE, 2, 'missed',    'trip_app'),
  ('2026-05-15', '卢卡省→比萨 RE 19151 (取消)',     63.00,  'IT', 'consumption', '交通', '火车票 07:56-09:18 (已取消)',           TRUE, TRUE, 2, 'cancelled', 'trip_app'),
  ('2026-05-15', '卢卡→比萨 RE 18560',             65.00,  'IT', 'consumption', '交通', '火车票 09:10-09:38',                  TRUE, TRUE, 2, 'completed', 'trip_app'),
  ('2026-05-15', '卢卡→比萨 RE 18566',             65.00,  'IT', 'consumption', '交通', '火车票 10:42-11:02',                  TRUE, TRUE, 2, 'completed', 'trip_app'),
  ('2026-05-15', '比萨→拉斯佩齐亚 RE 18361',        139.00, 'IT', 'consumption', '交通', '火车票 11:12-12:20',                  TRUE, TRUE, 2, 'completed', 'trip_app'),
  ('2026-05-15', '拉斯佩齐亚→佛罗伦萨 FA 8591',     263.00, 'IT', 'consumption', '交通', '火车票 19:48-21:29',                  TRUE, TRUE, 2, 'completed', 'trip_app'),
  ('2026-05-15', '拉斯佩齐亚→佛罗伦萨 RE+RV',       248.00, 'IT', 'consumption', '交通', '火车票 20:11-22:32 (RE 19379, RV 4062)', TRUE, TRUE, 2, 'completed', 'trip_app'),
  ('2026-05-17', '佛罗伦萨→威尼斯 Italo 8928',      843.00, 'IT', 'consumption', '交通', '高铁 17:39-19:55',                    TRUE, TRUE, 2, 'completed', 'trip_app'),
  ('2026-05-19', '威尼斯→米兰 FR 9726',            611.00, 'IT', 'consumption', '交通', '高铁 11:30-13:45',                    TRUE, TRUE, 2, 'completed', 'trip_app'),
  ('2026-05-20', '米兰→罗马 Italo 9985',           594.00, 'IT', 'consumption', '交通', '高铁 14:20-17:30',                    TRUE, TRUE, 2, 'completed', 'trip_app');

-- 机票（我一人）
INSERT INTO transactions
  (trans_date, merchant, rmb_amount, country, txn_type, category, note, is_trip, is_shared, share_count, status, source)
VALUES
  ('2026-05-11', '昆明→成都→伊斯坦布尔→巴塞罗那→佛罗伦萨', 4339.00, 'CN', 'consumption', '交通',
   '机票 3U8668/3U3827/VY3073/VY6001 (我个人)', TRUE, FALSE, 1, 'completed', 'trip_app');

-- 重算 my_share (取消的不计)
UPDATE transactions
SET my_share = CASE
  WHEN status = 'cancelled' THEN 0
  ELSE ROUND(rmb_amount::numeric / share_count, 2)
END
WHERE source = 'trip_app';
