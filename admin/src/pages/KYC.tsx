import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { api, FILE_BASE } from "../lib/api";
import { fmtDate } from "../lib/utils";
import {
  Card, CardHeader, CardTitle, Loading, EmptyState, Badge, statusTone,
  Button, Select, Modal, Textarea, Label,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

export default function KYC() {
  const [status, setStatus] = useState("PENDING");
  const [selected, setSelected] = useState<any>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const qc = useQueryClient();

  const { data: list, isLoading } = useQuery({
    queryKey: ["kyc-list", status],
    queryFn: async () => (await api.get("/admin/users/kyc/list", { params: { status } })).data,
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["kyc-list"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const approveMut = useMutation({
    mutationFn: async (id: string) => (await api.post(`/admin/users/kyc/${id}/approve`)).data,
    onSuccess: () => { toast.success("Approved"); refresh(); setSelected(null); },
  });

  const rejectMut = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) =>
      (await api.post(`/admin/users/kyc/${id}/reject`, { reason })).data,
    onSuccess: () => { toast.success("Rejected"); refresh(); setSelected(null); setRejectOpen(false); setRejectReason(""); },
  });

  const buildImgUrl = (p?: string | null) => {
    if (!p) return null;
    // backend stores raw path like "./uploads/123-foo.jpg" — turn into URL
    const cleaned = p.replace(/^\.?\/?/, "").replace(/^uploads\//, "");
    return `${FILE_BASE}/uploads/${cleaned}`;
  };

  return (
    <div className="p-8">
      <PageHeader
        title="KYC Review"
        description="Approve or reject identity verification submissions"
        actions={
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </Select>
        }
      />

      <Card>
        {isLoading ? <Loading /> : !list?.length ? <EmptyState label={`No ${status.toLowerCase()} submissions`} /> : (
          <div className="divide-y divide-border/50">
            {list.map((k: any) => (
              <button
                key={k.id}
                onClick={() => setSelected(k)}
                className="w-full text-left p-4 hover:bg-elevated/50 transition-colors flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{k.fullName}</span>
                    <Badge tone={statusTone(k.status)}>{k.status}</Badge>
                  </div>
                  <div className="text-sm text-muted">
                    {k.user?.email || k.user?.username} · {k.country} · {k.documentType}
                  </div>
                  <div className="text-xs text-muted mt-1">Submitted {fmtDate(k.createdAt)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* ── Detail modal ─────────────────────────────── */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `KYC: ${selected.fullName}` : ""}
        size="xl"
        footer={selected?.status === "PENDING" && (
          <>
            <Button variant="danger" onClick={() => setRejectOpen(true)}>Reject</Button>
            <Button variant="success" onClick={() => approveMut.mutate(selected.id)} loading={approveMut.isPending}>Approve</Button>
          </>
        )}
      >
        {selected && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <Field label="Status" value={<Badge tone={statusTone(selected.status)}>{selected.status}</Badge>} />
              <Field label="User" value={<Link to={`/users/${selected.user.id}`} className="hover:underline">{selected.user?.email || selected.user?.username}</Link>} />
              <Field label="Full name" value={selected.fullName} />
              <Field label="Country" value={selected.country} />
              <Field label="Document type" value={selected.documentType} />
              <Field label="ID number" value={selected.idNumber} />
              <Field label="Date of birth" value={fmtDate(selected.dateOfBirth)} />
              <Field label="Submitted" value={fmtDate(selected.createdAt)} />
              {selected.reviewedAt && <Field label="Reviewed" value={fmtDate(selected.reviewedAt)} />}
              {selected.rejectionReason && <Field label="Rejection" value={selected.rejectionReason} />}
            </div>
            <div className="space-y-3">
              <DocImage label="Front" src={buildImgUrl(selected.frontImagePath)} />
              {selected.backImagePath && <DocImage label="Back" src={buildImgUrl(selected.backImagePath)} />}
              {selected.selfieImagePath && <DocImage label="Selfie" src={buildImgUrl(selected.selfieImagePath)} />}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reject reason modal ──────────────────────── */}
      <Modal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        title="Reject KYC"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="danger" loading={rejectMut.isPending}
              onClick={() => rejectMut.mutate({ id: selected.id, reason: rejectReason })}>
              Confirm reject
            </Button>
          </>
        }
      >
        <Label>Reason (visible to the user)</Label>
        <Textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="e.g., Document is unreadable. Please re-upload a clear photo."
        />
      </Modal>
    </div>
  );
}

const Field = ({ label, value }: any) => (
  <div className="flex justify-between py-1.5 border-b border-border/50 gap-3">
    <span className="text-xs text-muted">{label}</span>
    <span className="text-right">{value}</span>
  </div>
);

const DocImage = ({ label, src }: { label: string; src: string | null }) => (
  <div>
    <div className="text-xs text-muted mb-1">{label}</div>
    {src ? (
      <a href={src} target="_blank" rel="noreferrer">
        <img src={src} alt={label} className="w-full rounded-lg border border-border object-cover max-h-72" />
      </a>
    ) : (
      <div className="aspect-video flex items-center justify-center bg-elevated rounded-lg border border-border text-muted text-xs">
        <ImageOff className="w-4 h-4 mr-2" /> Not provided
      </div>
    )}
  </div>
);
