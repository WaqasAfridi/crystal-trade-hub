import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { fmtNumber, fmtDate } from "../lib/utils";
import { Card, CardHeader, CardTitle, Loading, Table, Th, Td, Badge, statusTone, EmptyState, Input } from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

export default function Transactions() {
  const [userId, setUserId] = useState("");
  const [debounce, setDebounce] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["transactions", debounce],
    queryFn: async () => (await api.get("/admin/finance-ops/transactions", { params: { userId: debounce, limit: 100 } })).data,
  });

  return (
    <div className="p-8">
      <PageHeader title="Transactions" description="Unified ledger across all transaction types" />

      <Card className="mb-4"><div className="p-4">
        <Input placeholder="Filter by user ID (optional)" value={userId}
          onChange={(e) => setUserId(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") setDebounce(userId); }} />
      </div></Card>

      {isLoading ? <Loading /> : !data ? <EmptyState /> : (
        <div className="grid lg:grid-cols-2 gap-6">
          <Section title="Deposits" rows={data.deposits} cols={[
            { label: "Amount", render: (r: any) => `${fmtNumber(r.amount, 4)} ${r.currencySymbol}` },
            { label: "Status", render: (r: any) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
            { label: "When", render: (r: any) => <span className="text-xs text-muted">{fmtDate(r.createdAt)}</span> },
          ]} />
          <Section title="Withdrawals" rows={data.withdrawals} cols={[
            { label: "Amount", render: (r: any) => `${fmtNumber(r.amount, 4)} ${r.currencySymbol}` },
            { label: "Net", render: (r: any) => fmtNumber(r.netAmount, 4) },
            { label: "Status", render: (r: any) => <Badge tone={statusTone(r.status)}>{r.status}</Badge> },
            { label: "When", render: (r: any) => <span className="text-xs text-muted">{fmtDate(r.createdAt)}</span> },
          ]} />
          <Section title="Transfers" rows={data.transfers} cols={[
            { label: "Amount", render: (r: any) => `${fmtNumber(r.amount, 4)} ${r.currencySymbol}` },
            { label: "From → To", render: (r: any) => `${r.fromAccount} → ${r.toAccount}` },
            { label: "When", render: (r: any) => <span className="text-xs text-muted">{fmtDate(r.createdAt)}</span> },
          ]} />
          <Section title="Conversions" rows={data.conversions} cols={[
            { label: "Pair", render: (r: any) => `${r.fromSymbol} → ${r.toSymbol}` },
            { label: "Amount", render: (r: any) => `${fmtNumber(r.fromAmount, 4)} → ${fmtNumber(r.toAmount, 4)}` },
            { label: "Rate", render: (r: any) => fmtNumber(r.rate, 6) },
            { label: "When", render: (r: any) => <span className="text-xs text-muted">{fmtDate(r.createdAt)}</span> },
          ]} />
          <Section title="Trades" rows={data.trades} cols={[
            { label: "Pair", render: (r: any) => r.pair },
            { label: "Side", render: (r: any) => <Badge tone={r.side === "BUY" ? "success" : "danger"}>{r.side}</Badge> },
            { label: "Price", render: (r: any) => fmtNumber(r.price, 4) },
            { label: "Amount", render: (r: any) => fmtNumber(r.amount, 6) },
            { label: "When", render: (r: any) => <span className="text-xs text-muted">{fmtDate(r.createdAt)}</span> },
          ]} />
        </div>
      )}
    </div>
  );
}

function Section({ title, rows, cols }: { title: string; rows: any[]; cols: { label: string; render: (r: any) => any }[] }) {
  return (
    <Card>
      <CardHeader><CardTitle>{title} <span className="text-xs text-muted ml-2">({rows.length})</span></CardTitle></CardHeader>
      {rows.length === 0 ? <EmptyState /> : (
        <Table>
          <thead><tr>{cols.map((c) => <Th key={c.label}>{c.label}</Th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id || i}>
                {cols.map((c) => <Td key={c.label}>{c.render(r)}</Td>)}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}
