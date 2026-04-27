import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { fmtNumber, fmtDate, truncate } from "../lib/utils";
import {
  Card, Loading, EmptyState, Table, Th, Td, Badge, statusTone,
  Button, Select, Input, Modal, Label, Textarea,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

export default function Withdrawals() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("PENDING");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [target, setTarget] = useState<any>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [txHash, setTxHash] = useState("");
  const [reason, setReason] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["withdrawals", page, status, search],
    queryFn: async () => {
      const params: any = { page, pageSize: 25 };
      if (status) params.status = status;
      if (search) params.search = search;
      return (await api.get("/admin/finance-ops/withdrawals", { params })).data;
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const closeModal = () => { setTarget(null); setAction(null); setTxHash(""); setReason(""); };

  const approveMut = useMutation({
    mutationFn: async () => (await api.post(`/admin/finance-ops/withdrawals/${target.id}/approve`,
      txHash ? { txHash } : {})).data,
    onSuccess: () => {
      toast.success("Withdrawal approved (locked funds consumed)");
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      closeModal();
    },
  });

  const rejectMut = useMutation({
    mutationFn: async () => (await api.post(`/admin/finance-ops/withdrawals/${target.id}/reject`, { reason })).data,
    onSuccess: () => {
      toast.success("Withdrawal rejected (funds returned to user)");
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      closeModal();
    },
  });

  return (
    <div className="p-8">
      <PageHeader title="Withdrawals" description={data ? `${data.total} total` : ""} />

      <Card className="mb-4">
        <div className="p-4 flex flex-wrap gap-3">
          <Input
            className="flex-1 min-w-[260px]"
            placeholder="Search ID, address, user…"
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
              <Th>User</Th><Th>Amount</Th><Th>Net</Th><Th>Fee</Th>
              <Th>Network</Th><Th>To address</Th><Th>Status</Th><Th>Submitted</Th><Th></Th>
            </tr></thead>
            <tbody>
              {data.items.map((w: any) => (
                <tr key={w.id} className="hover:bg-elevated/40">
                  <Td>
                    <Link to={`/users/${w.userId}`} className="hover:underline">
                      {w.user?.username || w.user?.email}
                    </Link>
                    <div className="text-xs text-muted font-mono">{w.id.slice(0, 8)}…</div>
                  </Td>
                  <Td>{fmtNumber(w.amount, 6)} {w.currencySymbol}</Td>
                  <Td>{fmtNumber(w.netAmount, 6)}</Td>
                  <Td className="text-xs text-muted">{fmtNumber(w.fee, 6)}</Td>
                  <Td className="text-xs">{w.network || "—"}</Td>
                  <Td className="font-mono text-xs">{truncate(w.toAddress, 8)}</Td>
                  <Td><Badge tone={statusTone(w.status)}>{w.status}</Badge></Td>
                  <Td className="text-xs text-muted">{fmtDate(w.createdAt)}</Td>
                  <Td>
                    {(w.status === "PENDING" || w.status === "PROCESSING") && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="success" onClick={() => { setTarget(w); setAction("approve"); }}>Approve</Button>
                        <Button size="sm" variant="danger" onClick={() => { setTarget(w); setAction("reject"); }}>Reject</Button>
                      </div>
                    )}
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

      <Modal
        open={action === "approve" && !!target}
        onClose={closeModal}
        title="Approve withdrawal"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="success" loading={approveMut.isPending} onClick={() => approveMut.mutate()}>Confirm approve</Button>
          </>
        }
      >
        {target && (
          <div className="space-y-3 text-sm">
            <p className="text-muted">
              The locked {target.amount} {target.currencySymbol} will be consumed (debited).
              Send the {target.netAmount} {target.currencySymbol} on-chain to the user's address before confirming.
            </p>
            <div><Label>Tx hash (optional but recommended)</Label>
              <Input value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="0x…" /></div>
          </div>
        )}
      </Modal>

      <Modal
        open={action === "reject" && !!target}
        onClose={closeModal}
        title="Reject withdrawal"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button variant="danger" loading={rejectMut.isPending} onClick={() => rejectMut.mutate()}>Confirm reject</Button>
          </>
        }
      >
        <p className="text-xs text-muted mb-3">Locked funds will be returned to the user's available balance.</p>
        <Label>Reason</Label>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., Suspicious activity" />
      </Modal>
    </div>
  );
}
