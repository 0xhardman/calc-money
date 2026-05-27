import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  const b = await req.json();
  const { rows } = await pool.query(
    `INSERT INTO transactions
       (trans_date, merchant, rmb_amount, category, note,
        is_trip, is_shared, share_count, paid_by, status, source, my_share)
     VALUES ($1,$2,$3,$4,$5,TRUE,$6,$7,$8,'completed','manual',
        ROUND($3::numeric / $7, 2))
     RETURNING id, to_char(trans_date,'YYYY-MM-DD') AS trans_date, merchant,
               rmb_amount, original_amount, original_currency, country, txn_type,
               category, note, is_trip, is_shared, share_count, my_share, status, source, paid_by`,
    [
      b.trans_date,
      b.merchant,
      b.rmb_amount,
      b.category ?? null,
      b.note ?? null,
      b.is_shared ?? true,
      b.share_count ?? 2,
      b.paid_by ?? "cao",
    ],
  );
  return NextResponse.json(rows[0]);
}
