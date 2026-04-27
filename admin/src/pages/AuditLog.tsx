import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { fmtDate } from "../lib/utils";
import { Card, Loading, EmptyState, Table, Th, Td, Badge, Button } from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

export default function AuditLog() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["audit-log", page],
    queryFn: async () => (await api.get("/admin/auth/audit-log", { params: { page, pageSize: 50 } })).data,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="p-8">
      <PageHeader title="Audit log" description="Every admin action is recorded here" />
      <Card>
        {isLoading ? <Loading /> : !data?.items?.length ? <EmptyState /> : (
          <Table>
            <thead><tr>
              <Th>When</Th><Th>Admin</Th><Th>Action</Th><Th>Target</Th><Th>IP</Th><Th>Details</Th>
            </tr></thead>
            <tbody>
              {data.items.map((l: any) => (
                <tr key={l.id}>
                  <Td className="text-xs text-muted">{fmtDate(l.createdAt)}</Td>
                  <Td>
                    <span className="font-mono text-xs">{l.admin?.username}</span>
                    {l.admin?.role && <Badge tone="muted">{l.admin.role}</Badge>}
                  </Td>
                  <Td><Badge>{l.action}</Badge></Td>
                  <Td className="font-mono text-xs">{l.target ? l.target.slice(0, 16) + (l.target.length > 16 ? "…" : "") : "—"}</Td>
                  <Td className="font-mono text-xs">{l.ip || "—"}</Td>
                  <Td>
                    {l.details && (
                      <details>
                        <summary className="text-xs text-muted cursor-pointer">view</summary>
                        <pre className="text-xs mt-1 bg-elevated p-2 rounded max-w-md overflow-x-auto">{
                          (() => { try { return JSON.stringify(JSON.parse(l.details), null, 2); } catch { return l.details; } })()
                        }</pre>
                      </details>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {data && data.total > data.pageSize && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted">Page {page} of {totalPages} · {data.total} entries</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
