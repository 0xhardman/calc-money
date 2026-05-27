import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { category, note, is_shared, share_count, paid_by, status } = body;

  const { rows } = await pool.query(
    `UPDATE transactions
     SET category = COALESCE($1, category),
         note = COALESCE($2, note),
         is_shared = COALESCE($3, is_shared),
         share_count = COALESCE($4, share_count),
         paid_by = COALESCE($5, paid_by),
         status = COALESCE($6, status),
         my_share = ROUND(rmb_amount::numeric / COALESCE($4, share_count), 2)
     WHERE id = $7
     RETURNING id, to_char(trans_date,'YYYY-MM-DD') AS trans_date, merchant,
               rmb_amount, original_amount, original_currency, country, txn_type,
               category, note, is_trip, is_shared, share_count, my_share, status, source, paid_by`,
    [category, note, is_shared, share_count, paid_by, status, Number(id)]
  );

  if (!rows[0]) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}
