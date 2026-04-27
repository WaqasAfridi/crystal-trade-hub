import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { fmtDate } from "../lib/utils";
import {
  Card, Loading, EmptyState, Table, Th, Td, Badge,
  Button, Input, Label, Select, Modal,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";
import { useAuth } from "../store/auth";

const blank = {
  username: "", email: "", fullName: "", password: "", role: "MODERATOR", isActive: true,
};

export default function Admins() {
  const qc = useQueryClient();
  const me = useAuth((s) => s.user);
  const [editing, setEditing] = useState<any | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => (await api.get("/admin/auth/")).data,
  });

  const upsertMut = useMutation({
    mutationFn: async (f: any) => {
      if (editing?.id) {
        const body: any = { ...f };
        if (!body.password) delete body.password;
        delete body.username;       // username can't be changed
        return (await api.patch(`/admin/auth/${editing.id}`, body)).data;
      }
      return (await api.post("/admin/auth/", f)).data;
    },
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admins"] }); setEditing(null); },
  });

  const delMut = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/admin/auth/${id}`)).data,
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admins"] }); },
  });

  return (
    <div className="p-8">
      <PageHeader title="Admin users" description="Only SUPER_ADMIN can see this page"
        actions={<Button onClick={() => setEditing({ ...blank })}><Plus className="w-4 h-4" /> Add admin</Button>} />
      <Card>
        {isLoading ? <Loading /> : !data?.length ? <EmptyState /> : (
          <Table>
            <thead><tr><Th>Username</Th><Th>Email</Th><Th>Name</Th><Th>Role</Th><Th>Active</Th><Th>Last login</Th><Th></Th></tr></thead>
            <tbody>
              {data.map((a: any) => (
                <tr key={a.id}>
                  <Td className="font-mono">{a.username}{a.id === me?.id && <span className="ml-2 text-xs text-muted">(you)</span>}</Td>
                  <Td className="text-xs">{a.email}</Td>
                  <Td>{a.fullName || "—"}</Td>
                  <Td><Badge tone={a.role === "SUPER_ADMIN" ? "danger" : a.role === "ADMIN" ? "info" : "muted"}>{a.role}</Badge></Td>
                  <Td><Badge tone={a.isActive ? "success" : "muted"}>{a.isActive ? "On" : "Off"}</Badge></Td>
                  <Td className="text-xs text-muted">{fmtDate(a.lastLoginAt)}</Td>
                  <Td>
                    <div className="flex gap-1">
                      <Button size="sm" variant="secondary" onClick={() => setEditing({ ...a, password: "" })}><Pencil className="w-3 h-3" /></Button>
                      {a.id !== me?.id && (
                        <Button size="sm" variant="danger" onClick={() => { if (confirm("Delete this admin?")) delMut.mutate(a.id); }}><Trash2 className="w-3 h-3" /></Button>
                      )}
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit admin" : "Add admin"} size="md"
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
          <Button loading={upsertMut.isPending} onClick={() => upsertMut.mutate(editing)}>Save</Button></>}>
        {editing && (
          <div className="space-y-3">
            {!editing.id && (
              <div><Label>Username</Label><Input value={editing.username} onChange={(e) => setEditing({ ...editing, username: e.target.value })} /></div>
            )}
            <div><Label>Email</Label><Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
            <div><Label>Full name</Label><Input value={editing.fullName || ""} onChange={(e) => setEditing({ ...editing, fullName: e.target.value })} /></div>
            <div><Label>{editing.id ? "New password (leave empty to keep)" : "Password"}</Label>
              <Input type="password" value={editing.password || ""} onChange={(e) => setEditing({ ...editing, password: e.target.value })} placeholder="At least 8 chars" />
            </div>
            <div><Label>Role</Label>
              <Select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })}>
                <option>SUPER_ADMIN</option><option>ADMIN</option><option>MODERATOR</option><option>SUPPORT</option>
              </Select>
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
