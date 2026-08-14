import { useEffect, type ReactNode } from "react";
import { useLocation, useParams } from "react-router-dom";
import { LinkButton, Skeleton } from "@ovutor/ui";
import { useClientsStore } from "@/store/clientsStore";
import { ClientHeader } from "./ClientHeader";

const SECTION_LABEL: Record<string, string> = {
  overview: "overview",
  checklist: "checklist",
  budget: "budget",
  rsvps: "RSVPs",
  website: "wedding website",
  documents: "documents",
  settings: "settings",
};

function sectionFromPath(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "";
  return SECTION_LABEL[segment] ?? "workspace";
}

function ClientShellSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <div className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-[#ddd] bg-bg-warm px-4 py-3">
          <div className="flex flex-wrap items-baseline gap-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="flex gap-4 border-b border-[#ddd] pb-2.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-48" />
      </div>
    </div>
  );
}

function NoClientsYet({ section }: { section: string }) {
  return (
    <div className="ovutor-fade-in grid min-h-[65vh] place-items-center px-4 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-primary/25 bg-bg-warm">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 20.5s-8-4.9-8-11.2A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8 3.2c0 6.3-8 11.2-8 11.2Z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
              className="text-primary"
            />
          </svg>
        </div>
        <h1 className="font-display text-3xl">No clients yet</h1>
        <p className="mt-2.5 leading-relaxed text-ink/60">
          Add your first couple to start building their {section} — checklist, budget, guest list, and wedding website all live here once
          their workspace is set up.
        </p>
        <LinkButton to="/clients/new" className="mt-6 inline-flex">
          + Add your first client
        </LinkButton>
      </div>
    </div>
  );
}

function ClientNotFound() {
  return (
    <div className="ovutor-fade-in grid min-h-[65vh] place-items-center px-4 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-primary/25 bg-bg-warm">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" className="text-primary" />
            <path d="M9.5 9.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="text-primary" />
          </svg>
        </div>
        <h1 className="font-display text-3xl">We couldn't find that client</h1>
        <p className="mt-2.5 leading-relaxed text-ink/60">
          They may have been removed, or this link is out of date. Head back to your client list to pick up where you left off.
        </p>
        <LinkButton to="/clients" className="mt-6 inline-flex">
          View all clients
        </LinkButton>
      </div>
    </div>
  );
}

export function ClientPageShell({ children }: { children: ReactNode }) {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const clients = useClientsStore((s) => s.clients);
  const loading = useClientsStore((s) => s.loading);
  const loaded = useClientsStore((s) => s.loaded);
  const fetch = useClientsStore((s) => s.fetch);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const client = clientId ? clients.find((c) => c.id === clientId) : undefined;

  if (!client && (loading || !loaded)) {
    return <ClientShellSkeleton />;
  }

  if (!client) {
    return clients.length === 0 ? <NoClientsYet section={sectionFromPath(location.pathname)} /> : <ClientNotFound />;
  }

  return (
    <div>
      <ClientHeader client={client} />
      {children}
    </div>
  );
}
