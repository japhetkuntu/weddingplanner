import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, EmptyState, Skeleton, StatCard } from "@ovutor/ui";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { getChecklist, getRsvps, getWebsiteSections, getClientActivity, getBudget, type ClientActivityData } from "@/lib/api";
import { formatMoney } from "@/lib/currency";
import type { BudgetCategory, ChecklistTask, RsvpGuest, WebsiteSection } from "@/types";

function OverviewSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="my-2 h-9 w-64" />
      <Skeleton className="mb-6 h-4 w-48" />
      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </section>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <Skeleton className="mb-3 h-6 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mb-3 h-14" />
          ))}
        </Card>
        <Card>
          <Skeleton className="mb-3 h-6 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="mb-3 h-14" />
          ))}
        </Card>
      </div>
    </div>
  );
}

export default function ClientOverviewPage() {
  const client = useCurrentClient();
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [rsvps, setRsvps] = useState<RsvpGuest[]>([]);
  const [sections, setSections] = useState<WebsiteSection[]>([]);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([]);
  const [activityData, setActivityData] = useState<ClientActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    Promise.all([
      getChecklist(client.id).then((d) => setTasks(d.tasks)),
      getRsvps(client.id).then(setRsvps),
      getWebsiteSections(client.id).then(setSections),
      getBudget(client.id).then(setBudgetCategories),
      getClientActivity(client.id).then(setActivityData),
    ]).finally(() => setLoading(false));
  }, [client]);

  if (!client) return null;
  if (loading || !activityData) return <OverviewSkeleton />;

  const done = tasks.filter((t) => t.status === "done").length;
  const checklistPct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const responded = rsvps.filter((r) => r.status !== "awaiting").length;
  const awaiting = rsvps.filter((r) => r.status === "awaiting").length;

  const hasDraft = sections.some((s) => s.status === "draft");
  const budgetPaid = budgetCategories.reduce((sum, c) => sum + c.expenses.reduce((s, e) => s + e.paid, 0), 0);

  return (
    <div className="ovutor-fade-in">
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Wedding overview</p>
      <h1 className="my-1.5 font-display text-4xl">{client.coupleNames}</h1>
      <p className="mb-6 text-ink/60">{client.venue}</p>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Checklist" value={`${checklistPct}%`} hint={`${done} of ${tasks.length} tasks complete`} />
        <StatCard
          label="Budget"
          value={formatMoney(budgetPaid, client.currency)}
          hint={`of ${formatMoney(client.budgetTotal, client.currency)} target`}
        />
        <StatCard label="RSVPs" value={`${responded} / ${rsvps.length}`} hint={`${awaiting} awaiting response`} />
        <StatCard label="Website" value={hasDraft ? "Draft edits" : "Published"} hint="View editor" />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-2.5 font-display text-2xl">Next milestones</h2>
          {activityData.milestones.length === 0 ? (
            <EmptyState compact title="Nothing due soon" message="Checklist milestones will show up here as due dates approach." />
          ) : (
            activityData.milestones.map((m, i) => (
              <Link key={i} to={`/clients/${client.id}/checklist`} className="block border-t border-[#ddd] py-3.5 first:border-t-0 hover:bg-bg-warm">
                <span className="text-[10px] font-bold uppercase text-primary">{m.tag}</span>
                <br />
                <b>{m.title}</b>
                <small className="mt-1 block text-ink/50">
                  Due {new Date(m.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </small>
              </Link>
            ))
          )}
        </Card>

        <Card>
          <h2 className="mb-2.5 font-display text-2xl">Recent activity</h2>
          {activityData.activity.length === 0 ? (
            <EmptyState compact title="It's quiet" message="Checklist, budget, and RSVP updates will appear here." />
          ) : (
            activityData.activity.map((event, i) => (
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
