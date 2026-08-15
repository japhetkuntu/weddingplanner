import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { Badge } from "@ovutor/ui";
import type { Client } from "@/types";
import { useClientsStore } from "@/store/clientsStore";
import { useUiStore } from "@/store/uiStore";
import { ClientSwitcher } from "./ClientSwitcher";

const TABS = [
  { label: "Overview", segment: "overview" },
  { label: "Checklist", segment: "checklist" },
  { label: "Budget", segment: "budget" },
  { label: "RSVPs", segment: "rsvps" },
  { label: "Website", segment: "website" },
  { label: "Documents", segment: "documents" },
  { label: "Settings", segment: "settings" },
];

function daysToGo(dateIso: string) {
  const diff = Math.ceil((new Date(dateIso).getTime() - Date.now()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

export function ClientHeader({ client }: { client: Client }) {
  const setLastClientId = useUiStore((s) => s.setLastClientId);
  const clients = useClientsStore((s) => s.clients);
  useEffect(() => {
    setLastClientId(client.id);
  }, [client.id, setLastClientId]);

  return (
    <div className="mb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-[#ddd] bg-bg-warm px-4 py-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-lg">{client.coupleNames}</span>
          <span className="text-sm text-ink/60">
            {new Date(client.weddingDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} · {client.venue}
          </span>
          <span className="text-xs font-bold uppercase tracking-[.08em] text-primary">{daysToGo(client.weddingDate)} days to go</span>
          {client.isArchived ? <Badge tone="muted">Archived</Badge> : null}
        </div>
        <ClientSwitcher clients={clients.filter((c) => !c.isArchived || c.id === client.id)} current={client} />
      </div>
      <nav className="flex flex-wrap gap-1 border-b border-[#ddd]">
        {TABS.map((tab) => (
          <NavLink
            key={tab.segment}
            to={`/clients/${client.id}/${tab.segment}`}
            className={({ isActive }) =>
              clsx(
                "border-b-2 border-transparent px-3 py-2.5 text-xs font-bold uppercase tracking-[.06em] text-ink/60 hover:text-ink",
                isActive && "border-primary text-primary",
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
