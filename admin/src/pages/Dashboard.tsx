import { useQuery } from "@tanstack/react-query";
import {
  Users as UsersIcon, FileCheck2, ArrowDownToLine, ArrowUpFromLine,
  MessageCircle, Activity, DollarSign,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { api } from "../lib/api";
import { fmtNumber, fmtUsd, fmtDate } from "../lib/utils";
import { Card, CardBody, CardHeader, CardTitle, Loading, StatCard, Table, Th, Td, Badge, statusTone } from "../components/ui";
import PageHeader from "../components/layout/PageHeader";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/admin/dashboard/dashboard")).data,
  });
  const { data: series } = useQuery({
    queryKey: ["dashboard-timeseries"],
    queryFn: async () => (await api.get("/admin/dashboard/timeseries?days=14")).data,
  });

  if (isLoading || !data) return <div className="p-8"><Loading /></div>;

  const c = data.counters;
  const v = data.volumes;

  return (
    <div className="p-8">
      <PageHeader title="Dashboard" description="Platform overview at a glance" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total users" value={fmtNumber(c.userCount, 0)} hint={`+${c.newUsersToday} today`} />
        <StatCard label="Active users" value={fmtNumber(c.activeUserCount, 0)} hint={`${c.newUsersWeek} new this week`} />
        <StatCard label="KYC pending" value={c.pendingKyc} accent={c.pendingKyc > 0 ? "text-yellow-400" : ""} />
        <StatCard label="Open tickets" value={c.openTickets} accent={c.openTickets > 0 ? "text-blue-400" : ""} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Pending deposits" value={c.pendingDeposits} accent={c.pendingDeposits > 0 ? "text-yellow-400" : ""} />
        <StatCard label="Pending withdrawals" value={c.pendingWithdrawals} accent={c.pendingWithdrawals > 0 ? "text-yellow-400" : ""} />
        <StatCard label="Platform liability" value={fmtUsd(v.totalPlatformUsd)} hint="sum of all user balances" />
      </div>

      {/* ── Activity chart ───────────────────────────────────── */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Activity (last 14 days)</CardTitle></CardHeader>
        <CardBody>
          {series && (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={series} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="users" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#262a36" vertical={false} />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                  <YAxis stroke="#6b7280" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#12141a", border: "1px solid #262a36", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="users" stroke="#22c55e" fill="url(#users)" strokeWidth={2} name="New users" />
                  <Area type="monotone" dataKey="deposits" stroke="#3b82f6" fill="transparent" strokeWidth={2} name="Deposits" />
                  <Area type="monotone" dataKey="withdrawals" stroke="#ef4444" fill="transparent" strokeWidth={2} name="Withdrawals" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Recent activity grid ─────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Recent deposits</CardTitle></CardHeader>
          <Table>
            <thead>
              <tr><Th>User</Th><Th>Amount</Th><Th>Status</Th><Th>When</Th></tr>
            </thead>
            <tbody>
              {data.recent.deposits.map((d: any) => (
                <tr key={d.id}>
                  <Td><Link to={`/users/${d.userId}`} className="hover:underline">{d.user?.username || d.user?.email}</Link></Td>
                  <Td>{fmtNumber(d.amount, 4)} {d.currencySymbol}</Td>
                  <Td><Badge tone={statusTone(d.status)}>{d.status}</Badge></Td>
                  <Td className="text-muted text-xs">{fmtDate(d.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent withdrawals</CardTitle></CardHeader>
          <Table>
            <thead>
              <tr><Th>User</Th><Th>Amount</Th><Th>Status</Th><Th>When</Th></tr>
            </thead>
            <tbody>
              {data.recent.withdrawals.map((w: any) => (
                <tr key={w.id}>
                  <Td><Link to={`/users/${w.userId}`} className="hover:underline">{w.user?.username || w.user?.email}</Link></Td>
                  <Td>{fmtNumber(w.amount, 4)} {w.currencySymbol}</Td>
                  <Td><Badge tone={statusTone(w.status)}>{w.status}</Badge></Td>
                  <Td className="text-muted text-xs">{fmtDate(w.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent signups</CardTitle></CardHeader>
          <Table>
            <thead>
              <tr><Th>User</Th><Th>Email</Th><Th>Country</Th><Th>Status</Th><Th>Joined</Th></tr>
            </thead>
            <tbody>
              {data.recent.users.map((u: any) => (
                <tr key={u.id}>
                  <Td><Link to={`/users/${u.id}`} className="hover:underline">{u.username || "—"}</Link></Td>
                  <Td className="text-muted">{u.email || "—"}</Td>
                  <Td className="text-muted">{u.country || "—"}</Td>
                  <Td><Badge tone={statusTone(u.status)}>{u.status}</Badge></Td>
                  <Td className="text-muted text-xs">{fmtDate(u.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
