import { useEffect, type ReactNode } from "react";
import { Sidebar, type SidebarNavItem } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useClientsStore } from "@/store/clientsStore";

export function AdminLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const lastClientId = useUiStore((s) => s.lastClientId);
  const clients = useClientsStore((s) => s.clients);
  const fetchClients = useClientsStore((s) => s.fetch);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // The sidebar always needs a real client to link to — fall back to the first client in the
  // portfolio until the admin has actually opened one, so these links never point at an empty id.
  const activeClientId = lastClientId || clients[0]?.id || "";

  const items: SidebarNavItem[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Clients", to: "/clients" },
    { label: "Checklist", to: `/clients/${activeClientId}/checklist` },
    { label: "Budget", to: `/clients/${activeClientId}/budget` },
    { label: "Website", to: `/clients/${activeClientId}/website` },
    { label: "Documents", to: `/clients/${activeClientId}/documents` },
    { label: "RSVPs", to: `/clients/${activeClientId}/rsvps` },
    { label: "Profile & Settings", to: "/settings" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <Sidebar
        portalLabel="Admin Portal"
        items={items}
        footer={
          user ? (
            <div className="border-t border-[#eee] pt-4 text-xs text-ink/60">
              <p className="font-bold text-ink">{user.name}</p>
              <p>{user.role}</p>
              <button type="button" onClick={signOut} className="mt-2 font-bold uppercase tracking-[.08em] text-primary">
                Sign out
              </button>
            </div>
          ) : null
        }
      />
      <main className="mx-auto w-full min-w-0 max-w-[1400px] px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
