import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

export const pool =
  global.__pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

export type Person = { id: number; name: string };

export type Participant = {
  person_id: number;
  person_name: string;
  share_amount: string | null;
  share_ratio: string | null;
  computed_share: string; // 实际分摊金额（系统算）
};

export type Transaction = {
  id: number;
  trans_date: string;
  merchant: string;
  amount: string;
  currency: string;
  payer_id: number;
  payer_name: string;
  category: string | null;
  note: string | null;
  status: string;
  source: string;
  rmb_amount: string | null;
  participants: Participant[];
};
