import { useEffect, useState } from "react";
import { Card, EmptyState, ProgressBar, Skeleton, StatCard } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";
import { getBudget, type BudgetData } from "@/lib/api";
import { formatMoney } from "@/lib/currency";

function BudgetSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="my-2 h-9 w-72" />
      <Skeleton className="mb-6 h-4 w-full max-w-md" />
      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </section>
      <Skeleton className="mb-3 h-6 w-48" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}

export default function BudgetPage() {
  const profile = useAuthStore((s) => s.profile);
  const [budget, setBudget] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    getBudget()
      .then((d) => {
        setBudget(d);
        setOpenId(d.categories[0]?.id ?? null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !budget || !profile) return <BudgetSkeleton />;

  const money = (n: number) => formatMoney(n, budget.currency);
  const pctCommitted = budget.totalBudget ? Math.round((budget.committed / budget.totalBudget) * 100) : 0;

  return (
    <div className="ovutor-fade-in">
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">
        {profile.partnerA.split(" ")[0]} &amp; {profile.partnerB.split(" ")[0]}'s plan
      </p>
      <h1 className="my-1.5 font-display text-4xl">Your wedding budget</h1>
      <p className="mb-6 text-ink/60">A clear picture of what is committed, paid, and still available.</p>

      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total budget" value={money(budget.totalBudget)} hint="Set with your planner" />
        <StatCard
          label="Committed"
          value={money(budget.committed)}
          hint={
            <div className="mt-1">
              <ProgressBar value={pctCommitted} className="mb-1" />
              {pctCommitted}% of your budget
            </div>
          }
        />
        <StatCard label="Remaining" value={money(budget.remaining)} hint="For final details and contingency" />
      </section>

      <h2 className="mb-3 font-display text-2xl">Budget categories</h2>
      {budget.categories.length === 0 ? (
        <EmptyState title="Budget details coming soon" message="Your planner hasn't broken down categories yet—check back soon." />
      ) : (
      <div className="space-y-2">
        {budget.categories.map((cat) => {
          const isOpen = openId === cat.id;
          return (
            <Card key={cat.id} className="p-0">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : cat.id)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left"
              >
                <span className="font-bold">{cat.name}</span>
                <span className="text-sm text-ink/50">
                  {money(cat.committed)} committed · {cat.trend === "up" ? "+" : "−"}
                </span>
              </button>
              {isOpen ? (
                <div>
                  {cat.expenses.map((e) => (
                    <div key={e.id} className="grid grid-cols-1 gap-2 border-t border-[#eee] px-4 py-3 sm:grid-cols-[1fr_auto_auto_auto]">
                      <div>
                        <b>{e.vendor}</b>
                        <small className="mt-0.5 block text-ink/50">{e.note}</small>
                      </div>
                      <div className="text-sm">
                        <span className="block text-ink/50">Budgeted</span>
                        <b>{money(e.budgeted)}</b>
                      </div>
                      <div className="text-sm">
                        <span className="block text-ink/50">Paid</span>
                        <b>{e.paid > 0 ? money(e.paid) : "—"}</b>
                      </div>
                      <div className="text-sm">
                        <span className="block text-ink/50">{e.nextDue ? "Next due" : "Remaining"}</span>
                        <b>{e.nextDue ? new Date(e.nextDue).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : money(e.budgeted - e.paid)}</b>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
