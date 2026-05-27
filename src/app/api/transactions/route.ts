import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(
    `SELECT id, to_char(trans_date,'YYYY-MM-DD') AS trans_date, merchant,
            rmb_amount, original_amount, original_currency, country, txn_type,
            category, note, is_trip, is_shared, share_count, my_share, status, source, paid_by
     FROM transactions
     WHERE is_trip = TRUE
     ORDER BY trans_date, id`
  );
  return NextResponse.json(rows);
}
