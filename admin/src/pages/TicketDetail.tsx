import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, Send } from "lucide-react";
import { api } from "../lib/api";
import { fmtDate } from "../lib/utils";
import { Card, CardBody, CardHeader, CardTitle, Loading, Badge, statusTone, Button, Textarea } from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [reply, setReply] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => (await api.get(`/admin/content/tickets/${id}`)).data,
  });

  const replyMut = useMutation({
    mutationFn: async () => (await api.post(`/admin/content/tickets/${id}/reply`, { body: reply })).data,
    onSuccess: () => { toast.success("Reply sent"); setReply(""); qc.invalidateQueries({ queryKey: ["ticket", id] }); },
  });

  const closeMut = useMutation({
    mutationFn: async () => (await api.post(`/admin/content/tickets/${id}/close`)).data,
    onSuccess: () => { toast.success("Closed"); qc.invalidateQueries({ queryKey: ["ticket", id] }); },
  });

  if (isLoading || !data) return <div className="p-8"><Loading /></div>;

  return (
    <div className="p-8">
      <Link to="/tickets" className="inline-flex items-center gap-2 text-sm text-muted hover:text-text mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <PageHeader
        title={data.subject}
        description={`From ${data.user?.username || data.user?.email}`}
        actions={
          <>
            <Badge tone={statusTone(data.status)}>{data.status}</Badge>
            <Badge tone={data.priority === "URGENT" || data.priority === "HIGH" ? "danger" : "muted"}>{data.priority}</Badge>
            {data.status !== "CLOSED" && (
              <Button variant="secondary" onClick={() => closeMut.mutate()} loading={closeMut.isPending}>Close ticket</Button>
            )}
          </>
        }
      />

      <Card className="mb-6">
        <CardHeader><CardTitle>Conversation</CardTitle></CardHeader>
        <CardBody>
          <div className="space-y-4">
            {data.messages.map((m: any) => (
              <div key={m.id} className={`flex ${m.senderRole === "ADMIN" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-xl px-4 py-3 text-sm ${
                  m.senderRole === "ADMIN" ? "bg-blue-500/15 border border-blue-500/30" : "bg-elevated border border-border"
                }`}>
                  <div className="text-xs text-muted mb-1">
                    {m.senderRole} · {fmtDate(m.createdAt)}
                  </div>
                  <div className="whitespace-pre-wrap">{m.body}</div>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {data.status !== "CLOSED" && (
        <Card>
          <CardBody>
            <Textarea
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply…"
            />
            <div className="mt-3 flex justify-end">
              <Button onClick={() => replyMut.mutate()} loading={replyMut.isPending} disabled={!reply.trim()}>
                <Send className="w-4 h-4" /> Send reply
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
