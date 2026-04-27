import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { api } from "../lib/api";
import { truncate } from "../lib/utils";
import {
  Card, Loading, EmptyState, Table, Th, Td, Badge,
  Button, Input, Label, Select, Modal,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

const blank = { currencyId: "", network: "", address: "", qrUrl: "", isActive: true };

export default function DepositAddresses() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data: list, isLoading } = useQuery({
    queryKey: ["deposit-addresses"],
    queryFn: async () => (await api.get("/admin/content/deposit-addresses")).data,
  });

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => (await api.get("/admin/content/currencies")).data,
  });

  const [qrUploading, setQrUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadQr = async (file: File) => {
    setQrUploading(true);
    try {
      const fd = new FormData();
      fd.append("qr", file);
      const res = await api.post("/admin/content/deposit-addresses/upload-qr", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditing((prev: any) => ({ ...prev, qrUrl: res.data.url }));
    } catch {
      // error toast already shown by api interceptor
    } finally {
      setQrUploading(false);
    }
  };

  const upsertMut = useMutation({
    mutationFn: async (form: any) => {
      // Strip DB-only fields so Zod doesn't reject them
      const payload: Record<string, any> = {
        currencyId: form.currencyId,
        network: form.network,
        address: form.address,
        isActive: form.isActive,
      };
      if (form.qrUrl) payload.qrUrl = form.qrUrl;
      return editing?.id
        ? (await api.patch(`/admin/content/deposit-addresses/${editing.id}`, payload)).data
        : (await api.post("/admin/content/deposit-addresses", payload)).data;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["deposit-addresses"] }); setEditing(null); },
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/content/deposit-addresses/${id}`)).data,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["deposit-addresses"] }); },
  });

  return (
    <div className="p-8">
      <PageHeader
        title="Deposit addresses"
        description="Platform-controlled addresses shown to users on the Deposit page"
        actions={<Button onClick={() => setEditing({ ...blank })}><Plus className="w-4 h-4" /> Add address</Button>}
      />
      <Card>
        {isLoading ? <Loading /> : !list?.length ? <EmptyState /> : (
          <Table>
            <thead><tr>
              <Th>Currency</Th><Th>Network</Th><Th>Address</Th><Th>Active</Th><Th></Th>
            </tr></thead>
            <tbody>
              {list.map((a: any) => (
                <tr key={a.id}>
                  <Td>{a.currency?.symbol}</Td>
                  <Td>{a.network}</Td>
                  <Td className="font-mono text-xs">{truncate(a.address, 12)}</Td>
                  <Td><Badge tone={a.isActive ? "success" : "muted"}>{a.isActive ? "On" : "Off"}</Badge></Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => setEditing({ ...a })}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="danger" onClick={() => { if (confirm("Delete?")) delMut.mutate(a.id); }}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit address" : "Add address"}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            <Button loading={upsertMut.isPending} onClick={() => upsertMut.mutate(editing)}>Save</Button>
          </>
        }
      >
        {editing && (
          <div className="space-y-3">
            <div><Label>Currency</Label>
              <Select value={editing.currencyId} onChange={(e) => setEditing({ ...editing, currencyId: e.target.value })}>
                <option value="">Select…</option>
                {(currencies || []).map((c: any) => <option key={c.id} value={c.id}>{c.symbol} — {c.name}</option>)}
              </Select>
            </div>
            <div><Label>Network</Label><Input value={editing.network} onChange={(e) => setEditing({ ...editing, network: e.target.value })} placeholder="TRC20 / ERC20 / BEP20…" /></div>
            <div><Label>Address</Label><Input value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></div>
            <div>
              <Label>QR code image (optional)</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadQr(f); e.target.value = ""; }}
              />
              {editing.qrUrl ? (
                <div className="mt-1 flex items-start gap-3">
                  <img
                    src={editing.qrUrl}
                    alt="QR preview"
                    className="h-24 w-24 rounded border object-contain bg-white p-1"
                  />
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="secondary" loading={qrUploading} onClick={() => fileRef.current?.click()}>
                      <Upload className="w-3 h-3" /> Replace
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setEditing({ ...editing, qrUrl: "" })}>
                      <X className="w-3 h-3" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <Button size="sm" variant="secondary" loading={qrUploading} className="mt-1" onClick={() => fileRef.current?.click()}>
                  <Upload className="w-3 h-3" /> Upload QR image
                </Button>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />
              Active
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
