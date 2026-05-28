import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const CACHE_TTL_HOURS = 6;
const BASE = "USD";
const SYMBOLS = ["EUR", "CNY", "TRY"];

type RateRow = { target: string; rate: string; fetched_at: string };

export async function GET() {
  // Return cached rates if fresh
  const { rows } = await pool.query<RateRow>(
    `SELECT target, rate, fetched_at FROM exchange_rates WHERE base = $1`,
    [BASE],
  );

  const fresh = rows.length > 0 &&
    Date.now() - new Date(rows[0].fetched_at).getTime() < CACHE_TTL_HOURS * 3600 * 1000;

  if (fresh) {
    return NextResponse.json({
      base: BASE,
      rates: Object.fromEntries(rows.map((r) => [r.target, Number(r.rate)])),
      fetched_at: rows[0].fetched_at,
      cached: true,
    });
  }

  // Fetch fresh from Frankfurter
  try {
    const url = `https://api.frankfurter.dev/v1/latest?base=${BASE}&symbols=${SYMBOLS.join(",")}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
    const data: { base: string; date: string; rates: Record<string, number> } = await res.json();

    for (const [target, rate] of Object.entries(data.rates)) {
      await pool.query(
        `INSERT INTO exchange_rates (base, target, rate, fetched_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (base, target) DO UPDATE
         SET rate = EXCLUDED.rate, fetched_at = EXCLUDED.fetched_at`,
        [BASE, target, rate],
      );
    }

    return NextResponse.json({
      base: BASE,
      rates: data.rates,
      fetched_at: new Date().toISOString(),
      cached: false,
      api_date: data.date,
    });
  } catch (e) {
    // Fall back to stale cache if available
    if (rows.length > 0) {
      return NextResponse.json({
        base: BASE,
        rates: Object.fromEntries(rows.map((r) => [r.target, Number(r.rate)])),
        fetched_at: rows[0].fetched_at,
        cached: true,
        stale: true,
        error: String(e),
      });
    }
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
