"use client";

import { useEffect, useMemo, useState } from "react";
import type { Transaction } from "@/lib/db";

const CATEGORIES = [
  "餐饮", "交通", "住宿", "景点门票", "购物",
  "行李寄存", "通讯", "取现", "手续费", "其他",
];

export default function Home() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/transactions")
      .then((r) => r.json())
      .then((data) => {
        setTxns(data);
        setLoading(false);
      });
  }, []);

  async function addCaoTxn() {
    const date = prompt("日期 YYYY-MM-DD", "2026-05-15");
    if (!date) return;
    const merchant = prompt("商户/描述");
    if (!merchant) return;
    const amount = prompt("金额 (RMB)");
    if (!amount) return;
    const r = await fetch("/api/transactions/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trans_date: date,
        merchant,
        rmb_amount: Number(amount),
        paid_by: "cao",
        is_shared: true,
        share_count: 2,
      }),
    });
    const created = await r.json();
    setTxns((prev) => [...prev, created].sort((a, b) =>
      a.trans_date.localeCompare(b.trans_date),
    ));
  }

  async function update(id: number, patch: Partial<Transaction>) {
    setSavingId(id);
    const r = await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const updated = await r.json();
    setTxns((prev) => prev.map((t) => (t.id === id ? updated : t)));
    setSavingId(null);
  }

  // 按币种分别汇总；不做汇率换算
  const summary = useMemo(() => {
    type Bucket = { total: number; iPaid: number; caoPaid: number; caoOwesMe: number; iOweCao: number };
    const buckets: Record<string, Bucket> = {};
    const ensure = (c: string) =>
      (buckets[c] ??= { total: 0, iPaid: 0, caoPaid: 0, caoOwesMe: 0, iOweCao: 0 });

    for (const t of txns) {
      if (t.status === "cancelled") continue;
      const cur = t.original_currency || "CNY";
      const amt = Number(t.original_amount ?? t.rmb_amount);
      const b = ensure(cur);
      b.total += amt;
      if (t.paid_by === "cao") b.caoPaid += amt;
      else b.iPaid += amt;
      if (t.is_shared) {
        const n = t.share_count || 1;
        if (t.paid_by === "cao") b.iOweCao += amt / n;
        else b.caoOwesMe += (amt / n) * (n - 1);
      }
    }
    return buckets;
  }, [txns]);

  if (loading) return <div className="p-8 text-gray-500">加载中…</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6 text-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">🇮🇹 意大利账单</h1>
          <button
            onClick={addCaoTxn}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow"
          >
            + 添加小曹账单
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">5/13 – 5/23 · 与小曹同行</p>

        <div className="space-y-4 mb-6">
          {Object.entries(summary).map(([cur, b]) => {
            const net = b.caoOwesMe - b.iOweCao;
            return (
              <div key={cur} className="bg-white rounded-lg shadow p-4">
                <div className="text-sm font-semibold mb-3 text-gray-700">
                  {currencyLabel(cur)} 结算
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <Card label="总花费" value={b.total} currency={cur} />
                  <Card label="我已付" value={b.iPaid} currency={cur} />
                  <Card label="小曹已付" value={b.caoPaid} currency={cur} />
                  <Card label="小曹该分摊" value={b.caoOwesMe} currency={cur} />
                  <Card
                    label={net >= 0 ? "小曹应付我" : "我应付小曹"}
                    value={Math.abs(net)}
                    currency={cur}
                    highlight
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left">日期</th>
                <th className="px-3 py-2 text-left">商户</th>
                <th className="px-3 py-2 text-right">原始</th>
                <th className="px-3 py-2 text-right">RMB</th>
                <th className="px-3 py-2 text-center">付款人</th>
                <th className="px-3 py-2 text-left">分类</th>
                <th className="px-3 py-2 text-center">分摊</th>
                <th className="px-3 py-2 text-center">人数</th>
                <th className="px-3 py-2 text-right">我承担</th>
                <th className="px-3 py-2 text-left">备注</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr
                  key={t.id}
                  className={`border-t hover:bg-gray-50 ${
                    t.status === "cancelled" ? "opacity-40 line-through" : ""
                  } ${t.status === "missed" ? "bg-amber-50" : ""}`}
                >
                  <td className="px-3 py-2 whitespace-nowrap text-gray-500">{t.trans_date}</td>
                  <td className="px-3 py-2 font-mono text-xs">{t.merchant}</td>
                  <td className="px-3 py-2 text-right font-semibold whitespace-nowrap">
                    {t.original_amount
                      ? `${currencySymbol(t.original_currency)}${Number(t.original_amount).toFixed(2)}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-500 text-xs whitespace-nowrap">
                    ¥{Number(t.rmb_amount).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <select
                      className={`border rounded px-2 py-1 text-xs ${
                        t.paid_by === "cao" ? "bg-blue-50" : "bg-white"
                      }`}
                      value={t.paid_by}
                      onChange={(e) => update(t.id, { paid_by: e.target.value })}
                    >
                      <option value="me">我</option>
                      <option value="cao">小曹</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className="border rounded px-2 py-1 text-xs bg-white"
                      value={t.category ?? ""}
                      onChange={(e) => update(t.id, { category: e.target.value })}
                    >
                      <option value="">—</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={t.is_shared}
                      onChange={(e) => update(t.id, { is_shared: e.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      className="w-14 border rounded px-1 py-1 text-xs text-center"
                      value={t.share_count}
                      onChange={(e) => update(t.id, { share_count: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-gray-700">
                    ¥{t.my_share ? Number(t.my_share).toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      defaultValue={t.note ?? ""}
                      onBlur={(e) => {
                        if (e.target.value !== (t.note ?? ""))
                          update(t.id, { note: e.target.value });
                      }}
                      className="w-full border rounded px-2 py-1 text-xs"
                    />
                    {savingId === t.id && (
                      <span className="ml-1 text-xs text-blue-500">保存中…</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Card({
  label,
  value,
  currency,
  highlight,
}: {
  label: string;
  value: number;
  currency: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-4 ${
        highlight ? "bg-emerald-600 text-white" : "bg-gray-50"
      }`}
    >
      <div className={`text-xs ${highlight ? "text-emerald-100" : "text-gray-500"}`}>
        {label}
      </div>
      <div className="text-xl font-bold mt-1">
        {currencySymbol(currency)}
        {value.toFixed(2)}
      </div>
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

function currencyLabel(c: string): string {
  switch (c) {
    case "EUR": return "🇪🇺 欧元 EUR";
    case "CNY": return "🇨🇳 人民币 CNY";
    case "TRY": return "🇹🇷 土耳其里拉 TRY";
    case "USD": return "🇺🇸 美元 USD";
    default: return c;
  }
}
