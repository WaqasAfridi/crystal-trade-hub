import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../lib/api";
import { fmtDate } from "../lib/utils";
import { Card, Table, Th, Td, Badge, statusTone, Loading, EmptyState, Input, Select, Button } from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, search, status],
    queryFn: async () => {
      const params: any = { page, pageSize: 25 };
      if (search) params.search = search;
      if (status) params.status = status;
      return (await api.get("/admin/users", { params })).data;
    },
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="p-8">
      <PageHeader title="Users" description={data ? `${data.total} total users` : ""} />

      <Card className="mb-4">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <Input
              className="pl-9"
              placeholder="Search email, username, phone, ID, or invite code"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            />
          </div>
          <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BANNED">Banned</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
          </Select>
          <Button variant="secondary" onClick={() => { setSearch(searchInput); setPage(1); }}>Search</Button>
          {(search || status) && (
            <Button variant="ghost" onClick={() => {
              setSearch(""); setSearchInput(""); setStatus(""); setPage(1);
            }}>Reset</Button>
          )}
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <Loading />
        ) : !data?.items?.length ? (
          <EmptyState label="No users found" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Contact</Th>
                <Th>VIP</Th>
                <Th>Status</Th>
                <Th>Country</Th>
                <Th>Verified</Th>
                <Th>Last login</Th>
                <Th>Joined</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((u: any) => (
                <tr key={u.id} className="hover:bg-elevated/40">
                  <Td>
                    <div className="font-medium">{u.username || "(no username)"}</div>
                    <div className="text-xs text-muted font-mono">{u.id.slice(0, 10)}…</div>
                  </Td>
                  <Td>
                    <div className="text-xs">{u.email || "—"}</div>
                    <div className="text-xs text-muted">{u.phone || "—"}</div>
                  </Td>
                  <Td>{u.vipLevel}</Td>
                  <Td><Badge tone={statusTone(u.status)}>{u.status}</Badge></Td>
                  <Td className="text-muted text-xs">{u.country || "—"}</Td>
                  <Td>
                    <div className="flex gap-1">
                      {u.emailVerified && <Badge tone="success">@</Badge>}
                      {u.phoneVerified && <Badge tone="success">📱</Badge>}
                    </div>
                  </Td>
                  <Td className="text-muted text-xs">{fmtDate(u.lastLoginAt)}</Td>
                  <Td className="text-muted text-xs">{fmtDate(u.createdAt)}</Td>
                  <Td>
                    <Link to={`/users/${u.id}`} className="text-xs underline hover:text-white">View</Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {data && data.total > data.pageSize && (
          <div className="px-4 py-3 border-t border-border flex items-center justify-between text-sm">
            <span className="text-muted">Page {page} of {totalPages}</span>
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
