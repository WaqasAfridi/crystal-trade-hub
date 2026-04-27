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
  name: "", type: "SAVINGS", currencySymbol: "USDT",
  rate: 5, durationDays: 30, minAmount: 0, maxAmount: 0,
  description: "", isActive: true,
};

export default function FinanceProducts() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["finance"], queryFn: async () => (await api.get("/admin/content/finance")).data,
  });

  const upsertMut = useMutation({
    mutationFn: async (f: any) => {
      const body = { ...f, rate: parseFloat(f.rate), durationDays: parseInt(f.durationDays),
        minAmount: parseFloat(f.minAmount || 0), maxAmount: parseFloat(f.maxAmount || 0) };
      return editing?.id
        ? (await api.patch(`/admin/content/finance/${editing.id}`, body)).data
        : (await api.post("/admin/content/finance", body)).data;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["finance"] }); setEditing(null); },
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/content/finance/${id}`)).data,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["finance"] }); },
  });

  return (
    <div className="p-8">
      <PageHeader title="Finance products" description="Loans, savings, structured products"
        actions={<Button onClick={() => setEditing({ ...blank })}><Plus className="w-4 h-4" /> Add product</Button>} />
      <Card>
        {isLoading ? <Loading /> : !data?.length ? <EmptyState /> : (
          <Table>
            <thead><tr><Th>Name</Th><Th>Type</Th><Th>Coin</Th><Th>Rate</Th><Th>Duration</Th><Th>Min</Th><Th>Active</Th><Th></Th></tr></thead>
            <tbody>
              {data.map((p: any) => (
                <tr key={p.id}>
                  <Td>{p.name}</Td>
                  <Td className="text-xs"><Badge>{p.type}</Badge></Td>
                  <Td className="font-mono">{p.currencySymbol}</Td>
                  <Td>{fmtNumber(p.rate, 2)}%</Td>
                  <Td className="text-xs">{p.durationDays} days</Td>
                  <Td>{fmtNumber(p.minAmount, 2)}</Td>
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
            <div><Label>Type</Label>
              <Select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                <option>SAVINGS</option><option>LOAN</option><option>STRUCTURED</option>
              </Select>
            </div>
            <div><Label>Currency symbol</Label><Input value={editing.currencySymbol} onChange={(e) => setEditing({ ...editing, currencySymbol: e.target.value.toUpperCase() })} /></div>
            <div><Label>Rate (%)</Label><Input type="number" step="any" value={editing.rate} onChange={(e) => setEditing({ ...editing, rate: e.target.value })} /></div>
            <div><Label>Duration (days)</Label><Input type="number" value={editing.durationDays} onChange={(e) => setEditing({ ...editing, durationDays: e.target.value })} /></div>
            <div><Label>Min amount</Label><Input type="number" step="any" value={editing.minAmount} onChange={(e) => setEditing({ ...editing, minAmount: e.target.value })} /></div>
            <div><Label>Max amount (0 = none)</Label><Input type="number" step="any" value={editing.maxAmount} onChange={(e) => setEditing({ ...editing, maxAmount: e.target.value })} /></div>
            <div><Label>Active</Label>
              <Select value={editing.isActive ? "1" : "0"} onChange={(e) => setEditing({ ...editing, isActive: e.target.value === "1" })}>
                <option value="1">Yes</option><option value="0">No</option>
              </Select>
            </div>
            <div className="col-span-2"><Label>Description</Label><Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
