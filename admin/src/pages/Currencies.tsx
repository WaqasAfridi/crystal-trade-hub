import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { fmtNumber } from "../lib/utils";
import {
  Card, Loading, EmptyState, Table, Th, Td, Badge, Button, Input, Label, Select, Modal,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

const blank = {
  symbol: "", name: "", type: "crypto", iconUrl: "",
  decimals: 8, priceUsd: 0,
  withdrawEnabled: true, depositEnabled: true, tradeEnabled: true,
  minWithdraw: 0, maxWithdraw: 0, withdrawFee: 0, withdrawFeePct: 0,
  networks: [] as string[],
  sortOrder: 0, isActive: true,
};

export default function Currencies() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [networksInput, setNetworksInput] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: async () => (await api.get("/admin/content/currencies")).data as any[],
  });

  const closeModal = () => { setEditing(null); setNetworksInput(""); };

  const upsertMut = useMutation({
    mutationFn: async (form: any) => {
      const body = { ...form, networks: networksInput.split(",").map((s) => s.trim()).filter(Boolean) };
      if (editing?.id) return (await api.patch(`/admin/content/currencies/${editing.id}`, body)).data;
      return (await api.post("/admin/content/currencies", body)).data;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["currencies"] }); closeModal(); },
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/content/currencies/${id}`)).data,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["currencies"] }); },
  });

  const onEdit = (row: any) => {
    setEditing({ ...row });
    setNetworksInput((row.networks || []).join(", "));
  };
  const onAdd = () => { setEditing({ ...blank }); setNetworksInput(""); };

  return (
    <div className="p-8">
      <PageHeader title="Currencies" description="Coins and tokens supported by the platform"
        actions={<Button onClick={onAdd}><Plus className="w-4 h-4" /> Add currency</Button>}
      />
      <Card>
        {isLoading ? <Loading /> : !data?.length ? <EmptyState /> : (
          <Table>
            <thead><tr>
              <Th>Symbol</Th><Th>Name</Th><Th>Type</Th><Th>Price (USD)</Th>
              <Th>Networks</Th><Th>Min withdraw</Th><Th>Fee</Th>
              <Th>Flags</Th><Th>Active</Th><Th></Th>
            </tr></thead>
            <tbody>
              {data.map((c: any) => (
                <tr key={c.id}>
                  <Td className="font-mono font-medium">{c.symbol}</Td>
                  <Td>{c.name}</Td>
                  <Td className="text-xs text-muted">{c.type}</Td>
                  <Td>${fmtNumber(c.priceUsd, 4)}</Td>
                  <Td className="text-xs">{(c.networks || []).join(", ") || "—"}</Td>
                  <Td>{fmtNumber(c.minWithdraw, 6)}</Td>
                  <Td className="text-xs">{c.withdrawFee} + {c.withdrawFeePct}%</Td>
                  <Td className="text-xs space-x-1">
                    {c.depositEnabled && <Badge tone="success">D</Badge>}
                    {c.withdrawEnabled && <Badge tone="success">W</Badge>}
                    {c.tradeEnabled && <Badge tone="success">T</Badge>}
                  </Td>
                  <Td><Badge tone={c.isActive ? "success" : "muted"}>{c.isActive ? "On" : "Off"}</Badge></Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => onEdit(c)}><Pencil className="w-3 h-3" /></Button>
                      <Button size="sm" variant="danger" onClick={() => {
                        if (confirm(`Delete ${c.symbol}? Wallets referencing it will fail.`)) delMut.mutate(c.id);
                      }}><Trash2 className="w-3 h-3" /></Button>
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
        onClose={closeModal}
        title={editing?.id ? `Edit ${editing.symbol}` : "Add currency"}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>Cancel</Button>
            <Button loading={upsertMut.isPending} onClick={() => upsertMut.mutate(editing)}>Save</Button>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Symbol</Label><Input value={editing.symbol} onChange={(e) => setEditing({ ...editing, symbol: e.target.value.toUpperCase() })} /></div>
            <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <div><Label>Type</Label>
              <Select value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                <option value="crypto">crypto</option><option value="fiat">fiat</option>
                <option value="stock">stock</option><option value="fx">fx</option>
              </Select>
            </div>
            <div className="col-span-3"><Label>Icon URL</Label><Input value={editing.iconUrl || ""} onChange={(e) => setEditing({ ...editing, iconUrl: e.target.value })} /></div>
            <div><Label>Price (USD)</Label><Input type="number" step="any" value={editing.priceUsd} onChange={(e) => setEditing({ ...editing, priceUsd: parseFloat(e.target.value || "0") })} /></div>
            <div><Label>Decimals</Label><Input type="number" value={editing.decimals} onChange={(e) => setEditing({ ...editing, decimals: parseInt(e.target.value || "0") })} /></div>
            <div><Label>Sort order</Label><Input type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: parseInt(e.target.value || "0") })} /></div>
            <div><Label>Min withdraw</Label><Input type="number" step="any" value={editing.minWithdraw} onChange={(e) => setEditing({ ...editing, minWithdraw: parseFloat(e.target.value || "0") })} /></div>
            <div><Label>Max withdraw (0 = none)</Label><Input type="number" step="any" value={editing.maxWithdraw} onChange={(e) => setEditing({ ...editing, maxWithdraw: parseFloat(e.target.value || "0") })} /></div>
            <div><Label>Withdraw fee (flat)</Label><Input type="number" step="any" value={editing.withdrawFee} onChange={(e) => setEditing({ ...editing, withdrawFee: parseFloat(e.target.value || "0") })} /></div>
            <div className="col-span-2"><Label>Withdraw fee % (0–100)</Label><Input type="number" step="any" value={editing.withdrawFeePct} onChange={(e) => setEditing({ ...editing, withdrawFeePct: parseFloat(e.target.value || "0") })} /></div>
            <div><Label>Active</Label><Select value={editing.isActive ? "1" : "0"} onChange={(e) => setEditing({ ...editing, isActive: e.target.value === "1" })}><option value="1">Yes</option><option value="0">No</option></Select></div>
            <div className="col-span-3"><Label>Networks (comma-separated, e.g. TRC20, ERC20, BEP20)</Label>
              <Input value={networksInput} onChange={(e) => setNetworksInput(e.target.value)} /></div>
            <div className="col-span-3 flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.depositEnabled} onChange={(e) => setEditing({ ...editing, depositEnabled: e.target.checked })} />Deposit enabled</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.withdrawEnabled} onChange={(e) => setEditing({ ...editing, withdrawEnabled: e.target.checked })} />Withdraw enabled</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.tradeEnabled} onChange={(e) => setEditing({ ...editing, tradeEnabled: e.target.checked })} />Trade enabled</label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
