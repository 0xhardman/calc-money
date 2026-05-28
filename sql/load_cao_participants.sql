-- 为小曹账单建分摊关系
BEGIN;

WITH cao AS (SELECT id FROM people WHERE name='小曹'),
     me  AS (SELECT id FROM people WHERE name='我'),
     -- 取本次新录入的 20 笔（source=chase_cc）
     new_txns AS (
       SELECT id, merchant, amount FROM transactions_v2
       WHERE source='chase_cc'
     )
-- 默认两人均分（50%/50%）
INSERT INTO participants (transaction_id, person_id, share_ratio)
SELECT t.id, p.id, 0.5
FROM new_txns t
CROSS JOIN people p
-- 排除：小曹个人物品（Vivienne, Windtre）
WHERE t.merchant NOT IN ('VIVIENNE WESTWOOD MILANO', 'WINDTRE.IT SHOP MILANO')
  AND t.merchant NOT LIKE 'TERENZIANI%';

-- 小曹个人项: VIVIENNE WESTWOOD + WINDTRE → 只他自己 100%
INSERT INTO participants (transaction_id, person_id, share_ratio)
SELECT t.id, (SELECT id FROM people WHERE name='小曹'), 1.0
FROM transactions_v2 t
WHERE t.source='chase_cc'
  AND t.merchant IN ('VIVIENNE WESTWOOD MILANO', 'WINDTRE.IT SHOP MILANO');

-- TERENZIANI ERIKA 两笔合并处理: 你承担 €20，剩余 (62.25+145.25-20=187.5) 归小曹
-- 第1笔 €62.25 - 全部归小曹 (因为你的 20 欧统一算到第二笔)
INSERT INTO participants (transaction_id, person_id, share_amount)
SELECT t.id, (SELECT id FROM people WHERE name='小曹'), 62.25
FROM transactions_v2 t
WHERE t.source='chase_cc' AND t.merchant='TERENZIANI ERIKA RIOMAGGIORE' AND t.amount=62.25;

-- 第2笔 €145.25: 你 €20 + 小曹 €125.25
INSERT INTO participants (transaction_id, person_id, share_amount)
SELECT t.id, (SELECT id FROM people WHERE name='我'), 20.00
FROM transactions_v2 t
WHERE t.source='chase_cc' AND t.merchant='TERENZIANI ERIKA RIOMAGGIORE' AND t.amount=145.25;

INSERT INTO participants (transaction_id, person_id, share_amount)
SELECT t.id, (SELECT id FROM people WHERE name='小曹'), 125.25
FROM transactions_v2 t
WHERE t.source='chase_cc' AND t.merchant='TERENZIANI ERIKA RIOMAGGIORE' AND t.amount=145.25;

COMMIT;

-- Verify
\echo '===== 录入校验 ====='
SELECT t.trans_date, t.merchant, t.amount,
       string_agg(p.name || ' ' ||
         COALESCE(pa.share_amount::text, ROUND(t.amount*pa.share_ratio,2)::text), ' / ') AS split
FROM transactions_v2 t
JOIN participants pa ON pa.transaction_id = t.id
JOIN people p ON p.id = pa.person_id
WHERE t.source='chase_cc'
GROUP BY t.id, t.trans_date, t.merchant, t.amount
ORDER BY t.trans_date, t.id;
