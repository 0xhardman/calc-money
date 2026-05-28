"use client";

import { useEffect, useMemo, useState } from "react";
import type { Transaction, Person } from "@/lib/db";

const CATEGORIES = [
  "餐饮", "交通", "住宿", "景点门票", "购物",
  "行李寄存", "通讯", "取现", "手续费", "其他",
];
const CURRENCIES = ["EUR", "CNY", "USD", "TRY"];

export default function Home() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<number | null>(null);
  const [hideVerified, setHideVerified] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [ratesMeta, setRatesMeta] = useState<{ fetched_at?: string; stale?: boolean }>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/transactions").then((r) => r.json()),
      fetch("/api/people").then((r) => r.json()),
      fetch("/api/rates").then((r) => r.json()),
    ]).then(([t, p, r]) => {
      setTxns(t);
      setPeople(p);
      setRates({ USD: 1, ...r.rates });
      setRatesMeta({ fetched_at: r.fetched_at, stale: r.stale });
      setLoading(false);
    });
  }, []);

  // 任意币种 -> USD
  function toUSD(amount: number, currency: string): number {
    if (currency === "USD") return amount;
    const r = rates[currency];
    if (!r) return amount; // 汇率未取到时按 1:1，避免 NaN
    return amount / r; // rates 是 1 USD = x foreign
  }

  async function patch(id: number, body: object) {
    const r = await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const updated = await r.json();
    setTxns((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function addEmpty() {
    const r = await fetch(`/api/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trans_date: "2026-05-15",
        merchant: "新账单",
        amount: 0.01,
        currency: "EUR",
        payer_id: people[0]?.id,
        source: "manual",
        participants: people.map((p) => ({
          person_id: p.id,
          share_ratio: 1 / people.length,
        })),
      }),
    });
    const created = await r.json();
    setTxns((prev) => [...prev, created]);
    setEditing(created.id);
  }

  async function remove(id: number) {
    if (!confirm("删除这笔账单？")) return;
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setTxns((prev) => prev.filter((t) => t.id !== id));
  }

  // 统一换算成 USD 后汇总
  const summary = useMemo(() => {
    let total = 0;
    const paid: Record<number, number> = {};
    const consumed: Record<number, number> = {};
    people.forEach((p) => { paid[p.id] = 0; consumed[p.id] = 0; });

    for (const t of txns) {
      if (t.status === "cancelled") continue;
      const usd = toUSD(Number(t.amount), t.currency);
      total += usd;
      paid[t.payer_id] = (paid[t.payer_id] ?? 0) + usd;
      for (const p of t.participants) {
        const pUSD = toUSD(Number(p.computed_share), t.currency);
        consumed[p.person_id] = (consumed[p.person_id] ?? 0) + pUSD;
      }
    }
    return { total, paid, consumed };
  }, [txns, people, rates]);

  const verifiedCount = txns.filter((t) => t.verified).length;
  const visibleTxns = hideVerified ? txns.filter((t) => !t.verified) : txns;

  if (loading) return <div className="p-8 text-gray-500">加载中…</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">🇮🇹 意大利账单</h1>
          <button
            onClick={addEmpty}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow"
          >
            + 新增账单
          </button>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <span>5/13 – 5/23 · 同行人: {people.map((p) => p.name).join(", ")}</span>
          <div className="flex items-center gap-3">
            <span>
              已核对 <span className="font-semibold text-emerald-600">{verifiedCount}</span> / {txns.length}
            </span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={hideVerified}
                onChange={(e) => setHideVerified(e.target.checked)}
              />
              隐藏已核对
            </label>
          </div>
        </div>

        <USDSettlement summary={summary} people={people} rates={rates} meta={ratesMeta} />

        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2 w-8 text-center">✓</th>
                <th className="px-3 py-2 text-left">日期</th>
                <th className="px-3 py-2 text-left">商户</th>
                <th className="px-3 py-2 text-right">金额</th>
                <th className="px-3 py-2 text-center">出账人</th>
                <th className="px-3 py-2 text-left">分摊明细</th>
                <th className="px-3 py-2 text-left">分类</th>
                <th className="px-3 py-2 text-left">备注</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {visibleTxns.map((t) => (
                <TxnRow
                  key={t.id}
                  txn={t}
                  people={people}
                  editing={editing === t.id}
                  onEdit={() => setEditing(t.id)}
                  onClose={() => setEditing(null)}
                  onPatch={(body) => patch(t.id, body)}
                  onDelete={() => remove(t.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function USDSettlement({
  summary,
  people,
  rates,
  meta,
}: {
  summary: { total: number; paid: Record<number, number>; consumed: Record<number, number> };
  people: Person[];
  rates: Record<string, number>;
  meta: { fetched_at?: string; stale?: boolean };
}) {
  const nets: Record<number, number> = {};
  people.forEach((p) => {
    nets[p.id] = (summary.paid[p.id] ?? 0) - (summary.consumed[p.id] ?? 0);
  });
  const sorted = [...people].sort((a, b) => (nets[b.id] ?? 0) - (nets[a.id] ?? 0));
  let debt: { from: string; to: string; amount: number } | null = null;
  if (people.length === 2) {
    const amt = nets[sorted[0].id] ?? 0;
    if (Math.abs(amt) > 0.01) {
      debt = { from: sorted[1].name, to: sorted[0].name, amount: Math.abs(amt) };
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-lg font-semibold">💵 USD 结算</h2>
        <div className="text-xs text-gray-400">
          汇率 1 USD = €{rates.EUR?.toFixed(4)} · ¥{rates.CNY?.toFixed(4)} · ₺{rates.TRY?.toFixed(4)}
          {meta.fetched_at && (
            <span className="ml-2">
              · {new Date(meta.fetched_at).toLocaleString()} {meta.stale && "(stale)"}
            </span>
          )}
        </div>
      </div>
      <div className="text-sm text-gray-500 mb-4">总花费 ${summary.total.toFixed(2)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {people.map((p) => {
          const paid = summary.paid[p.id] ?? 0;
          const consumed = summary.consumed[p.id] ?? 0;
          const net = paid - consumed;
          return (
            <div key={p.id} className="border rounded p-3">
              <div className="font-medium text-sm">{p.name}</div>
              <div className="text-xs text-gray-500 mt-1">
                已付 ${paid.toFixed(2)} · 消费 ${consumed.toFixed(2)}
              </div>
              <div className={`mt-1 text-base font-semibold ${net >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {net >= 0 ? "应收" : "应付"} ${Math.abs(net).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
      {debt && (
        <div className="p-3 bg-emerald-50 rounded text-sm text-emerald-700 font-medium">
          💸 {debt.from} → {debt.to}: <span className="text-lg">${debt.amount.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

function TxnRow({
  txn,
  people,
  editing,
  onEdit,
  onClose,
  onPatch,
  onDelete,
}: {
  txn: Transaction;
  people: Person[];
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onPatch: (body: object) => void;
  onDelete: () => void;
}) {
  return (
    <>
      <tr
        className={`border-t hover:bg-gray-50 ${
          txn.status === "cancelled" ? "opacity-40 line-through" : ""
        } ${txn.status === "missed" ? "bg-amber-50" : ""} ${
          txn.verified ? "bg-emerald-50/60" : ""
        }`}
      >
        <td className="px-3 py-2 text-center">
          <input
            type="checkbox"
            checked={txn.verified}
            onChange={(e) => onPatch({ verified: e.target.checked })}
            className="w-4 h-4 accent-emerald-600 cursor-pointer"
            title={
              txn.verified && txn.verified_at
                ? `已核对 ${new Date(txn.verified_at).toLocaleString()}`
                : "标记为已核对"
            }
          />
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-gray-500">{txn.trans_date}</td>
        <td className="px-3 py-2 font-mono text-xs max-w-xs truncate" title={txn.merchant}>
          {txn.merchant}
        </td>
        <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">
          {currencySymbol(txn.currency)}{Number(txn.amount).toFixed(2)}
        </td>
        <td className="px-3 py-2 text-center text-xs">
          <span className="px-2 py-1 bg-gray-100 rounded">{txn.payer_name}</span>
        </td>
        <td className="px-3 py-2 text-xs text-gray-600">
          {txn.participants
            .map((p) => `${p.person_name} ${currencySymbol(txn.currency)}${Number(p.computed_share).toFixed(2)}`)
            .join(" / ")}
        </td>
        <td className="px-3 py-2">
          <select
            className="border rounded px-2 py-1 text-xs bg-white"
            value={txn.category ?? ""}
            onChange={(e) => onPatch({ category: e.target.value || null })}
          >
            <option value="">—</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </td>
        <td className="px-3 py-2 max-w-sm">
          <input
            type="text"
            defaultValue={txn.note ?? ""}
            onBlur={(e) => {
              if (e.target.value !== (txn.note ?? "")) onPatch({ note: e.target.value });
            }}
            className="w-full border rounded px-2 py-1 text-xs"
          />
        </td>
        <td className="px-3 py-2 text-right whitespace-nowrap">
          <button
            onClick={editing ? onClose : onEdit}
            className="text-xs text-blue-600 hover:underline mr-2"
          >
            {editing ? "收起" : "详情"}
          </button>
          <button onClick={onDelete} className="text-xs text-rose-600 hover:underline">
            删除
          </button>
        </td>
      </tr>
      {editing && (
        <tr className="bg-blue-50">
          <td colSpan={9} className="px-6 py-4">
            <EditDetail txn={txn} people={people} onPatch={onPatch} />
          </td>
        </tr>
      )}
    </>
  );
}

function EditDetail({
  txn,
  people,
  onPatch,
}: {
  txn: Transaction;
  people: Person[];
  onPatch: (body: object) => void;
}) {
  type ParticipantDraft = {
    person_id: number;
    included: boolean;
    mode: "ratio" | "amount";
    share_ratio: number;
    share_amount: number;
  };
  const initParticipants: ParticipantDraft[] = people.map((p) => {
    const existing = txn.participants.find((x) => x.person_id === p.id);
    return {
      person_id: p.id,
      included: !!existing,
      mode: existing?.share_amount != null ? "amount" : "ratio",
      share_ratio: existing?.share_ratio != null ? Number(existing.share_ratio) : 0,
      share_amount: existing?.share_amount != null ? Number(existing.share_amount) : 0,
    };
  });
  const [parts, setParts] = useState<ParticipantDraft[]>(initParticipants);
  const amount = Number(txn.amount);

  function splitEqually() {
    const included = parts.filter((p) => p.included);
    const ratio = included.length ? 1 / included.length : 0;
    setParts(
      parts.map((p) =>
        p.included ? { ...p, mode: "ratio" as const, share_ratio: ratio } : p,
      ),
    );
  }

  function save() {
    const participants = parts
      .filter((p) => p.included)
      .map((p) =>
        p.mode === "amount"
          ? { person_id: p.person_id, share_amount: p.share_amount }
          : { person_id: p.person_id, share_ratio: p.share_ratio },
      );
    onPatch({ participants });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="日期">
          <input
            type="date"
            defaultValue={txn.trans_date}
            onBlur={(e) => onPatch({ trans_date: e.target.value })}
            className="border rounded px-2 py-1 text-sm w-full"
          />
        </Field>
        <Field label="金额">
          <input
            type="number"
            step="0.01"
            defaultValue={txn.amount}
            onBlur={(e) => onPatch({ amount: Number(e.target.value) })}
            className="border rounded px-2 py-1 text-sm w-full"
          />
        </Field>
        <Field label="货币">
          <select
            defaultValue={txn.currency}
            onChange={(e) => onPatch({ currency: e.target.value })}
            className="border rounded px-2 py-1 text-sm w-full"
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="出账人">
          <select
            defaultValue={txn.payer_id}
            onChange={(e) => onPatch({ payer_id: Number(e.target.value) })}
            className="border rounded px-2 py-1 text-sm w-full"
          >
            {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field label="商户">
          <input
            type="text"
            defaultValue={txn.merchant}
            onBlur={(e) => onPatch({ merchant: e.target.value })}
            className="border rounded px-2 py-1 text-sm w-full"
          />
        </Field>
        <Field label="状态">
          <select
            defaultValue={txn.status}
            onChange={(e) => onPatch({ status: e.target.value })}
            className="border rounded px-2 py-1 text-sm w-full"
          >
            <option value="completed">已完成</option>
            <option value="missed">错过</option>
            <option value="cancelled">已取消</option>
          </select>
        </Field>
      </div>

      <div className="border-t pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">分摊明细</div>
          <button
            onClick={splitEqually}
            className="text-xs text-blue-600 hover:underline"
          >
            均分
          </button>
        </div>
        <div className="space-y-2">
          {parts.map((p, i) => {
            const person = people.find((x) => x.id === p.person_id)!;
            return (
              <div key={p.person_id} className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2 w-24">
                  <input
                    type="checkbox"
                    checked={p.included}
                    onChange={(e) => {
                      const next = [...parts];
                      next[i] = { ...p, included: e.target.checked };
                      setParts(next);
                    }}
                  />
                  {person.name}
                </label>
                {p.included && (
                  <>
                    <select
                      value={p.mode}
                      onChange={(e) => {
                        const next = [...parts];
                        next[i] = { ...p, mode: e.target.value as "ratio" | "amount" };
                        setParts(next);
                      }}
                      className="border rounded px-2 py-1 text-xs"
                    >
                      <option value="ratio">按比例</option>
                      <option value="amount">按金额</option>
                    </select>
                    {p.mode === "ratio" ? (
                      <>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={p.share_ratio}
                          onChange={(e) => {
                            const next = [...parts];
                            next[i] = { ...p, share_ratio: Number(e.target.value) };
                            setParts(next);
                          }}
                          className="border rounded px-2 py-1 text-xs w-24"
                        />
                        <span className="text-xs text-gray-500">
                          = {currencySymbol(txn.currency)}{(p.share_ratio * amount).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={p.share_amount}
                        onChange={(e) => {
                          const next = [...parts];
                          next[i] = { ...p, share_amount: Number(e.target.value) };
                          setParts(next);
                        }}
                        className="border rounded px-2 py-1 text-xs w-32"
                      />
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        <button
          onClick={save}
          className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-1.5 rounded"
        >
          保存分摊
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {children}
    </div>
  );
}

function currencySymbol(c: string | null): string {
  switch (c) {
    case "EUR": return "€";
    case "CNY": return "¥";
    case "TRY": return "₺";
    case "USD": return "$";
    default: return c ? c + " " : "";
  }
}

