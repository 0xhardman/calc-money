import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

export const pool =
  global.__pgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

export type Transaction = {
  id: number;
  trans_date: string;
  merchant: string;
  rmb_amount: string;
  original_amount: string | null;
  original_currency: string | null;
  country: string | null;
  txn_type: string | null;
  category: string | null;
  note: string | null;
  is_trip: boolean;
  is_shared: boolean;
  share_count: number;
  my_share: string | null;
  status: string | null;
  source: string | null;
  paid_by: string;
};
