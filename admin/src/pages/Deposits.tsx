import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Eye, Download, CheckCircle, XCircle } from "lucide-react";
import { api } from "../lib/api";
import { fmtNumber, fmtDate, truncate } from "../lib/utils";
import {
  Card, Loading, EmptyState, Table, Th, Td, Badge, statusTone,
  Button, Select, Input, Modal, Label, Textarea,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

// ── Parse voucherUrl stored as JSON inside the notes field ─────────────────
function parseNotes(raw: string | null | undefined): { notes?: string; voucherUrl?: string } {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return parsed;
    return { notes: raw };
  } catch {
    return { notes: raw };
  }
}

// ── Detail row helper ──────────────────────────────────────────────────────
function DetailRow({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted">{label}</span>
      <span className={`text-sm break-all ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export default function Deposits() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const qc = useQueryClient();

  // ── Modal state ──────────────────────────────────────────────────────────
  const [viewTarget, setViewTarget] = useState<any>(null);       // detail modal
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [overrideAmount, setOverrideAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [reason, setReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["deposits", page, status, search],
    queryFn: async () => {
      const params: any = { page, pageSize: 25 };
      if (status) params.status = status;
      if (search) params.search = search;
      return (await api.get("/admin/finance-ops/deposits", { params })).data;
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  const closeAction = () => { setAction(null); setOverrideAmount(""); setTxHash(""); setReason(""); };
  const closeAll = () => { setViewTarget(null); closeAction(); };

  const openView = (d: any) => {
    setViewTarget(d);
    setOverrideAmount(String(d.amount));
    setTxHash(d.txHash || "");
  };

  const approveMut = useMutation({
    mutationFn: async () => (await api.post(`/admin/finance-ops/deposits/${viewTarget.id}/approve`, {
      ...(overrideAmount ? { amount: parseFloat(overrideAmount) } : {}),
      ...(txHash ? { txHash } : {}),
    })).data,
    onSuccess: () => {
      toast.success("Deposit approved");
      qc.invalidateQueries({ queryKey: ["deposits"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      closeAll();
    },
  });

  const rejectMut = useMutation({
    mutationFn: async () => (await api.post(`/admin/finance-ops/deposits/${viewTarget.id}/reject`, { reason })).data,
    onSuccess: () => {
      toast.success("Deposit rejected");
      qc.invalidateQueries({ queryKey: ["deposits"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      closeAll();
    },
  });

  const canAct = (d: any) => d?.status === "PENDING" || d?.status === "PROCESSING";

  return (
    <div className="p-8">
      <PageHeader title="Deposits" description={data ? `${data.total} total` : ""} />

      <Card className="mb-4">
        <div className="p-4 flex flex-wrap gap-3">
          <Input
            className="flex-1 min-w-[260px]"
            placeholder="Search ID, tx hash, user…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
          />
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
          <Button variant="secondary" onClick={() => { setSearch(searchInput); setPage(1); }}>Search</Button>
        </div>
      </Card>

      <Card>
        {isLoading ? <Loading /> : !data?.items?.length ? <EmptyState /> : (
          <Table>
            <thead><tr>
              <Th>User</Th><Th>Amount</Th><Th>Network</Th><Th>Tx hash</Th><Th>From</Th>
              <Th>Status</Th><Th>Submitted</Th><Th></Th>
            </tr></thead>
            <tbody>
              {data.items.map((d: any) => (
                <tr key={d.id} className="hover:bg-elevated/40">
                  <Td>
                    <Link to={`/users/${d.userId}`} className="hover:underline">
                      {d.user?.username || d.user?.email}
                    </Link>
                    <div className="text-xs text-muted font-mono">{d.id.slice(0, 8)}…</div>
                  </Td>
                  <Td>{fmtNumber(d.amount, 6)} {d.currencySymbol}</Td>
                  <Td className="text-xs">{d.network || "—"}</Td>
                  <Td className="font-mono text-xs">{truncate(d.txHash || "", 8)}</Td>
                  <Td className="font-mono text-xs">{truncate(d.fromAddress || "", 8)}</Td>
                  <Td><Badge tone={statusTone(d.status)}>{d.status}</Badge></Td>
                  <Td className="text-xs text-muted">{fmtDate(d.createdAt)}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => openView(d)}>
                        <Eye className="w-3 h-3" /> View
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {data && data.total > data.pageSize && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Detail / View modal ─────────────────────────────────────────── */}
      <Modal
        open={!!viewTarget && !action}
        onClose={closeAll}
        title="Deposit Details"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={closeAll}>Close</Button>
            {canAct(viewTarget) && (
              <div className="flex gap-2">
                <Button variant="danger" onClick={() => setAction("reject")}>
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
                <Button variant="success" onClick={() => setAction("approve")}>
                  <CheckCircle className="w-4 h-4" /> Approve
                </Button>
              </div>
            )}
          </div>
        }
      >
        {viewTarget && (() => {
          const { notes, voucherUrl } = parseNotes(viewTarget.notes);
          return (
            <div className="space-y-5">
              {/* Status banner */}
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-elevated/40">
                <Badge tone={statusTone(viewTarget.status)}>{viewTarget.status}</Badge>
                <span className="text-xs text-muted">Submitted {fmtDate(viewTarget.createdAt)}</span>
                {viewTarget.reviewedAt && (
                  <span className="text-xs text-muted">· Reviewed {fmtDate(viewTarget.reviewedAt)}</span>
                )}
              </div>

              {/* Two-column grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide">Transaction</p>
                  <DetailRow label="Deposit ID" value={viewTarget.id} mono />
                  <DetailRow label="Currency" value={viewTarget.currencySymbol} />
                  <DetailRow label="Amount" value={`${fmtNumber(viewTarget.amount, 6)} ${viewTarget.currencySymbol}`} />
                  <DetailRow label="Network" value={viewTarget.network} />
                  <DetailRow label="Tx Hash" value={viewTarget.txHash} mono />
                  <DetailRow label="From Address" value={viewTarget.fromAddress} mono />
                  <DetailRow label="To Address" value={viewTarget.toAddress} mono />
                  {notes && <DetailRow label="Notes" value={notes} />}
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide">User</p>
                  <DetailRow label="Email" value={viewTarget.user?.email} />
                  <DetailRow label="Username" value={viewTarget.user?.username} />
                  <DetailRow label="User ID" value={viewTarget.userId} mono />
                </div>
              </div>

              {/* Transfer Voucher image */}
              {voucherUrl && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Transfer Voucher</p>
                  <div className="rounded-lg overflow-hidden border border-border bg-elevated/40 flex flex-col items-center">
                    <img
                      src={voucherUrl}
                      alt="Transfer voucher"
                      className="max-h-80 w-auto object-contain p-2"
                    />
                    <div className="w-full border-t border-border px-4 py-2 flex items-center justify-between">
                      <span className="text-xs text-muted truncate max-w-xs">{voucherUrl.split("/").pop()}</span>
                      <a
                        href={voucherUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </Modal>

      {/* ── Approve modal ───────────────────────────────────────────────── */}
      <Modal
        open={action === "approve" && !!viewTarget}
        onClose={closeAction}
        title="Approve Deposit"
        footer={
          <>
            <Button variant="ghost" onClick={closeAction}>Cancel</Button>
            <Button variant="success" loading={approveMut.isPending} onClick={() => approveMut.mutate()}>
              <CheckCircle className="w-4 h-4" /> Confirm Approve
            </Button>
          </>
        }
      >
        {viewTarget && (
          <div className="space-y-3 text-sm">
            <p className="text-muted">The user will be credited the amount in their SPOT wallet.</p>
            <div>
              <Label>Amount to credit ({viewTarget.currencySymbol})</Label>
              <Input type="number" step="any" value={overrideAmount} onChange={(e) => setOverrideAmount(e.target.value)} />
            </div>
            <div>
              <Label>Tx hash (optional)</Label>
              <Input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x…" />
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reject modal ────────────────────────────────────────────────── */}
      <Modal
        open={action === "reject" && !!viewTarget}
        onClose={closeAction}
        title="Reject Deposit"
        footer={
          <>
            <Button variant="ghost" onClick={closeAction}>Cancel</Button>
            <Button variant="danger" loading={rejectMut.isPending} onClick={() => rejectMut.mutate()}>
              <XCircle className="w-4 h-4" /> Confirm Reject
            </Button>
          </>
        }
      >
        <Label>Reason for rejection</Label>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Tx hash invalid or not found on chain" />
      </Modal>
    </div>
  );
}
