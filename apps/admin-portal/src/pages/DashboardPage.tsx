import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, EmptyState, LinkButton, Skeleton, StatCard } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";
import { useClientsStore } from "@/store/clientsStore";
import { getDashboard, type DashboardData } from "@/lib/api";

function DashboardSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Skeleton className="h-3 w-40" />
          <Skeleton className="my-2 h-9 w-72" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-11 w-32" />
      </div>
      <section className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </section>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <Card>
          <Skeleton className="mb-4 h-6 w-48" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="mb-3 h-14" />
          ))}
        </Card>
        <Card>
          <Skeleton className="mb-4 h-6 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mb-3 h-12" />
          ))}
        </Card>
      </div>
    </div>
  );
}

const AREA_PATH: Record<string, string> = {
  checklist: "checklist",
  budget: "budget",
  rsvps: "rsvps",
  website: "website",
};

export default function DashboardPage() {
  const admin = useAuthStore((s) => s.user);
  const fetchClients = useClientsStore((s) => s.fetch);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
    getDashboard()
      .then(setDashboard)
      .finally(() => setLoading(false));
  }, [fetchClients]);

  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading || !dashboard) return <DashboardSkeleton />;

  return (
    <div className="ovutor-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">{today}</p>
          <h1 className="my-1.5 font-display text-4xl">Good morning, {admin?.name ?? "there"}</h1>
          <p className="text-ink/60">You have {dashboard.attentionItems.length} items that need attention today.</p>
        </div>
        <LinkButton to="/clients/new">Add client</LinkButton>
      </div>

      <section className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Active weddings" value={dashboard.metrics.activeWeddings} />
        <StatCard label="Due this week" value={dashboard.metrics.dueThisWeek} />
        <StatCard label="Overdue" value={dashboard.metrics.overdue} valueClassName="text-primary" hint="Open checklist tasks" />
        <StatCard label="RSVP deadlines" value={dashboard.metrics.rsvpDeadlines} />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <Card>
          <h2 className="mb-2.5 font-display text-2xl">Attention required</h2>
          {dashboard.attentionItems.length === 0 ? (
            <EmptyState compact title="All caught up" message="Nothing needs your attention right now." />
          ) : (
            dashboard.attentionItems.map((item) => (
              <Link
                key={`${item.clientId}-${item.title}`}
                to={`/clients/${item.clientId}/${AREA_PATH[item.area] ?? "overview"}`}
                className="block border-t border-[#ddd] py-3.5 first:border-t-0 hover:bg-bg-warm"
              >
                <span className="text-[10px] font-bold text-primary">{item.tag}</span>
                <br />
                <b>{item.title}</b>
                <small className="mt-1 block text-ink/50">{item.detail}</small>
              </Link>
            ))
          )}
        </Card>

        <Card>
          <h2 className="mb-2.5 font-display text-2xl">Today &amp; this week</h2>
          {dashboard.upcomingMilestones.length === 0 ? (
            <EmptyState compact title="Nothing due soon" message="Upcoming milestones will show up here." />
          ) : (
            dashboard.upcomingMilestones.slice(0, 3).map((m) => (
              <Link
                key={`${m.clientId}-${m.title}`}
                to={`/clients/${m.clientId}/checklist`}
                className="block border-t border-[#ddd] py-3.5 first:border-t-0 hover:bg-bg-warm"
              >
                <b>{m.title}</b>
                <small className="mt-1 block text-ink/50">
                  {m.clientCoupleNames} · {m.tag}
                </small>
              </Link>
            ))
          )}

          <h2 className="mb-2.5 mt-6 font-display text-2xl">Recent activity</h2>
          {dashboard.recentActivity.length === 0 ? (
            <EmptyState compact title="It's quiet" message="Activity from your clients will appear here." />
          ) : (
            dashboard.recentActivity.slice(0, 3).map((event, i) => (
              <div key={i} className="border-t border-[#ddd] py-3.5 first:border-t-0">
                {event.message}
                <small className="mt-1 block text-ink/50">
                  {new Date(event.timestampUtc).toLocaleString(undefined, { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" })}
                </small>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
