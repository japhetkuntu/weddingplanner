import { useEffect, useState, type ReactNode } from "react";
import { Sidebar, type SidebarNavItem } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";
import { getChecklist } from "@/lib/api";

function daysToGo(dateIso: string) {
  const diff = Math.ceil((new Date(dateIso).getTime() - Date.now()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

export function ClientLayout({ children }: { children: ReactNode }) {
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const [openTasks, setOpenTasks] = useState(0);

  useEffect(() => {
    getChecklist().then((d) => setOpenTasks(d.tasks.filter((t) => t.status !== "done").length));
  }, []);

  if (!profile) return null;

  const items: SidebarNavItem[] = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "My Website", to: "/website" },
    { label: `My Checklist${openTasks ? ` (${openTasks})` : ""}`, to: "/checklist" },
    { label: "My Budget", to: "/budget" },
    { label: "My Documents", to: "/documents" },
    { label: "My RSVPs", to: "/rsvps" },
    { label: "Profile & Settings", to: "/profile" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <Sidebar
        portalLabel="Client Portal"
        items={items}
        topContent={
          <div className="mt-4 border-t border-[#eee] pt-3 text-sm">
            <b className="block font-display text-lg">
              {profile.partnerA.split(" ")[0]} &amp; {profile.partnerB.split(" ")[0]}
            </b>
            <small className="text-ink/50">
              {new Date(profile.weddingDate).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} ·{" "}
              {daysToGo(profile.weddingDate)} days
            </small>
          </div>
        }
        footer={
          <div className="border-t border-[#eee] pt-4 text-xs">
            <p className="mb-2 text-ink/40">View-only account</p>
            <button type="button" onClick={signOut} className="font-bold uppercase tracking-[.08em] text-primary">
              Log out
            </button>
          </div>
        }
      />
      <main className="mx-auto w-full min-w-0 max-w-[1200px] px-4 py-6 sm:px-8 sm:py-8">{children}</main>
    </div>
  );
}
