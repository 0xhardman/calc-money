BEGIN;

-- 1. 修正之前标错的两张门票
UPDATE transactions_v2
SET note = '大卫像/学院美术馆门票 (5/17)', trans_date = '2026-05-17'
WHERE merchant = 'WWW.B-TICKET.COM.UFFIZI';

UPDATE transactions_v2
SET note = '乌菲兹美术馆通票 (5/16 佛罗伦萨)', trans_date = '2026-05-16'
WHERE merchant = 'WWW.COOPCULTURE.IT';

-- 2. 新增小曹付的住宿和门票（用 USD 录入，与原始账单一致）
WITH cao AS (SELECT id FROM people WHERE name='小曹')
INSERT INTO transactions_v2
  (trans_date, merchant, amount, currency, payer_id, category, note, source, status)
VALUES
  ('2026-05-15', '佛罗伦萨住宿 (5/15-17)',     550.41, 'USD', (SELECT id FROM cao), '住宿',     '小曹付', 'manual', 'completed'),
  ('2026-05-17', '威尼斯住宿 (5/17-19)',       416.00, 'USD', (SELECT id FROM cao), '住宿',     '小曹付', 'manual', 'completed'),
  ('2026-05-17', '百花穹顶门票',                71.96, 'USD', (SELECT id FROM cao), '景点门票', '佛罗伦萨 Duomo 穹顶 (小曹付)', 'manual', 'completed'),
  ('2026-05-19', '米兰住宿 (5/19-20)',         114.18, 'USD', (SELECT id FROM cao), '住宿',     '小曹付', 'manual', 'completed'),
  ('2026-05-20', '罗马住宿 (5/20-23)',         773.11, 'USD', (SELECT id FROM cao), '住宿',     '小曹付', 'manual', 'completed');

-- 3. 这 5 笔都两人均分 (50/50)
INSERT INTO participants (transaction_id, person_id, share_ratio)
SELECT t.id, p.id, 0.5
FROM transactions_v2 t
CROSS JOIN people p
WHERE t.merchant IN (
  '佛罗伦萨住宿 (5/15-17)', '威尼斯住宿 (5/17-19)', '百花穹顶门票',
  '米兰住宿 (5/19-20)', '罗马住宿 (5/20-23)'
);

COMMIT;

-- 校验
SELECT trans_date, merchant, amount, currency, source
FROM transactions_v2
WHERE source='manual'
ORDER BY trans_date;
