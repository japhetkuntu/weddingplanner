import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Button, Card, Drawer, EmptyState, Input, Label, Modal, ProgressBar, Skeleton, Textarea, Toast } from "@ovutor/ui";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import {
  getChecklist,
  addPhase as apiAddPhase,
  updatePhase as apiUpdatePhase,
  deletePhase as apiDeletePhase,
  addTask as apiAddTask,
  updateTask as apiUpdateTask,
  toggleTask as apiToggleTask,
  deleteTask as apiDeleteTask,
  errorMessage,
} from "@/lib/api";
import type { ChecklistPhase, ChecklistTask } from "@/types";

const PRIORITY_LABEL: Record<NonNullable<ChecklistTask["priority"]>, string> = {
  "at-risk": "At risk",
  "due-soon": "Due soon",
  waiting: "Waiting",
};

interface DeleteCandidate {
  type: "phase" | "task";
  id: string;
  label: string;
}

function ChecklistSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-0">
            <div className="flex items-center justify-between px-4 py-3">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-20" />
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

export default function ClientChecklistPage() {
  const client = useCurrentClient();
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [phases, setPhases] = useState<ChecklistPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<ChecklistTask | null>(null);
  const [editingPhase, setEditingPhase] = useState<ChecklistPhase | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DeleteCandidate | null>(null);
  const [addingPhase, setAddingPhase] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    getChecklist(client.id)
      .then((d) => {
        setPhases(d.phases);
        setTasks(d.tasks);
      })
      .finally(() => setLoading(false));
  }, [client]);

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  function flashError(message: string) {
    setError(message);
    window.setTimeout(() => setError(null), 3200);
  }

  async function toggleTask(id: string) {
    try {
      const updated = await apiToggleTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      flashToast("Saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't update that task — please try again."));
    }
  }

  async function saveTask(updated: ChecklistTask) {
    try {
      const saved = await apiUpdateTask(updated.id, { title: updated.title.trim() || "New task", note: updated.note, dueDate: updated.dueDate });
      setTasks((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
      setEditingTask(null);
      flashToast("Saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save that task — please try again."));
    }
  }

  async function addTaskToPhase(phaseId: string) {
    try {
      const task = await apiAddTask(phaseId);
      setTasks((prev) => [...prev, task]);
      setEditingTask(task);
    } catch (e) {
      flashError(errorMessage(e, "Couldn't add a task — please try again."));
    }
  }

  async function addPhase() {
    if (!client) return;
    const title = newPhaseTitle.trim();
    if (!title) {
      flashError("Give the checklist a name before adding it.");
      return;
    }
    setAddingPhase(true);
    try {
      const phase = await apiAddPhase(client.id, title);
      setPhases((prev) => [...prev, phase]);
      setNewPhaseTitle("");
      setShowAddPhase(false);
      flashToast("Checklist added");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't add that checklist — please try again."));
    } finally {
      setAddingPhase(false);
    }
  }

  async function savePhase(updated: ChecklistPhase) {
    try {
      const saved = await apiUpdatePhase(updated.id, updated.title.trim() || updated.title, updated.description);
      setPhases((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      setEditingPhase(null);
      flashToast("Saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save that checklist — please try again."));
    }
  }

  function requestDelete(candidate: DeleteCandidate) {
    setConfirmDelete(candidate);
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      if (confirmDelete.type === "phase") {
        await apiDeletePhase(confirmDelete.id);
        setPhases((prev) => prev.filter((p) => p.id !== confirmDelete.id));
        setTasks((prev) => prev.filter((t) => t.phaseId !== confirmDelete.id));
        setEditingPhase(null);
      } else {
        await apiDeleteTask(confirmDelete.id);
        setTasks((prev) => prev.filter((t) => t.id !== confirmDelete.id));
        setEditingTask(null);
      }
      setConfirmDelete(null);
      flashToast("Deleted");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't delete that — please try again."));
    } finally {
      setDeleting(false);
    }
  }

  const priorityTasks = useMemo(() => tasks.filter((t) => t.priority).slice(0, 4), [tasks]);
  const filtered = useMemo(
    () => (search.trim() ? tasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase())) : tasks),
    [tasks, search],
  );

  if (!client) return null;
  if (loading) return <ChecklistSkeleton />;

  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="ovutor-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Checklist</h1>
          <p className="text-ink/60">
            {done} of {tasks.length} tasks complete
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAddPhase((v) => !v)}>
          + Add checklist
        </Button>
      </div>

      {showAddPhase ? (
        <Card className="mb-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-[.06em] text-ink/60">New checklist</p>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Checklist name, e.g. Honeymoon planning"
              value={newPhaseTitle}
              onChange={(e) => setNewPhaseTitle(e.target.value)}
              className="min-w-[220px] flex-1"
              autoFocus
            />
            <Button onClick={addPhase} loading={addingPhase}>Add checklist</Button>
          </div>
        </Card>
      ) : null}

      {priorityTasks.length > 0 ? (
        <section className="mb-6">
          <h2 className="mb-1 font-display text-xl">Keep these moving</h2>
          <p className="mb-3 text-sm text-ink/50">Tasks with the highest risk of becoming overdue</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {priorityTasks.map((t) => (
              <Card key={t.id} className={t.priority === "at-risk" ? "border-primary/40" : undefined}>
                <p className="text-[10px] font-bold uppercase tracking-[.08em] text-primary">{PRIORITY_LABEL[t.priority!]}</p>
                <p className="my-1.5 font-display text-lg">{t.title}</p>
                {t.note ? <p className="text-sm text-ink/60">{t.note}</p> : null}
                {t.dueDate ? <p className="mt-2 text-xs font-bold text-ink/50">Due {new Date(t.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p> : null}
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {phases.length === 0 ? (
        <EmptyState
          title="No checklist yet"
          message="Start this couple's plan by adding a checklist—group tasks like ceremony, reception, or attire."
          action={
            <Button size="sm" onClick={() => setShowAddPhase(true)}>
              + Add checklist
            </Button>
          }
        />
      ) : (
        <>
          <section className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-xl">
              All planning tasks <span className="text-sm font-normal text-ink/50">· {tasks.length} total</span>
            </h2>
            <Input placeholder="Search tasks, vendors, notes" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-[280px]" />
          </section>

          <div className="space-y-3">
            {phases.map((phase) => {
          const phaseTasks = filtered.filter((t) => t.phaseId === phase.id);
          // Hide only when a search is filtering results — otherwise an empty, newly
          // added checklist needs to stay visible so a sub-task can be added to it.
          if (phaseTasks.length === 0 && search.trim()) return null;
          const phaseDone = phaseTasks.filter((t) => t.status === "done").length;
          const isCollapsed = collapsed[phase.id];

          return (
            <Card key={phase.id} className="p-0">
              <div className="flex w-full flex-wrap items-center gap-3 px-4 py-3">
                <div>
                  <button
                    type="button"
                    onClick={() => setEditingPhase(phase)}
                    className="text-left font-display text-lg hover:text-primary hover:underline"
                  >
                    {phase.title}
                  </button>
                  {phase.description ? <p className="text-xs text-ink/50">{phase.description}</p> : null}
                </div>
                <span className="text-xs text-ink/50">
                  {phaseDone} of {phaseTasks.length} complete
                </span>
                <button
                  type="button"
                  onClick={() => setCollapsed((prev) => ({ ...prev, [phase.id]: !prev[phase.id] }))}
                  aria-label={isCollapsed ? "Expand checklist" : "Collapse checklist"}
                  className="ml-auto flex items-center gap-3"
                >
                  <ProgressBar value={phaseTasks.length ? (phaseDone / phaseTasks.length) * 100 : 0} className="w-24" />
                  <span className="text-primary">{isCollapsed ? "›" : "⌄"}</span>
                </button>
              </div>

              {!isCollapsed ? (
                <div>
                  {phaseTasks.length === 0 ? (
                    <p className="border-t border-[#eee] px-4 py-3.5 text-sm text-ink/50">No tasks yet — add one below.</p>
                  ) : null}
                  {phaseTasks.map((t) => (
                    <div
                      key={t.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setEditingTask(t)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingTask(t)}
                      className="flex cursor-pointer items-start gap-3 border-t border-[#eee] px-4 py-3 hover:bg-bg-warm"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(t.id);
                        }}
                        disabled={t.status === "blocked"}
                        aria-label={t.status === "done" ? "Mark as incomplete" : "Mark as complete"}
                        className={clsx(
                          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center border text-xs",
                          t.status === "done" ? "border-primary bg-primary text-white" : "border-ink/30",
                          t.status === "blocked" && "cursor-not-allowed opacity-45",
                        )}
                      >
                        {t.status === "done" ? "✓" : ""}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className={clsx("font-medium", t.status === "done" && "text-ink/40 line-through")}>{t.title}</p>
                        {t.note ? <p className="mt-0.5 text-sm text-ink/50">{t.note}</p> : null}
                      </div>
                      <div className="shrink-0 text-right text-xs text-ink/50">
                        {t.dueDate ? <p className="font-bold">Due {new Date(t.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p> : null}
                        {t.status === "blocked" ? <p className="font-bold uppercase text-primary">Blocked</p> : null}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addTaskToPhase(phase.id)}
                    className="block w-full border-t border-[#eee] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-[.06em] text-primary hover:bg-bg-warm"
                  >
                    + Add task to {phase.title}
                  </button>
                </div>
              ) : null}
            </Card>
              );
            })}
          </div>
        </>
      )}

      <Drawer open={!!editingTask} onClose={() => setEditingTask(null)} title="Edit task">
        {editingTask ? (
          <TaskEditForm
            key={editingTask.id}
            task={editingTask}
            onSave={saveTask}
            onDelete={(t) => requestDelete({ type: "task", id: t.id, label: t.title })}
          />
        ) : null}
      </Drawer>

      <Drawer open={!!editingPhase} onClose={() => setEditingPhase(null)} title="Edit checklist">
        {editingPhase ? (
          <PhaseEditForm
            key={editingPhase.id}
            phase={editingPhase}
            onSave={savePhase}
            onDelete={(p) => requestDelete({ type: "phase", id: p.id, label: p.title })}
          />
        ) : null}
      </Drawer>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        {confirmDelete ? (
          <div>
            <h3 className="mb-2 font-display text-2xl">Delete {confirmDelete.type === "phase" ? "checklist" : "task"}?</h3>
            <p className="mb-6 text-ink/60">
              {confirmDelete.type === "phase" ? (
                <>
                  "{confirmDelete.label}" and all of its tasks will be permanently deleted. This can't be undone.
                </>
              ) : (
                <>"{confirmDelete.label}" will be permanently deleted. This can't be undone.</>
              )}
            </p>
            <div className="flex gap-2">
              <Button onClick={confirmDeleteAction} className="flex-1" loading={deleting} loadingText="Deleting…">
                Delete
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(null)} className="flex-1" disabled={deleting}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Toast open={!!toast}>{toast}</Toast>
      <Toast open={!!error} tone="error">{error}</Toast>
    </div>
  );
}

function TaskEditForm({
  task,
  onSave,
  onDelete,
}: {
  task: ChecklistTask;
  onSave: (task: ChecklistTask) => Promise<void>;
  onDelete: (task: ChecklistTask) => void;
}) {
  const [form, setForm] = useState(task);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, title: form.title.trim() || "New task" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor="task-title">Title</Label>
      <Input id="task-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />

      <Label htmlFor="task-description">Description</Label>
      <Textarea
        id="task-description"
        placeholder="Add any helpful detail for this task"
        value={form.note ?? ""}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
      />

      <Label htmlFor="task-due-date">Due date</Label>
      <Input id="task-due-date" type="date" value={form.dueDate ?? ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />

      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save
      </Button>
      <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => onDelete(task)}>
        Delete task
      </Button>
    </form>
  );
}

function PhaseEditForm({
  phase,
  onSave,
  onDelete,
}: {
  phase: ChecklistPhase;
  onSave: (phase: ChecklistPhase) => Promise<void>;
  onDelete: (phase: ChecklistPhase) => void;
}) {
  const [form, setForm] = useState(phase);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, title: form.title.trim() || phase.title });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor="phase-title">Title</Label>
      <Input id="phase-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} autoFocus />

      <Label htmlFor="phase-description">Description</Label>
      <Textarea
        id="phase-description"
        placeholder="What does this checklist cover?"
        value={form.description ?? ""}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save
      </Button>
      <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => onDelete(phase)}>
        Delete checklist
      </Button>
    </form>
  );
}
