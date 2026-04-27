import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { fmtDate } from "../lib/utils";
import { Card, Loading, EmptyState, Table, Th, Td, Badge, statusTone, Select } from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

export default function Tickets() {
  const [status, setStatus] = useState("OPEN");
  const { data, isLoading } = useQuery({
    queryKey: ["tickets", status],
    queryFn: async () => (await api.get("/admin/content/tickets", { params: status ? { status } : {} })).data,
  });

  return (
    <div className="p-8">
      <PageHeader title="Support tickets"
        actions={
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </Select>
        }
      />
      <Card>
        {isLoading ? <Loading /> : !data?.length ? <EmptyState /> : (
          <Table>
            <thead><tr><Th>Subject</Th><Th>User</Th><Th>Priority</Th><Th>Status</Th><Th>Updated</Th></tr></thead>
            <tbody>
              {data.map((t: any) => (
                <tr key={t.id} className="hover:bg-elevated/40 cursor-pointer">
                  <Td><Link to={`/tickets/${t.id}`} className="hover:underline">{t.subject}</Link></Td>
                  <Td className="text-xs">{t.user?.username || t.user?.email}</Td>
                  <Td><Badge tone={t.priority === "URGENT" || t.priority === "HIGH" ? "danger" : "muted"}>{t.priority}</Badge></Td>
                  <Td><Badge tone={statusTone(t.status)}>{t.status}</Badge></Td>
                  <Td className="text-xs text-muted">{fmtDate(t.updatedAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
