import { z } from "zod";

export const ParticipantInput = z.object({
  person_id: z.number().int().positive(),
  share_amount: z.number().nonnegative().nullable().optional(),
  share_ratio: z.number().min(0).max(1).nullable().optional(),
});

export const TransactionPatch = z.object({
  trans_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  merchant: z.string().min(1).max(200).optional(),
  amount: z.number().positive().optional(),
  currency: z.enum(["CNY", "EUR", "USD", "TRY"]).optional(),
  payer_id: z.number().int().positive().optional(),
  category: z.string().max(50).nullable().optional(),
  note: z.string().max(500).nullable().optional(),
  status: z.enum(["completed", "cancelled", "missed"]).optional(),
  verified: z.boolean().optional(),
  participants: z.array(ParticipantInput).optional(),
});

export const TransactionCreate = z.object({
  trans_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  merchant: z.string().min(1).max(200),
  amount: z.number().positive(),
  currency: z.enum(["CNY", "EUR", "USD", "TRY"]).default("CNY"),
  payer_id: z.number().int().positive(),
  category: z.string().max(50).optional(),
  note: z.string().max(500).optional(),
  source: z.enum(["cmb_credit_card", "trip_app", "manual"]).default("manual"),
  participants: z.array(ParticipantInput).min(1),
});
