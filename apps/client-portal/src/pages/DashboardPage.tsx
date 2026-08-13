import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, EmptyState, LinkButton, Skeleton, StatCard } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";
import { getDashboard, type DashboardData } from "@/lib/api";

function daysToGo(dateIso: string) {
  const diff = Math.ceil((new Date(dateIso).getTime() - Date.now()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

function DashboardSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="my-2 h-9 w-72" />
      <Skeleton className="mb-6 h-4 w-64" />
      <Skeleton className="mb-6 h-24 w-full" />
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </section>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <Skeleton className="mb-3 h-6 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mb-3 h-14" />
          ))}
        </Card>
        <Card>
          <Skeleton className="mb-3 h-6 w-36" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mb-3 h-14" />
          ))}
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const profile = useAuthStore((s) => s.profile);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .finally(() => setLoading(false));
  }, []);

  if (!profile || loading || !dashboard) return <DashboardSkeleton />;

  const nextDecision = dashboard.upcoming[0];
  const websiteStatus = dashboard.metrics.websiteLive ? "Published" : "Draft edits";

  return (
    <div className="ovutor-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Your wedding workspace</p>
          <h1 className="my-1.5 font-display text-4xl">
            Good day, {profile.partnerA.split(" ")[0]} &amp; {profile.partnerB.split(" ")[0]}.
          </h1>
          <p className="text-ink/60">
            Your wedding at {profile.venue} is in {daysToGo(profile.weddingDate)} days. You're making lovely progress.
          </p>
        </div>
      </div>

      {nextDecision ? (
        <section className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-ink p-6 text-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-white/70">
              Your next decision · Due {new Date(nextDecision.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
            <h2 className="my-1.5 font-display text-2xl">{nextDecision.title}</h2>
            <p className="max-w-xl text-white/80">{nextDecision.detail}</p>
          </div>
          <LinkButton to="/checklist" variant="dark" className="border-white">
            Review choices
          </LinkButton>
        </section>
      ) : null}

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Checklist" value={`${dashboard.metrics.checklistDone} / ${dashboard.metrics.checklistTotal}`} hint="tasks complete" />
        <StatCard label="Budget" value={`$${dashboard.metrics.budgetRemaining.toLocaleString()}`} hint="remaining to plan" />
        <StatCard label="RSVPs" value={`${dashboard.metrics.rsvpAttending} / ${dashboard.metrics.rsvpTotal}`} hint="responded" />
        <StatCard label="Wedding website" value={websiteStatus} valueClassName="text-primary" hint="view your site" />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-2.5 font-display text-2xl">Coming up</h3>
          {dashboard.upcoming.length === 0 ? (
            <EmptyState compact title="Nothing on your plate" message="Upcoming decisions and tasks will show up here." />
          ) : (
            dashboard.upcoming.map((item) => (
              <div key={item.id} className="flex gap-4 border-t border-[#ddd] py-3.5 first:border-t-0">
                <div className="w-16 shrink-0 text-xs font-bold uppercase text-ink/50">
                  {new Date(item.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" })}
                </div>
                <div>
                  <b>{item.title}</b>
                  <small className="mt-0.5 block text-ink/50">{item.detail}</small>
                </div>
              </div>
            ))
          )}
        </Card>

        <Card>
          <h3 className="mb-2.5 font-display text-2xl">Shared updates</h3>
          {dashboard.updates.length === 0 ? (
            <EmptyState compact title="No updates yet" message="Your planner's shared updates will appear here." />
          ) : (
            dashboard.updates.map((event) => (
              <div key={event.id} className="flex gap-3 border-t border-[#ddd] py-3.5 first:border-t-0">
                <span className="mt-1.5 h-2.5 w-2.5 shrink-0 bg-primary" />
                <div>
                  <b>{event.message}</b>
                  <small className="mt-0.5 block text-ink/50">
                    {new Date(event.timestamp).toLocaleString(undefined, { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" })}
                  </small>
                </div>
              </div>
            ))
          )}
          <Link to="/documents" className="mt-3 inline-block text-xs font-bold uppercase tracking-[.06em] text-primary">
            View all documents
          </Link>
        </Card>
      </div>
    </div>
  );
}
