import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { fmtNumber } from "../lib/utils";
import {
  Card, Loading, EmptyState, Table, Th, Td, Badge,
  Button, Input, Label, Select, Modal, Textarea,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

const blank = {
  name: "", currencySymbol: "USDT", apr: 5, durationDays: 0,
  minAmount: 0, maxAmount: 0, totalCap: 0,
  description: "", iconUrl: "", isActive: true,
};

export default function EarnProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["earn"], queryFn: async () => (await api.get("/admin/content/earn")).data,
  });

  const upsertMut = useMutation({
    mutationFn: async (f: any) => {
      const body = { ...f,
        apr: parseFloat(f.apr), durationDays: parseInt(f.durationDays),
        minAmount: parseFloat(f.minAmount || 0), maxAmount: parseFloat(f.maxAmount || 0),
        totalCap: parseFloat(f.totalCap || 0) };
      return editing?.id
        ? (await api.patch(`/admin/content/earn/${editing.id}`, body)).data
        : (await api.post("/admin/content/earn", body)).data;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["earn"] }); setEditing(null); },
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/content/earn/${id}`)).data,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["earn"] }); },
  });

  return (
    <div className="p-8">
      <PageHeader title="Earn products" description="Staking and yield products"
        actions={<Button onClick={() => setEditing({ ...blank })}><Plus className="w-4 h-4" /> Add product</Button>} />
      <Card>
        {isLoading ? <Loading /> : !data?.length ? <EmptyState /> : (
          <Table>
            <thead><tr><Th>Name</Th><Th>Coin</Th><Th>APR</Th><Th>Duration</Th><Th>Min</Th><Th>Cap</Th><Th>Filled</Th><Th>Active</Th><Th></Th></tr></thead>
            <tbody>
              {data.map((p: any) => (
                <tr key={p.id}>
                  <Td>{p.name}</Td>
                  <Td className="font-mono">{p.currencySymbol}</Td>
                  <Td>{fmtNumber(p.apr, 2)}%</Td>
                  <Td className="text-xs">{p.durationDays === 0 ? "Flexible" : `${p.durationDays} days`}</Td>
                  <Td>{fmtNumber(p.minAmount, 4)}</Td>
                  <Td>{p.totalCap > 0 ? fmtNumber(p.totalCap, 0) : "∞"}</Td>
                  <Td>{fmtNumber(p.filled, 0)}</Td>
                  <Td><Badge tone={p.isActive ? "success" : "muted"}>{p.isActive ? "On" : "Off"}</Badge></Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => setEditing({ ...p })}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="danger" onClick={() => { if (confirm("Delete?")) delMut.mutate(p.id); }}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit product" : "Add product"} size="lg"
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button loading={upsertMut.isPending} onClick={() => upsertMut.mutate(editing)}>Save</Button></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><Label>Currency symbol</Label><Input value={editing.currencySymbol} onChange={(e) => setEditing({ ...editing, currencySymbol: e.target.value.toUpperCase() })} /></div>
            <div><Label>APR (%)</Label><Input type="number" step="any" value={editing.apr} onChange={(e) => setEditing({ ...editing, apr: e.target.value })} /></div>
            <div><Label>Duration (days, 0 = flexible)</Label><Input type="number" value={editing.durationDays} onChange={(e) => setEditing({ ...editing, durationDays: e.target.value })} /></div>
            <div><Label>Min amount</Label><Input type="number" step="any" value={editing.minAmount} onChange={(e) => setEditing({ ...editing, minAmount: e.target.value })} /></div>
            <div><Label>Max amount (0 = none)</Label><Input type="number" step="any" value={editing.maxAmount} onChange={(e) => setEditing({ ...editing, maxAmount: e.target.value })} /></div>
            <div><Label>Total cap (0 = unlimited)</Label><Input type="number" step="any" value={editing.totalCap} onChange={(e) => setEditing({ ...editing, totalCap: e.target.value })} /></div>
            <div><Label>Active</Label>
              <Select value={editing.isActive ? "1" : "0"} onChange={(e) => setEditing({ ...editing, isActive: e.target.value === "1" })}>
                <option value="1">Yes</option><option value="0">No</option>
              </Select>
            </div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="col-span-2"><Label>Icon URL</Label><Input value={editing.iconUrl || ""} onChange={(e) => setEditing({ ...editing, iconUrl: e.target.value })} /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
