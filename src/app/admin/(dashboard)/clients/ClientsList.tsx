"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, FolderKanban, Plus, Search, Wallet } from "lucide-react";
import { Badge, Button, Card, Chip, EmptyState, Input, PageHeader, StatCard } from "@/components/admin/ui";
import { MoneyStack } from "@/components/admin/money";
import { CLIENT_STATUS_TONE } from "@/components/admin/status";
import { CLIENT_STATUS_LABELS, clientName, emptyClientInput } from "@/lib/clients";
import { sumByCurrency } from "@/lib/finance";
import ClientModal from "./ClientModal";
import type { ClientListItem } from "./actions";

const FILTERS = ["active", "archived", "all"] as const;
type Filter = (typeof FILTERS)[number];
const FILTER_LABELS: Record<Filter, string> = { active: "Active", archived: "Archived", all: "All" };

export default function ClientsList({ clients }: { clients: ClientListItem[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("active");
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

  const counts = useMemo(
    () => ({
      active: clients.filter((c) => c.status === "active").length,
      archived: clients.filter((c) => c.status === "archived").length,
      all: clients.length,
    }),
    [clients]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return clients.filter((client) => {
      if (filter !== "all" && client.status !== filter) return false;
      return !q || [client.company, client.contact_name, client.email, client.phone].some((value) => value.toLowerCase().includes(q));
    });
  }, [clients, filter, query]);

  const outstanding = useMemo(
    () => sumByCurrency(clients.flatMap((client) => client.outstanding), (line) => line.currency, (line) => line.amount),
    [clients]
  );
  const openProjects = clients.reduce((total, client) => total + client.openProjects, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clients"
        description="Everyone you work for — their details, projects and invoices in one place."
        action={
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
            New client
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard label="Active clients" value={counts.active} icon={Building2} hint={counts.archived > 0 ? `${counts.archived} archived` : undefined} />
        <StatCard label="Projects in progress" value={openProjects} icon={FolderKanban} />
        <div className="col-span-2 lg:col-span-1">
          <StatCard label="Still to collect from clients" value={<MoneyStack lines={outstanding} />} icon={Wallet} emphasis hint="Unpaid balance on sent invoices" />
        </div>
      </div>

      {clients.length === 0 ? (
        <Card>
          <EmptyState icon={Building2} title="No clients yet" description="Add your first client — you can then pick them on an invoice and their details fill in by themselves." />
          <div className="flex justify-center pb-10">
            <Button onClick={() => setAdding(true)}>
              <Plus className="h-4 w-4" />
              New client
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter clients">
              {FILTERS.filter((f) => f !== "archived" || counts.archived > 0).map((f) => (
                <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>
                  {FILTER_LABELS[f]}
                  <span className="ml-1.5 tabular-nums text-stone-400">{counts[f]}</span>
                </Chip>
              ))}
            </div>
            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <Input type="search" aria-label="Search clients" placeholder="Search name, email or phone" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          <Card className="overflow-hidden">
            {visible.length === 0 ? (
              <EmptyState icon={Search} title="Nothing matches" description="Try a different filter or search term." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs text-stone-500">
                      <th scope="col" className="px-5 py-3 font-medium">Client</th>
                      <th scope="col" className="px-3 py-3 font-medium">Contact</th>
                      <th scope="col" className="px-3 py-3 font-medium">Projects</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">Invoiced</th>
                      <th scope="col" className="px-3 py-3 text-right font-medium">To collect</th>
                      <th scope="col" className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {visible.map((client) => (
                      <tr key={client.id} className="transition-colors duration-150 hover:bg-stone-50">
                        <td className="max-w-[260px] px-5 py-3.5">
                          <Link
                            href={`/admin/clients/${client.id}`}
                            className="block truncate rounded font-medium text-stone-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
                          >
                            {clientName(client)}
                          </Link>
                          {client.company && client.contact_name && <span className="block truncate text-xs text-stone-500">{client.contact_name}</span>}
                        </td>
                        <td className="max-w-[220px] px-3 py-3.5 text-stone-600">
                          <span className="block truncate">{client.email || <span className="text-stone-400">No email</span>}</span>
                          {client.phone && <span className="block truncate text-xs text-stone-500">{client.phone}</span>}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3.5 tabular-nums text-stone-600">
                          {client.projects === 0 ? <span className="text-stone-400">None</span> : `${client.openProjects} open · ${client.projects} total`}
                        </td>
                        <td className="px-3 py-3.5 text-right tabular-nums text-stone-700">
                          <MoneyStack lines={client.invoiced} className="items-end" />
                        </td>
                        <td className="px-3 py-3.5 text-right font-medium tabular-nums text-stone-900">
                          <MoneyStack lines={client.outstanding} className="items-end" />
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge tone={CLIENT_STATUS_TONE[client.status]}>{CLIENT_STATUS_LABELS[client.status]}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {adding && (
        <ClientModal
          initial={emptyClientInput()}
          onClose={() => setAdding(false)}
          onSaved={(id) => {
            setAdding(false);
            // Straight to the new client's page, where projects and invoices are added
            router.push(`/admin/clients/${id}`);
          }}
        />
      )}
    </div>
  );
}
