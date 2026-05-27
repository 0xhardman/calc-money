// Shared SQL helpers
export const TRANSACTION_COLUMNS = `
  t.id,
  to_char(t.trans_date, 'YYYY-MM-DD') AS trans_date,
  t.merchant, t.amount, t.currency, t.category, t.note,
  t.status, t.source, t.rmb_amount,
  t.payer_id, payer.name AS payer_name,
  COALESCE(
    json_agg(
      json_build_object(
        'person_id', p.id,
        'person_name', p.name,
        'share_amount', pa.share_amount,
        'share_ratio', pa.share_ratio,
        'computed_share',
          CASE
            WHEN pa.share_amount IS NOT NULL THEN pa.share_amount
            ELSE ROUND(t.amount * COALESCE(pa.share_ratio, 0), 2)
          END
      )
      ORDER BY p.id
    ) FILTER (WHERE p.id IS NOT NULL),
    '[]'
  ) AS participants
`;

export const TRANSACTION_FROM = `
  FROM transactions_v2 t
  JOIN people payer ON payer.id = t.payer_id
  LEFT JOIN participants pa ON pa.transaction_id = t.id
  LEFT JOIN people p ON p.id = pa.person_id
`;

export const TRANSACTION_GROUP = `GROUP BY t.id, payer.name`;
