import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { fmtDate } from "../lib/utils";
import {
  Card, Loading, EmptyState, Table, Th, Td, Badge,
  Button, Input, Label, Select, Modal, Textarea,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

const blank = {
  title: "", body: "", category: "GENERAL", bannerUrl: "",
  isPinned: false, isActive: true,
};

export default function Announcements() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["announcements"], queryFn: async () => (await api.get("/admin/content/announcements")).data,
  });

  const upsertMut = useMutation({
    mutationFn: async (f: any) => editing?.id
      ? (await api.patch(`/admin/content/announcements/${editing.id}`, f)).data
      : (await api.post("/admin/content/announcements", f)).data,
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["announcements"] }); setEditing(null); },
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/content/announcements/${id}`)).data,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["announcements"] }); },
  });

  return (
    <div className="p-8">
      <PageHeader title="Announcements" description="Public bulletin shown on the site"
        actions={<Button onClick={() => setEditing({ ...blank })}><Plus className="w-4 h-4" /> New</Button>} />
      <Card>
        {isLoading ? <Loading /> : !data?.length ? <EmptyState /> : (
          <Table>
            <thead><tr><Th>Title</Th><Th>Category</Th><Th>Pinned</Th><Th>Active</Th><Th>Published</Th><Th></Th></tr></thead>
            <tbody>
              {data.map((a: any) => (
                <tr key={a.id}>
                  <Td>{a.title}</Td>
                  <Td className="text-xs"><Badge>{a.category}</Badge></Td>
                  <Td>{a.isPinned && <Badge tone="info">Pinned</Badge>}</Td>
                  <Td><Badge tone={a.isActive ? "success" : "muted"}>{a.isActive ? "On" : "Off"}</Badge></Td>
                  <Td className="text-xs text-muted">{fmtDate(a.publishAt)}</Td>
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

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit announcement" : "New announcement"} size="lg"
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button loading={upsertMut.isPending} onClick={() => upsertMut.mutate(editing)}>Save</Button></>}>
        {editing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div className="col-span-2"><Label>Body</Label><Textarea rows={6} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} /></div>
            <div><Label>Category</Label>
              <Select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                <option>GENERAL</option><option>NEWS</option><option>UPDATE</option><option>MAINTENANCE</option>
              </Select>
            </div>
            <div><Label>Banner URL</Label><Input value={editing.bannerUrl || ""} onChange={(e) => setEditing({ ...editing, bannerUrl: e.target.value })} /></div>
            <div className="col-span-2 flex gap-6 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.isPinned} onChange={(e) => setEditing({ ...editing, isPinned: e.target.checked })} />Pinned
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} />Active
              </label>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
