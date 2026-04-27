import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Save } from "lucide-react";
import { api } from "../lib/api";
import { Card, CardHeader, CardTitle, CardBody, Loading, Button, Input, Label, Select } from "../components/ui";
import PageHeader from "../components/layout/PageHeader";

// All editable settings, grouped. The key has to match what the backend uses.
const FIELDS: Array<{
  key: string; label: string; type: "string" | "boolean" | "number" | "json" | "list";
  group: string; help?: string;
}> = [
  { key: "site.name",            label: "Site name",         type: "string", group: "Branding" },
  { key: "site.tagline",         label: "Tagline",           type: "string", group: "Branding" },
  { key: "site.logoUrl",         label: "Logo URL",          type: "string", group: "Branding" },
  { key: "site.faviconUrl",      label: "Favicon URL",       type: "string", group: "Branding" },
  { key: "site.supportEmail",    label: "Support email",     type: "string", group: "Branding" },

  { key: "site.maintenanceMode", label: "Maintenance mode",  type: "boolean", group: "Operations", help: "If true, shows a maintenance page to all users" },
  { key: "site.signupEnabled",   label: "Signup enabled",    type: "boolean", group: "Operations" },
  { key: "site.kycRequired",     label: "Require KYC for withdrawals", type: "boolean", group: "Operations" },

  { key: "site.tradingFeePct",     label: "Trading fee %",       type: "number", group: "Fees" },
  { key: "site.withdrawalFeeMinUsd", label: "Min withdrawal fee (USD)", type: "number", group: "Fees" },

  { key: "site.referral.tier1Pct", label: "Referral tier-1 %",  type: "number", group: "Referrals" },
  { key: "site.referral.tier2Pct", label: "Referral tier-2 %",  type: "number", group: "Referrals" },
  { key: "site.signupBonusUsdt",   label: "Signup bonus (USDT)", type: "number", group: "Referrals" },

  { key: "site.tickerCoins",     label: "Ticker coins (comma-separated)", type: "list", group: "Display", help: "Symbols shown in the home ticker" },
  { key: "site.featuredCoins",   label: "Featured coins (comma-separated)", type: "list", group: "Display" },
];

export default function Settings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings"], queryFn: async () => (await api.get("/admin/content/settings")).data,
  });

  const [form, setForm] = useState<Record<string, any>>({});
  useEffect(() => { if (data) setForm({ ...data }); }, [data]);

  const saveMut = useMutation({
    mutationFn: async () => (await api.patch("/admin/content/settings", form)).data,
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["settings"] }); },
  });

  if (isLoading) return <div className="p-8"><Loading /></div>;

  const groups = Array.from(new Set(FIELDS.map((f) => f.group)));

  return (
    <div className="p-8">
      <PageHeader title="Site Settings" description="Branding, fees, referral rewards, maintenance, etc."
        actions={<Button onClick={() => saveMut.mutate()} loading={saveMut.isPending}><Save className="w-4 h-4" /> Save all</Button>}
      />

      <div className="grid gap-6 max-w-3xl">
        {groups.map((g) => (
          <Card key={g}>
            <CardHeader><CardTitle>{g}</CardTitle></CardHeader>
            <CardBody>
              <div className="space-y-4">
                {FIELDS.filter((f) => f.group === g).map((f) => {
                  const value = form[f.key];
                  return (
                    <div key={f.key}>
                      <Label>{f.label}</Label>
                      {f.type === "boolean" ? (
                        <Select
                          value={value ? "1" : "0"}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value === "1" })}
                        >
                          <option value="1">Enabled</option>
                          <option value="0">Disabled</option>
                        </Select>
                      ) : f.type === "number" ? (
                        <Input
                          type="number"
                          step="any"
                          value={value ?? 0}
                          onChange={(e) => setForm({ ...form, [f.key]: parseFloat(e.target.value || "0") })}
                        />
                      ) : f.type === "list" ? (
                        <Input
                          value={Array.isArray(value) ? value.join(", ") : (value || "")}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                        />
                      ) : (
                        <Input
                          value={value ?? ""}
                          onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        />
                      )}
                      {f.help && <p className="text-xs text-muted mt-1">{f.help}</p>}
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
