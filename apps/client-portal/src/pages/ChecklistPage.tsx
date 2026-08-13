import { useEffect, useState } from "react";
import { cn, Card, Drawer, EmptyState, LinkButton, ProgressBar, Skeleton } from "@ovutor/ui";
import { getChecklist } from "@/lib/api";
import type { ChecklistPhase, ChecklistTask } from "@/types";

function ChecklistSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-3 w-56" />
      <Skeleton className="my-2 h-9 w-72" />
      <Skeleton className="mb-6 h-4 w-full max-w-lg" />
      <Skeleton className="mb-6 h-20 w-full" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-16" />
            </div>
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 border-t border-[#eee] px-4 py-3.5">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  const [phases, setPhases] = useState<ChecklistPhase[]>([]);
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ChecklistTask | null>(null);

  useEffect(() => {
    getChecklist()
      .then((d) => {
        setPhases(d.phases);
        setTasks(d.tasks);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ChecklistSkeleton />;

  const done = tasks.filter((t) => t.status === "done").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <div className="ovutor-fade-in">
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Managed by your Ovutor planner</p>
      <h1 className="my-1.5 font-display text-4xl">Your planning roadmap</h1>
      <p className="mb-6 text-ink/60">
        {done} of {tasks.length} milestones complete. Each step shows how your celebration is coming together.
      </p>

      <Card className="mb-6">
        <b className="mb-2 block">Planning journey</b>
        <ProgressBar value={pct} className="mb-2 h-3" />
        <small className="text-ink/50">Venue secured · Core vendors confirmed · Guest experience in progress</small>
      </Card>

      {phases.length === 0 ? (
        <EmptyState title="Your roadmap is being built" message="Your planner is putting together your checklist—check back soon." />
      ) : (
      <div className="space-y-3">
        {phases.map((phase) => {
          const phaseTasks = tasks.filter((t) => t.phaseId === phase.id);
          const phaseDone = phaseTasks.filter((t) => t.status === "done").length;
          return (
            <Card key={phase.id} className="p-0">
              <div className="flex items-center justify-between border-b border-[#eee] px-4 py-3">
                <h3 className="font-display text-lg">{phase.title}</h3>
                <span className="text-xs text-ink/50">
                  {phaseDone} of {phaseTasks.length} complete
                </span>
              </div>
              {phaseTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelected(task)}
                  className="flex w-full items-start gap-3 border-t border-[#eee] px-4 py-3.5 text-left first:border-t-0 hover:bg-bg-warm"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center border text-xs",
                      task.status === "done" ? "border-primary bg-primary text-white" : "border-ink/30",
                    )}
                  >
                    {task.status === "done" ? "✓" : ""}
                  </span>
                  <div>
                    <p className="font-medium">{task.title}</p>
                    {task.note ? <p className="mt-0.5 text-sm text-ink/50">{task.note}</p> : null}
                  </div>
                </button>
              ))}
            </Card>
          );
        })}
      </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Milestone details">
        {selected ? (
          <div>
            <h2 className="mb-2 font-display text-2xl">{selected.title}</h2>
            {selected.note ? <p className="mb-4 text-ink/60">{selected.note}</p> : null}
            <div className="mb-3 border-t border-[#eee] pt-3">
              <b className="block">{selected.status === "done" ? "Confirmed" : "Status"}</b>
              <small className="text-ink/50">{selected.status === "done" ? "Completed by your planning team" : "In progress"}</small>
            </div>
            {selected.dueDate ? (
              <div className="mb-3 border-t border-[#eee] pt-3">
                <b className="block">Target date</b>
                <small className="text-ink/50">{new Date(selected.dueDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</small>
              </div>
            ) : null}
            <LinkButton to="/documents" className="w-full">
              View shared contract
            </LinkButton>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
