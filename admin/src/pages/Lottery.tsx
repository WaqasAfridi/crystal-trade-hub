import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Sparkles } from "lucide-react";
import { api } from "../lib/api";
import { fmtNumber, fmtDate } from "../lib/utils";
import {
  Card, Loading, EmptyState, Table, Th, Td, Badge, statusTone,
  Button, Input, Label, Modal,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

const blank = {
  name: "",
  ticketPrice: 1,
  drawAt: new Date(Date.now() + 7 * 86400 * 1000).toISOString().slice(0, 16),
};

export default function Lottery() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["lottery"], queryFn: async () => (await api.get("/admin/content/lottery")).data,
  });

  const createMut = useMutation({
    mutationFn: async (f: any) => (await api.post("/admin/content/lottery", {
      name: f.name, ticketPrice: parseFloat(f.ticketPrice),
      drawAt: new Date(f.drawAt).toISOString(),
    })).data,
    onSuccess: () => { toast.success("Round created"); qc.invalidateQueries({ queryKey: ["lottery"] }); setEditing(null); },
  });

  const drawMut = useMutation({
    mutationFn: async (id: string) => (await api.post(`/admin/content/lottery/${id}/draw`)).data,
    onSuccess: () => { toast.success("Drawn"); qc.invalidateQueries({ queryKey: ["lottery"] }); },
  });

  return (
    <div className="p-8">
      <PageHeader title="Lottery" description="Create rounds and draw winners"
        actions={<Button onClick={() => setEditing({ ...blank })}><Plus className="w-4 h-4" /> New round</Button>}
      />
      <Card>
        {isLoading ? <Loading /> : !data?.length ? <EmptyState /> : (
          <Table>
            <thead><tr><Th>Name</Th><Th>Ticket price</Th><Th>Prize pool</Th><Th>Entries</Th><Th>Draw at</Th><Th>Status</Th><Th></Th></tr></thead>
            <tbody>
              {data.map((r: any) => (
                <tr key={r.id}>
                  <Td>{r.name}</Td>
                  <Td>{fmtNumber(r.ticketPrice, 2)} USDT</Td>
                  <Td>{fmtNumber(r.prizePool, 2)} USDT</Td>
                  <Td>{r._count?.entries ?? 0}</Td>
                  <Td className="text-xs text-muted">{fmtDate(r.drawAt)}</Td>
                  <Td><Badge tone={statusTone(r.status)}>{r.status}</Badge></Td>
                  <Td>
                    {r.status === "OPEN" && (
                      <Button size="sm" variant="success" loading={drawMut.isPending}
                        onClick={() => { if (confirm("Draw winner now?")) drawMut.mutate(r.id); }}>
                        <Sparkles className="w-3 h-3" /> Draw
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="New lottery round"
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button loading={createMut.isPending} onClick={() => createMut.mutate(editing)}>Create</Button></>}>
        {editing && (
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="e.g., Weekly USDT Lottery #1" /></div>
            <div><Label>Ticket price (USDT)</Label><Input type="number" step="any" value={editing.ticketPrice} onChange={(e) => setEditing({ ...editing, ticketPrice: e.target.value })} /></div>
            <div><Label>Draw at</Label><Input type="datetime-local" value={editing.drawAt} onChange={(e) => setEditing({ ...editing, drawAt: e.target.value })} /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
