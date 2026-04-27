import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { fmtNumber, fmtDate } from "../lib/utils";
import {
  Card, Loading, EmptyState, Table, Th, Td, Badge, statusTone,
  Button, Select,
} from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

export default function BuyOrders() {
  const [status, setStatus] = useState("PENDING");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["buy-orders", status],
    queryFn: async () => (await api.get("/admin/finance-ops/buy-orders", { params: status ? { status } : {} })).data,
  });

  const confirmMut = useMutation({
    mutationFn: async (id: string) => (await api.post(`/admin/finance-ops/buy-orders/${id}/confirm`)).data,
    onSuccess: () => { toast.success("Order confirmed; user credited."); qc.invalidateQueries({ queryKey: ["buy-orders"] }); },
  });

  return (
    <div className="p-8">
      <PageHeader title="Buy Orders" description="Instant fiat → crypto purchases"
        actions={
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        }
      />
      <Card>
        {isLoading ? <Loading /> : !data?.length ? <EmptyState /> : (
          <Table>
            <thead><tr>
              <Th>User</Th><Th>Crypto</Th><Th>Fiat paid</Th><Th>Rate</Th><Th>Method</Th>
              <Th>Status</Th><Th>When</Th><Th></Th>
            </tr></thead>
            <tbody>
              {data.map((o: any) => (
                <tr key={o.id} className="hover:bg-elevated/40">
                  <Td><Link to={`/users/${o.userId}`} className="hover:underline">{o.user?.username || o.user?.email}</Link></Td>
                  <Td>{fmtNumber(o.cryptoAmount, 6)} {o.currencySymbol}</Td>
                  <Td>{fmtNumber(o.fiatAmount, 2)} {o.fiatSymbol}</Td>
                  <Td className="text-xs">{fmtNumber(o.rate, 2)}</Td>
                  <Td className="text-xs text-muted">{o.paymentMethod || "—"}</Td>
                  <Td><Badge tone={statusTone(o.status)}>{o.status}</Badge></Td>
                  <Td className="text-xs text-muted">{fmtDate(o.createdAt)}</Td>
                  <Td>
                    {o.status === "PENDING" && (
                      <Button size="sm" variant="success" loading={confirmMut.isPending}
                        onClick={() => confirmMut.mutate(o.id)}>
                        Confirm payment
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
