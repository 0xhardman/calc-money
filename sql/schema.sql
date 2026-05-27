DROP TABLE IF EXISTS transactions;

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    trans_date DATE NOT NULL,
    post_date DATE,
    merchant TEXT NOT NULL,
    rmb_amount NUMERIC(10, 2) NOT NULL,
    original_amount NUMERIC(10, 2),
    original_currency TEXT,
    country TEXT,
    card_last4 TEXT,
    statement_month TEXT,
    txn_type TEXT,
    -- annotation fields
    category TEXT,
    note TEXT,
    is_trip BOOLEAN DEFAULT FALSE,
    is_shared BOOLEAN DEFAULT FALSE,
    share_count INT DEFAULT 1,
    my_share NUMERIC(10, 2)
);

CREATE INDEX idx_trans_date ON transactions(trans_date);
CREATE INDEX idx_is_trip ON transactions(is_trip);
