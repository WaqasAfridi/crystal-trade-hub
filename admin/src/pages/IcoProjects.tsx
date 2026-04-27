import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { fmtNumber, fmtDate } from "../lib/utils";
import {
  Card, Loading, EmptyState, Table, Th, Td, Badge, statusTone,
  Button, Input, Label, Select, Modal, Textarea,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

const blank = {
  name: "", symbol: "", description: "", iconUrl: "", bannerUrl: "",
  totalSupply: 1_000_000, pricePerToken: 0.01,
  minBuy: 0, maxBuy: 0,
  startAt: new Date().toISOString().slice(0, 16),
  endAt: new Date(Date.now() + 30 * 86400 * 1000).toISOString().slice(0, 16),
  status: "UPCOMING", isActive: true,
};

export default function IcoProjects() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["ico"],
    queryFn: async () => (await api.get("/admin/content/ico")).data,
  });

  const upsertMut = useMutation({
    mutationFn: async (f: any) => {
      const body = { ...f, totalSupply: parseFloat(f.totalSupply), pricePerToken: parseFloat(f.pricePerToken),
        minBuy: parseFloat(f.minBuy || 0), maxBuy: parseFloat(f.maxBuy || 0),
        startAt: new Date(f.startAt).toISOString(), endAt: new Date(f.endAt).toISOString() };
      return editing?.id
        ? (await api.patch(`/admin/content/ico/${editing.id}`, body)).data
        : (await api.post("/admin/content/ico", body)).data;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["ico"] }); setEditing(null); },
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/content/ico/${id}`)).data,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["ico"] }); },
  });

  return (
    <div className="p-8">
      <PageHeader title="ICO projects" actions={<Button onClick={() => setEditing({ ...blank })}><Plus className="w-4 h-4" /> Add project</Button>} />
      <Card>
        {isLoading ? <Loading /> : !data?.length ? <EmptyState /> : (
          <Table>
            <thead><tr><Th>Name</Th><Th>Symbol</Th><Th>Price</Th><Th>Supply</Th><Th>Sold</Th><Th>Window</Th><Th>Status</Th><Th></Th></tr></thead>
            <tbody>
              {data.map((p: any) => (
                <tr key={p.id}>
                  <Td>{p.name}</Td>
                  <Td className="font-mono">{p.symbol}</Td>
                  <Td>${fmtNumber(p.pricePerToken, 4)}</Td>
                  <Td>{fmtNumber(p.totalSupply, 0)}</Td>
                  <Td>{fmtNumber(p.soldAmount, 0)}</Td>
                  <Td className="text-xs text-muted">{fmtDate(p.startAt)} → {fmtDate(p.endAt)}</Td>
                  <Td><Badge tone={statusTone(p.status)}>{p.status}</Badge></Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => setEditing({
                        ...p,
                        startAt: new Date(p.startAt).toISOString().slice(0, 16),
                        endAt: new Date(p.endAt).toISOString().slice(0, 16),
                      })}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="danger" onClick={() => { if (confirm("Delete?")) delMut.mutate(p.id); }}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit project" : "Add project"} size="lg"
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button loading={upsertMut.isPending} onClick={() => upsertMut.mutate(editing)}>Save</Button></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><Label>Symbol</Label><Input value={editing.symbol} onChange={(e) => setEditing({ ...editing, symbol: e.target.value })} /></div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div><Label>Icon URL</Label><Input value={editing.iconUrl || ""} onChange={(e) => setEditing({ ...editing, iconUrl: e.target.value })} /></div>
            <div><Label>Banner URL</Label><Input value={editing.bannerUrl || ""} onChange={(e) => setEditing({ ...editing, bannerUrl: e.target.value })} /></div>
            <div><Label>Price per token (USDT)</Label><Input type="number" step="any" value={editing.pricePerToken} onChange={(e) => setEditing({ ...editing, pricePerToken: e.target.value })} /></div>
            <div><Label>Total supply</Label><Input type="number" value={editing.totalSupply} onChange={(e) => setEditing({ ...editing, totalSupply: e.target.value })} /></div>
            <div><Label>Min buy (USDT)</Label><Input type="number" step="any" value={editing.minBuy} onChange={(e) => setEditing({ ...editing, minBuy: e.target.value })} /></div>
            <div><Label>Max buy (USDT, 0 = no cap)</Label><Input type="number" step="any" value={editing.maxBuy} onChange={(e) => setEditing({ ...editing, maxBuy: e.target.value })} /></div>
            <div><Label>Start at</Label><Input type="datetime-local" value={editing.startAt} onChange={(e) => setEditing({ ...editing, startAt: e.target.value })} /></div>
            <div><Label>End at</Label><Input type="datetime-local" value={editing.endAt} onChange={(e) => setEditing({ ...editing, endAt: e.target.value })} /></div>
            <div><Label>Status</Label>
              <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                <option>UPCOMING</option><option>LIVE</option><option>ENDED</option><option>CANCELLED</option>
              </Select>
            </div>
            <div><Label>Active</Label>
              <Select value={editing.isActive ? "1" : "0"} onChange={(e) => setEditing({ ...editing, isActive: e.target.value === "1" })}>
                <option value="1">Yes</option><option value="0">No</option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
