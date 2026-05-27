-- v2: symmetric payer + participants model
BEGIN;

CREATE TABLE IF NOT EXISTS people (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

INSERT INTO people (name) VALUES ('我'), ('小曹')
  ON CONFLICT (name) DO NOTHING;

-- 新交易表 (transactions_v2)；保留旧表方便回滚
CREATE TABLE IF NOT EXISTS transactions_v2 (
  id SERIAL PRIMARY KEY,
  trans_date DATE NOT NULL,
  merchant TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  payer_id INT NOT NULL REFERENCES people(id),
  category TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'completed',     -- completed/cancelled/missed
  source TEXT NOT NULL DEFAULT 'manual',        -- cmb_credit_card/trip_app/manual
  segment_id INT REFERENCES trip_segments(id),
  -- 原始账单信息（如果原始就不是结算货币）
  rmb_amount NUMERIC(12, 2),                    -- 招行账单上的RMB折算，仅参考
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS participants (
  transaction_id INT NOT NULL REFERENCES transactions_v2(id) ON DELETE CASCADE,
  person_id INT NOT NULL REFERENCES people(id),
  share_amount NUMERIC(12, 2),       -- 显式指定金额（与 ratio 二选一）
  share_ratio NUMERIC(6, 4),         -- 显式指定比例 0-1
  PRIMARY KEY (transaction_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_v2_date ON transactions_v2(trans_date);
CREATE INDEX IF NOT EXISTS idx_v2_payer ON transactions_v2(payer_id);

COMMIT;
