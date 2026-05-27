-- Migrate data from v1 transactions to v2
BEGIN;

TRUNCATE participants, transactions_v2 RESTART IDENTITY CASCADE;

-- Copy transactions
INSERT INTO transactions_v2
  (id, trans_date, merchant, amount, currency, payer_id,
   category, note, status, source, segment_id, rmb_amount)
SELECT
  t.id,
  t.trans_date,
  t.merchant,
  COALESCE(t.original_amount, t.rmb_amount) AS amount,
  COALESCE(t.original_currency, 'CNY') AS currency,
  (SELECT id FROM people WHERE name = CASE WHEN t.paid_by = 'cao' THEN '小曹' ELSE '我' END),
  t.category,
  t.note,
  COALESCE(t.status, 'completed'),
  COALESCE(t.source, 'cmb_credit_card'),
  t.segment_id,
  t.rmb_amount
FROM transactions t
WHERE t.is_trip = TRUE;

-- Reset sequence
SELECT setval('transactions_v2_id_seq', (SELECT MAX(id) FROM transactions_v2));

-- Create participants:
--   - is_shared=FALSE  -> participants = [payer] only
--   - is_shared=TRUE, share_count=2 -> participants = [我, 小曹] 均分
--   - share_count>2 -> 暂时按均分到所有 people（目前只有2人，与上一行等效）
INSERT INTO participants (transaction_id, person_id, share_ratio)
SELECT t.id, p.id,
       CASE WHEN t.is_shared THEN 1.0 / t.share_count ELSE 1.0 END
FROM transactions t
JOIN people p ON
  (NOT t.is_shared AND p.name = CASE WHEN t.paid_by = 'cao' THEN '小曹' ELSE '我' END)
  OR (t.is_shared)   -- 所有 people 都参与（目前 = 我 + 小曹）
WHERE t.is_trip = TRUE;

COMMIT;

-- Verify
SELECT 'transactions_v2' AS tbl, COUNT(*) FROM transactions_v2
UNION ALL
SELECT 'participants', COUNT(*) FROM participants;
