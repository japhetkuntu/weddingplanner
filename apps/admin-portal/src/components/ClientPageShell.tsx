import { useEffect, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { Skeleton } from "@ovutor/ui";
import { useClientsStore } from "@/store/clientsStore";
import { ClientHeader } from "./ClientHeader";

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

export function ClientPageShell({ children }: { children: ReactNode }) {
  const { clientId } = useParams<{ clientId: string }>();
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
    return <p className="text-sm text-ink/60">We couldn't find that client.</p>;
  }

  return (
    <div>
      <ClientHeader client={client} />
      {children}
    </div>
  );
}
