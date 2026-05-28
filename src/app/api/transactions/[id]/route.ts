import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { TransactionPatch } from "@/lib/validate";
import {
  TRANSACTION_COLUMNS,
  TRANSACTION_FROM,
  TRANSACTION_GROUP,
} from "@/lib/queries";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const txnId = Number(id);
  if (!Number.isInteger(txnId) || txnId <= 0) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  const parsed = TransactionPatch.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }
  const d = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Update transaction columns (only the ones provided)
    const setExprs: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    for (const key of [
      "trans_date", "merchant", "amount", "currency", "payer_id",
      "category", "note", "status",
    ] as const) {
      if (d[key] !== undefined) {
        setExprs.push(`${key} = $${i++}`);
        vals.push(d[key]);
      }
    }
    if (d.verified !== undefined) {
      setExprs.push(`verified = $${i++}`);
      vals.push(d.verified);
      setExprs.push(`verified_at = ${d.verified ? "NOW()" : "NULL"}`);
    }
    if (setExprs.length) {
      vals.push(txnId);
      await client.query(
        `UPDATE transactions_v2 SET ${setExprs.join(", ")} WHERE id = $${i}`,
        vals,
      );
    }

    // Replace participants if provided
    if (d.participants) {
      await client.query(`DELETE FROM participants WHERE transaction_id = $1`, [txnId]);
      for (const p of d.participants) {
        await client.query(
          `INSERT INTO participants (transaction_id, person_id, share_amount, share_ratio)
           VALUES ($1,$2,$3,$4)`,
          [txnId, p.person_id, p.share_amount ?? null, p.share_ratio ?? null],
        );
      }
    }

    await client.query("COMMIT");

    const { rows } = await pool.query(
      `SELECT ${TRANSACTION_COLUMNS} ${TRANSACTION_FROM} WHERE t.id = $1 ${TRANSACTION_GROUP}`,
      [txnId],
    );
    if (!rows[0]) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    return NextResponse.json({ error: String(e) }, { status: 500 });
  } finally {
    client.release();
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const txnId = Number(id);
  if (!Number.isInteger(txnId) || txnId <= 0) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }
  await pool.query(`DELETE FROM transactions_v2 WHERE id = $1`, [txnId]);
  return NextResponse.json({ ok: true });
}
