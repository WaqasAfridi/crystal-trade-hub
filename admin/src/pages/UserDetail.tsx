import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, Wallet as WalletIcon, Mail, Phone, MapPin, Calendar, Globe } from "lucide-react";
import { api } from "../lib/api";
import { fmtNumber, fmtUsd, fmtDate, truncate } from "../lib/utils";
import {
  Card, CardHeader, CardTitle, CardBody, Loading, Badge, statusTone, Button,
  Input, Label, Select, Modal, Table, Th, Td, EmptyState,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const nav = useNavigate();
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: async () => (await api.get(`/admin/users/${id}`)).data,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["user", id] });

  const updateMut = useMutation({
    mutationFn: async (body: any) => (await api.patch(`/admin/users/${id}`, body)).data,
    onSuccess: () => { toast.success("Updated"); refresh(); setEditOpen(false); },
  });

  const adjustMut = useMutation({
    mutationFn: async (body: any) => (await api.post(`/admin/users/${id}/adjust-balance`, body)).data,
    onSuccess: () => { toast.success("Balance adjusted"); refresh(); setAdjustOpen(false); },
  });

  const deleteMut = useMutation({
    mutationFn: async () => (await api.delete(`/admin/users/${id}`)).data,
    onSuccess: () => { toast.success("User deleted"); nav("/users"); },
  });

  if (isLoading || !data) return <div className="p-8"><Loading /></div>;

  const u = data.user;

  return (
    <div className="p-8">
      <Link to="/users" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to users
      </Link>

      <PageHeader
        title={u.username || u.email || "User"}
        description={u.id}
        actions={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(true)}>Edit</Button>
            <Button variant="success" onClick={() => setAdjustOpen(true)}>Adjust balance</Button>
            <Button variant="danger" onClick={() => {
              if (confirm("Delete this user? This is permanent.")) deleteMut.mutate();
            }}>Delete</Button>
          </>
        }
      />

      {/* ── Top stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card><CardBody>
          <div className="text-xs text-muted mb-1">Status</div>
          <Badge tone={statusTone(u.status)}>{u.status}</Badge>
        </CardBody></Card>
        <Card><CardBody>
          <div className="text-xs text-muted mb-1">VIP Level</div>
          <div className="text-2xl font-bold">{u.vipLevel}</div>
        </CardBody></Card>
        <Card><CardBody>
          <div className="text-xs text-muted mb-1">Total balance</div>
          <div className="text-2xl font-bold">{fmtUsd(data.totalUsd)}</div>
        </CardBody></Card>
        <Card><CardBody>
          <div className="text-xs text-muted mb-1">Activity</div>
          <div className="text-xs space-y-0.5">
            <div>{u._count.deposits} deposits · {u._count.withdrawals} withdrawals</div>
            <div>{u._count.spotOrders} spot · {u._count.futuresOrders} futures</div>
            <div>{u._count.invitees} invitees</div>
          </div>
        </CardBody></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Profile ───────────────────────────────────── */}
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardBody>
            <Row icon={Mail} label="Email" value={u.email || "—"} extra={u.emailVerified ? <Badge tone="success">Verified</Badge> : <Badge tone="muted">Unverified</Badge>} />
            <Row icon={Phone} label="Phone" value={u.phone || "—"} extra={u.phoneVerified ? <Badge tone="success">Verified</Badge> : <Badge tone="muted">Unverified</Badge>} />
            <Row icon={MapPin} label="Country" value={u.country || "—"} />
            <Row icon={Globe} label="Language" value={u.language || "en"} />
            <Row icon={Calendar} label="Joined" value={fmtDate(u.createdAt)} />
            <Row icon={Calendar} label="Last login" value={fmtDate(u.lastLoginAt)} extra={u.lastLoginIp && <span className="text-xs text-muted">{u.lastLoginIp}</span>} />
            <Row label="Invite code" value={<code className="font-mono">{u.inviteCode}</code>} />
            <Row label="Invited by" value={u.invitedBy ? (
              <Link to={`/users/${u.invitedBy.id}`} className="hover:underline">{u.invitedBy.username || u.invitedBy.email}</Link>
            ) : "—"} />
            <Row label="2FA" value={u.twoFactorEnabled ? <Badge tone="success">Enabled</Badge> : <Badge tone="muted">Disabled</Badge>} />
          </CardBody>
        </Card>

        {/* ── KYC ───────────────────────────────────────── */}
        <Card>
          <CardHeader><CardTitle>KYC</CardTitle></CardHeader>
          <CardBody>
            {u.kyc ? (
              <>
                <Row label="Status" value={<Badge tone={statusTone(u.kyc.status)}>{u.kyc.status}</Badge>} />
                <Row label="Full name" value={u.kyc.fullName} />
                <Row label="Country" value={u.kyc.country} />
                <Row label="Doc type" value={u.kyc.documentType} />
                <Row label="ID number" value={u.kyc.idNumber} />
                <Row label="Date of birth" value={fmtDate(u.kyc.dateOfBirth)} />
                {u.kyc.rejectionReason && <Row label="Rejection reason" value={u.kyc.rejectionReason} />}
                <div className="mt-3">
                  <Link to="/kyc" className="text-xs underline">View in KYC review queue →</Link>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted">User has not submitted KYC.</div>
            )}
          </CardBody>
        </Card>

        {/* ── Wallets ───────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Wallets</CardTitle></CardHeader>
          <Table>
            <thead><tr>
              <Th>Currency</Th><Th>Account</Th><Th>Balance</Th><Th>Locked</Th><Th>Total</Th><Th>USD value</Th>
            </tr></thead>
            <tbody>
              {u.wallets.map((w: any) => (
                <tr key={w.id}>
                  <Td><WalletIcon className="inline w-3.5 h-3.5 mr-2 text-muted" />{w.currency.symbol}</Td>
                  <Td><Badge tone="muted">{w.accountType}</Badge></Td>
                  <Td>{fmtNumber(w.balance, 6)}</Td>
                  <Td>{fmtNumber(w.locked, 6)}</Td>
                  <Td>{fmtNumber(w.balance + w.locked, 6)}</Td>
                  <Td>{fmtUsd((w.balance + w.locked) * (w.currency.priceUsd || 0))}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* ── Recent deposits ───────────────────────────── */}
        <Card>
          <CardHeader><CardTitle>Recent deposits</CardTitle></CardHeader>
          {data.recentDeposits.length === 0 ? <EmptyState /> : (
            <Table>
              <thead><tr><Th>Amount</Th><Th>Status</Th><Th>When</Th></tr></thead>
              <tbody>
                {data.recentDeposits.map((d: any) => (
                  <tr key={d.id}>
                    <Td>{fmtNumber(d.amount, 4)} {d.currencySymbol}</Td>
                    <Td><Badge tone={statusTone(d.status)}>{d.status}</Badge></Td>
                    <Td className="text-xs text-muted">{fmtDate(d.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        {/* ── Recent withdrawals ────────────────────────── */}
        <Card>
          <CardHeader><CardTitle>Recent withdrawals</CardTitle></CardHeader>
          {data.recentWithdrawals.length === 0 ? <EmptyState /> : (
            <Table>
              <thead><tr><Th>Amount</Th><Th>To</Th><Th>Status</Th><Th>When</Th></tr></thead>
              <tbody>
                {data.recentWithdrawals.map((w: any) => (
                  <tr key={w.id}>
                    <Td>{fmtNumber(w.amount, 4)} {w.currencySymbol}</Td>
                    <Td className="font-mono text-xs">{truncate(w.toAddress, 6)}</Td>
                    <Td><Badge tone={statusTone(w.status)}>{w.status}</Badge></Td>
                    <Td className="text-xs text-muted">{fmtDate(w.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        {/* ── Login history ─────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Recent logins</CardTitle></CardHeader>
          {data.recentLogins.length === 0 ? <EmptyState /> : (
            <Table>
              <thead><tr><Th>When</Th><Th>IP</Th><Th>User agent</Th><Th>Result</Th></tr></thead>
              <tbody>
                {data.recentLogins.map((l: any) => (
                  <tr key={l.id}>
                    <Td className="text-xs text-muted">{fmtDate(l.createdAt)}</Td>
                    <Td className="font-mono text-xs">{l.ip || "—"}</Td>
                    <Td className="text-xs text-muted truncate max-w-md">{l.userAgent || "—"}</Td>
                    <Td><Badge tone={l.success ? "success" : "danger"}>{l.success ? "OK" : "FAIL"}</Badge></Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      {/* ── Edit modal ────────────────────────────────── */}
      <EditUserModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        user={u}
        onSubmit={(body) => updateMut.mutate(body)}
        loading={updateMut.isPending}
      />

      {/* ── Adjust balance modal ──────────────────────── */}
      <AdjustBalanceModal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        wallets={u.wallets}
        onSubmit={(body) => adjustMut.mutate(body)}
        loading={adjustMut.isPending}
      />
    </div>
  );
}

const Row = ({ icon: Icon, label, value, extra }: any) => (
  <div className="flex items-start justify-between py-2 border-b border-border/50 last:border-0 gap-3">
    <div className="flex items-center gap-2 text-xs text-muted shrink-0 w-32">
      {Icon && <Icon className="w-3.5 h-3.5" />}{label}
    </div>
    <div className="text-sm text-right flex items-center gap-2 flex-wrap justify-end">
      <span>{value}</span>
      {extra}
    </div>
  </div>
);

// ── Edit user form ──────────────────────────────────────
function EditUserModal({ open, onClose, user, onSubmit, loading }: any) {
  const [form, setForm] = useState({
    status: user.status,
    vipLevel: user.vipLevel,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    password: "",
    withdrawPassword: "",
  });
  const submit = () => {
    const body: any = { ...form };
    if (!body.password) delete body.password;
    if (!body.withdrawPassword) delete body.withdrawPassword;
    onSubmit(body);
  };
  return (
    <Modal open={open} onClose={onClose} title="Edit user" size="md" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={submit} loading={loading}>Save</Button>
      </>
    }>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Status</Label>
          <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>ACTIVE</option><option>SUSPENDED</option><option>BANNED</option><option>PENDING_VERIFICATION</option>
          </Select>
        </div>
        <div>
          <Label>VIP Level</Label>
          <Input type="number" min="0" max="20" value={form.vipLevel} onChange={(e) => setForm({ ...form, vipLevel: parseInt(e.target.value || "0") })} />
        </div>
        <div className="col-span-2 flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.emailVerified} onChange={(e) => setForm({ ...form, emailVerified: e.target.checked })} />
            Email verified
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.phoneVerified} onChange={(e) => setForm({ ...form, phoneVerified: e.target.checked })} />
            Phone verified
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.twoFactorEnabled} onChange={(e) => setForm({ ...form, twoFactorEnabled: e.target.checked })} />
            2FA enabled
          </label>
        </div>
        <div className="col-span-2">
          <Label>Reset login password (leave empty to skip)</Label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 chars" />
        </div>
        <div className="col-span-2">
          <Label>Reset withdraw password (leave empty to skip)</Label>
          <Input type="password" value={form.withdrawPassword} onChange={(e) => setForm({ ...form, withdrawPassword: e.target.value })} placeholder="At least 6 chars" />
        </div>
      </div>
    </Modal>
  );
}

// ── Adjust balance form ─────────────────────────────────
function AdjustBalanceModal({ open, onClose, wallets, onSubmit, loading }: any) {
  const symbols: string[] = Array.from(new Set(wallets.map((w: any) => w.currency.symbol)));
  const [currencySymbol, setCurrencySymbol] = useState(symbols[0] || "USDT");
  const [accountType, setAccountType] = useState("SPOT");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Adjust balance" size="md" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSubmit({ currencySymbol, accountType, amount: parseFloat(amount), reason })} loading={loading}>Apply</Button>
      </>
    }>
      <p className="text-xs text-muted mb-4">Use a positive number to credit, negative to debit. The user will get a notification.</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Currency</Label>
          <Select value={currencySymbol} onChange={(e) => setCurrencySymbol(e.target.value)}>
            {symbols.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
        <div>
          <Label>Account</Label>
          <Select value={accountType} onChange={(e) => setAccountType(e.target.value)}>
            <option>SPOT</option><option>FUTURES</option><option>EARN</option><option>FUNDING</option>
          </Select>
        </div>
        <div className="col-span-2">
          <Label>Amount (use a minus sign for debits)</Label>
          <Input type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100 or -50" />
        </div>
        <div className="col-span-2">
          <Label>Reason (visible to the user)</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., promo bonus / chargeback" />
        </div>
      </div>
    </Modal>
  );
}
