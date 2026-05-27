import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { TransactionCreate } from "@/lib/validate";
import {
  TRANSACTION_COLUMNS,
  TRANSACTION_FROM,
  TRANSACTION_GROUP,
} from "@/lib/queries";

export async function GET() {
  const { rows } = await pool.query(
    `SELECT ${TRANSACTION_COLUMNS} ${TRANSACTION_FROM} ${TRANSACTION_GROUP} ORDER BY t.trans_date, t.id`,
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const parsed = TransactionCreate.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const d = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows: txn } = await client.query(
      `INSERT INTO transactions_v2
         (trans_date, merchant, amount, currency, payer_id, category, note, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [d.trans_date, d.merchant, d.amount, d.currency, d.payer_id,
       d.category ?? null, d.note ?? null, d.source],
    );
    const txnId = txn[0].id;

    for (const p of d.participants) {
      await client.query(
        `INSERT INTO participants (transaction_id, person_id, share_amount, share_ratio)
         VALUES ($1,$2,$3,$4)`,
        [txnId, p.person_id, p.share_amount ?? null, p.share_ratio ?? null],
      );
    }
    await client.query("COMMIT");

    const { rows } = await pool.query(
      `SELECT ${TRANSACTION_COLUMNS} ${TRANSACTION_FROM} WHERE t.id = $1 ${TRANSACTION_GROUP}`,
      [txnId],
    );
    return NextResponse.json(rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    client.release();
  }
}
