import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Badge, DataGrid, Input, LinkButton, Select, Skeleton, Toast, type DataGridColumn } from "@ovutor/ui";
import { useClientsStore } from "@/store/clientsStore";
import { archiveClient, unarchiveClient, errorMessage } from "@/lib/api";
import type { Client, ClientStatus } from "@/types";

function ClientsListSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-3 w-56" />
      <Skeleton className="my-2 h-9 w-40" />
      <div className="my-5 flex flex-wrap gap-2">
        <Skeleton className="h-11 min-w-[220px] flex-1" />
        <Skeleton className="h-11 w-36" />
        <Skeleton className="h-11 w-32" />
      </div>
      <div className="border border-[#ddd]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-[#eee] px-4 py-4 first:border-t-0">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="hidden h-4 w-20 sm:block" />
            <Skeleton className="hidden h-4 w-40 md:block" />
            <Skeleton className="hidden h-4 w-24 lg:block" />
            <Skeleton className="ml-auto h-6 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<ClientStatus, string> = {
  "on-track": "On track",
  attention: "Attention",
  "early-planning": "Early planning",
};

const STATUS_TONE: Record<ClientStatus, "success" | "primary" | "muted"> = {
  "on-track": "success",
  attention: "primary",
  "early-planning": "muted",
};

function daysToGo(dateIso: string) {
  const diff = Math.ceil((new Date(dateIso).getTime() - Date.now()) / 86_400_000);
  if (diff <= 0) return "This week";
  const months = Math.round(diff / 30);
  return months >= 1 ? `${months} month${months > 1 ? "s" : ""} to go` : `${diff} days to go`;
}

export default function ClientsListPage() {
  const navigate = useNavigate();
  const clients = useClientsStore((s) => s.clients);
  const loading = useClientsStore((s) => s.loading);
  const loaded = useClientsStore((s) => s.loaded);
  const fetch = useClientsStore((s) => s.fetch);
  const upsertClient = useClientsStore((s) => s.upsert);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ClientStatus | "all">("all");
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  useEffect(() => {
    fetch();
  }, [fetch]);

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  function flashError(message: string) {
    setError(message);
    window.setTimeout(() => setError(null), 3200);
  }

  const active = useMemo(() => clients.filter((c) => !c.isArchived), [clients]);
  const archived = useMemo(() => clients.filter((c) => c.isArchived), [clients]);
  const tabClients = tab === "active" ? active : archived;

  const filtered = useMemo(() => {
    return tabClients.filter((c) => {
      const matchesQuery =
        query.trim().length === 0 ||
        c.coupleNames.toLowerCase().includes(query.toLowerCase()) ||
        c.venue.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || c.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [tabClients, query, status]);

  async function handleArchive(c: Client) {
    setWorkingId(c.id);
    try {
      upsertClient(await archiveClient(c.id));
      flashToast(`${c.coupleNames} archived`);
    } catch (e) {
      flashError(errorMessage(e, "Couldn't archive that client — please try again."));
    } finally {
      setWorkingId(null);
    }
  }

  async function handleUnarchive(c: Client) {
    setWorkingId(c.id);
    try {
      upsertClient(await unarchiveClient(c.id));
      flashToast(`${c.coupleNames} restored to active clients`);
    } catch (e) {
      flashError(errorMessage(e, "Couldn't unarchive that client — please try again."));
    } finally {
      setWorkingId(null);
    }
  }

  const columns: DataGridColumn<Client>[] = [
    {
      key: "couple",
      header: "Couple & venue",
      render: (c) => (
        <div>
          <b>{c.coupleNames}</b>
          <small className="mt-0.5 block text-ink/50">{c.venue}</small>
        </div>
      ),
    },
    { key: "planning", header: "Planning", render: (c) => `${c.planningPercent}% complete`, width: "w-[120px]", hideBelow: "sm" },
    {
      key: "attention",
      header: "Next attention",
      render: (c) => (
        <div>
          <b>{c.nextAttention}</b>
        </div>
      ),
      hideBelow: "md",
    },
    { key: "wedding", header: "Wedding", render: (c) => daysToGo(c.weddingDate), width: "w-[140px]", hideBelow: "lg" },
    {
      key: "status",
      header: "Status",
      render: (c) => <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>,
      width: "w-[140px]",
    },
    {
      key: "action",
      header: "",
      render: (c) =>
        tab === "active" ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleArchive(c);
            }}
            disabled={workingId === c.id}
            className="text-xs font-bold uppercase tracking-[.06em] text-ink/50 hover:text-primary disabled:opacity-40"
          >
            Archive
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleUnarchive(c);
            }}
            disabled={workingId === c.id}
            className="text-xs font-bold uppercase tracking-[.06em] text-primary hover:text-ink disabled:opacity-40"
          >
            Unarchive
          </button>
        ),
      width: "w-[100px]",
    },
  ];

  if (loading && !loaded) return <ClientsListSkeleton />;

  return (
    <div className="ovutor-fade-in">
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Portfolio · {active.length} active weddings</p>
      <h1 className="my-1.5 font-display text-4xl">Clients</h1>

      <div className="mt-5 flex gap-4 border-b border-[#ddd]">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={clsx(
            "border-b-2 pb-2.5 text-sm font-bold uppercase tracking-[.06em]",
            tab === "active" ? "border-primary text-primary" : "border-transparent text-ink/50 hover:text-ink",
          )}
        >
          Active ({active.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("archived")}
          className={clsx(
            "border-b-2 pb-2.5 text-sm font-bold uppercase tracking-[.06em]",
            tab === "archived" ? "border-primary text-primary" : "border-transparent text-ink/50 hover:text-ink",
          )}
        >
          Archived ({archived.length})
        </button>
      </div>

      <div className="my-5 flex flex-wrap gap-2">
        <Input
          placeholder="Search couples, venue, or date"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-w-[220px] flex-1"
        />
        <Select value={status} onChange={(e) => setStatus(e.target.value as ClientStatus | "all")} className="w-auto">
          <option value="all">All statuses</option>
          <option value="on-track">On track</option>
          <option value="attention">Attention</option>
          <option value="early-planning">Early planning</option>
        </Select>
        <LinkButton to="/clients/new">Add client</LinkButton>
      </div>

      <DataGrid
        columns={columns}
        rows={filtered}
        rowKey={(c) => c.id}
        onRowClick={(c) => navigate(`/clients/${c.id}/overview`)}
        emptyMessage={tab === "active" ? "No clients match your search." : "No archived clients."}
      />

      <Toast open={!!toast}>{toast}</Toast>
      <Toast open={!!error} tone="error">{error}</Toast>
    </div>
  );
}
