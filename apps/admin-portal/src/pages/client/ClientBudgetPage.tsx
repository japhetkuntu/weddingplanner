import { useEffect, useMemo, useState } from "react";
import { Button, Card, Drawer, EmptyState, Input, Label, Modal, Skeleton, StatCard, Textarea, Toast } from "@ovutor/ui";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import {
  getBudget,
  addBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  addBudgetExpense,
  updateBudgetExpense,
  deleteBudgetExpense,
} from "@/lib/api";
import { formatMoney } from "@/lib/currency";
import type { BudgetCategory, BudgetExpense } from "@/types";

interface DeleteCandidate {
  type: "category" | "expense";
  categoryId: string;
  expenseId?: string;
  label: string;
}

function BudgetSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </section>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}

export default function ClientBudgetPage() {
  const client = useCurrentClient();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [editingExpense, setEditingExpense] = useState<{ categoryId: string; expense: BudgetExpense } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DeleteCandidate | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    getBudget(client.id)
      .then(setCategories)
      .finally(() => setLoading(false));
  }, [client]);

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }

  function updateExpenseAmount(categoryId: string, expenseId: string, field: "planned" | "agreed" | "paid", value: string) {
    const num = Number(value.replace(/[^0-9.]/g, "")) || 0;
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== categoryId ? c : { ...c, expenses: c.expenses.map((e) => (e.id === expenseId ? { ...e, [field]: num } : e)) },
      ),
    );
  }

  async function persistExpenseAmount(categoryId: string, expenseId: string) {
    const category = categories.find((c) => c.id === categoryId);
    const expense = category?.expenses.find((e) => e.id === expenseId);
    if (!expense) return;
    await updateBudgetExpense(expenseId, {
      vendor: expense.vendor,
      description: expense.description,
      planned: expense.planned,
      agreed: expense.agreed,
      paid: expense.paid,
      nextDue: expense.nextDue,
    });
  }

  // One click adds the row and immediately opens it for editing, so a blank "New expense" never lingers.
  async function addExpense(categoryId: string) {
    const expense = await addBudgetExpense(categoryId);
    setCategories((prev) => prev.map((c) => (c.id !== categoryId ? c : { ...c, expenses: [...c.expenses, expense] })));
    setEditingExpense({ categoryId, expense });
  }

  async function saveExpense(categoryId: string, updated: BudgetExpense) {
    const saved = await updateBudgetExpense(updated.id, {
      vendor: updated.vendor.trim() || updated.vendor,
      description: updated.description,
      planned: updated.planned,
      agreed: updated.agreed,
      paid: updated.paid,
      nextDue: updated.nextDue,
    });
    setCategories((prev) =>
      prev.map((c) => (c.id !== categoryId ? c : { ...c, expenses: c.expenses.map((e) => (e.id === saved.id ? saved : e)) })),
    );
    setEditingExpense(null);
    flashToast("Saved");
  }

  async function addCategory() {
    if (!client) return;
    const name = newCategoryName.trim();
    if (!name) return;
    setAddingCategory(true);
    try {
      const category = await addBudgetCategory(client.id, name);
      setCategories((prev) => [...prev, { ...category, expenses: [] }]);
      setNewCategoryName("");
      setShowAddCategory(false);
      flashToast("Category added");
    } finally {
      setAddingCategory(false);
    }
  }

  async function saveCategory(updated: BudgetCategory) {
    const saved = await updateBudgetCategory(updated.id, updated.name.trim() || updated.name, updated.description);
    setCategories((prev) => prev.map((c) => (c.id === saved.id ? { ...c, ...saved } : c)));
    setEditingCategory(null);
    flashToast("Saved");
  }

  function requestDelete(candidate: DeleteCandidate) {
    setConfirmDelete(candidate);
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      if (confirmDelete.type === "category") {
        await deleteBudgetCategory(confirmDelete.categoryId);
        setCategories((prev) => prev.filter((c) => c.id !== confirmDelete.categoryId));
        setEditingCategory(null);
      } else if (confirmDelete.expenseId) {
        await deleteBudgetExpense(confirmDelete.expenseId);
        setCategories((prev) =>
          prev.map((c) => (c.id !== confirmDelete.categoryId ? c : { ...c, expenses: c.expenses.filter((e) => e.id !== confirmDelete.expenseId) })),
        );
        setEditingExpense(null);
      }
      setConfirmDelete(null);
      flashToast("Deleted");
    } finally {
      setDeleting(false);
    }
  }

  const totals = useMemo(() => {
    let planned = 0;
    let agreed = 0;
    let paid = 0;
    for (const c of categories) {
      for (const e of c.expenses) {
        planned += e.planned;
        agreed += e.agreed;
        paid += e.paid;
      }
    }
    return { planned, agreed, paid, stillToPay: agreed - paid };
  }, [categories]);

  if (!client) return null;
  if (loading) return <BudgetSkeleton />;

  const money = (n: number) => formatMoney(n, client.currency);
  const remaining = client.budgetTotal - totals.agreed;

  return (
    <div className="ovutor-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Budget</h1>
          <p className="text-ink/60">Track what's planned, agreed and paid against the overall target.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAddCategory((v) => !v)}>
          + Add category
        </Button>
      </div>

      {showAddCategory ? (
        <Card className="mb-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-[.06em] text-ink/60">New category</p>
          <div className="flex flex-wrap gap-2">
            <Input
              placeholder="Category name, e.g. Transportation"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="min-w-[220px] flex-1"
              autoFocus
            />
            <Button onClick={addCategory} loading={addingCategory}>Add category</Button>
          </div>
        </Card>
      ) : null}

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Total target" value={money(client.budgetTotal)} />
        <StatCard label="Planned" value={money(totals.planned)} />
        <StatCard label="Paid so far" value={money(totals.paid)} />
        <StatCard label="Still to pay" value={money(totals.stillToPay)} />
        <StatCard label="Remaining" value={money(remaining)} valueClassName={remaining < 0 ? "text-primary" : undefined} />
      </section>

      <p className="mb-4 text-sm text-ink/50">Your figures update as you type. Planned is what you expect; paid is what has already left your account.</p>

      {categories.length === 0 ? (
        <EmptyState
          title="No budget categories yet"
          message="Break this couple's budget into categories like venue, catering, or attire to start tracking spend."
          action={
            <Button size="sm" onClick={() => setShowAddCategory(true)}>
              + Add category
            </Button>
          }
        />
      ) : (
      <div className="space-y-3">
        {categories.map((cat) => {
          const catPlanned = cat.expenses.reduce((s, e) => s + e.planned, 0);
          const catAgreed = cat.expenses.reduce((s, e) => s + e.agreed, 0);
          const catPaid = cat.expenses.reduce((s, e) => s + e.paid, 0);
          const isCollapsed = collapsed[cat.id];

          return (
            <Card key={cat.id} className="p-0">
              <div className="grid w-full grid-cols-[1fr_repeat(4,minmax(70px,1fr))] items-center gap-2 border-b border-[#eee] bg-bg-warm px-4 py-3 text-sm">
                <div>
                  <button type="button" onClick={() => setEditingCategory(cat)} className="text-left font-bold hover:text-primary hover:underline">
                    {cat.name}
                  </button>
                  {cat.description ? <p className="text-xs font-normal text-ink/50">{cat.description}</p> : null}
                </div>
                <button
                  type="button"
                  onClick={() => setCollapsed((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                  aria-label={isCollapsed ? "Expand category" : "Collapse category"}
                  className="col-span-4 grid grid-cols-4 items-center gap-2"
                >
                  <span className="hidden text-right sm:block">{money(catPlanned)}</span>
                  <span className="hidden text-right sm:block">{money(catAgreed)}</span>
                  <span className="hidden text-right sm:block">{money(catPaid)}</span>
                  <span className="text-right font-bold">
                    {money(catAgreed - catPaid)} <span className="ml-1 text-primary">{isCollapsed ? "›" : "⌄"}</span>
                  </span>
                </button>
              </div>

              {!isCollapsed ? (
                <div>
                  <div className="hidden grid-cols-[1fr_repeat(4,minmax(70px,1fr))] gap-2 px-4 pt-3 text-[10px] font-bold uppercase tracking-[.06em] text-ink/50 sm:grid">
                    <span>Expense</span>
                    <span className="text-right">Planned</span>
                    <span className="text-right">Agreed</span>
                    <span className="text-right">Paid</span>
                    <span className="text-right">Still to pay</span>
                  </div>
                  {cat.expenses.length === 0 ? (
                    <p className="border-t border-[#eee] px-4 py-3.5 text-sm text-ink/50">No expenses yet — add one below.</p>
                  ) : null}
                  {cat.expenses.map((e) => (
                    <div key={e.id} className="grid grid-cols-1 items-center gap-2 border-t border-[#eee] px-4 py-3 sm:grid-cols-[1fr_repeat(4,minmax(70px,1fr))]">
                      <button type="button" onClick={() => setEditingExpense({ categoryId: cat.id, expense: e })} className="text-left hover:text-primary">
                        <p className="font-medium hover:underline">{e.vendor}</p>
                        {e.description ? <p className="text-xs text-ink/50">{e.description}</p> : null}
                        {e.nextDue ? <p className="text-xs text-ink/50">Next due {new Date(e.nextDue).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</p> : null}
                      </button>
                      <Input
                        value={money(e.planned)}
                        onChange={(ev) => updateExpenseAmount(cat.id, e.id, "planned", ev.target.value)}
                        onBlur={() => persistExpenseAmount(cat.id, e.id)}
                        className="h-9 text-right text-sm"
                      />
                      <Input
                        value={money(e.agreed)}
                        onChange={(ev) => updateExpenseAmount(cat.id, e.id, "agreed", ev.target.value)}
                        onBlur={() => persistExpenseAmount(cat.id, e.id)}
                        className="h-9 text-right text-sm"
                      />
                      <Input
                        value={money(e.paid)}
                        onChange={(ev) => updateExpenseAmount(cat.id, e.id, "paid", ev.target.value)}
                        onBlur={() => persistExpenseAmount(cat.id, e.id)}
                        className="h-9 text-right text-sm"
                      />
                      <p className="text-right text-sm font-bold">{money(e.agreed - e.paid)}</p>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addExpense(cat.id)}
                    className="block w-full border-t border-[#eee] px-4 py-2.5 text-left text-xs font-bold uppercase tracking-[.06em] text-primary hover:bg-bg-warm"
                  >
                    + Add expense to {cat.name}
                  </button>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>
      )}

      <Drawer open={!!editingCategory} onClose={() => setEditingCategory(null)} title="Edit category">
        {editingCategory ? (
          <CategoryEditForm
            key={editingCategory.id}
            category={editingCategory}
            onSave={saveCategory}
            onDelete={(c) => requestDelete({ type: "category", categoryId: c.id, label: c.name })}
          />
        ) : null}
      </Drawer>

      <Drawer open={!!editingExpense} onClose={() => setEditingExpense(null)} title="Edit expense">
        {editingExpense ? (
          <ExpenseEditForm
            key={editingExpense.expense.id}
            expense={editingExpense.expense}
            onSave={(updated) => saveExpense(editingExpense.categoryId, updated)}
            onDelete={(exp) => requestDelete({ type: "expense", categoryId: editingExpense.categoryId, expenseId: exp.id, label: exp.vendor })}
          />
        ) : null}
      </Drawer>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        {confirmDelete ? (
          <div>
            <h3 className="mb-2 font-display text-2xl">Delete {confirmDelete.type === "category" ? "category" : "expense"}?</h3>
            <p className="mb-6 text-ink/60">
              {confirmDelete.type === "category" ? (
                <>"{confirmDelete.label}" and all of its expenses will be permanently deleted. This can't be undone.</>
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
    </div>
  );
}

function CategoryEditForm({
  category,
  onSave,
  onDelete,
}: {
  category: BudgetCategory;
  onSave: (category: BudgetCategory) => Promise<void>;
  onDelete: (category: BudgetCategory) => void;
}) {
  const [form, setForm] = useState(category);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, name: form.name.trim() || category.name });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor="category-name">Title</Label>
      <Input id="category-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />

      <Label htmlFor="category-description">Description</Label>
      <Textarea
        id="category-description"
        placeholder="What does this category cover?"
        value={form.description ?? ""}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save
      </Button>
      <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => onDelete(category)}>
        Delete category
      </Button>
    </form>
  );
}

function ExpenseEditForm({
  expense,
  onSave,
  onDelete,
}: {
  expense: BudgetExpense;
  onSave: (expense: BudgetExpense) => Promise<void>;
  onDelete: (expense: BudgetExpense) => void;
}) {
  const [form, setForm] = useState(expense);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, vendor: form.vendor.trim() || expense.vendor });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Label htmlFor="expense-vendor">Title</Label>
      <Input id="expense-vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} autoFocus />

      <Label htmlFor="expense-description">Description</Label>
      <Textarea
        id="expense-description"
        placeholder="Add any helpful detail for this expense"
        value={form.description ?? ""}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Label htmlFor="expense-next-due">Next due date</Label>
      <Input id="expense-next-due" type="date" value={form.nextDue ?? ""} onChange={(e) => setForm({ ...form, nextDue: e.target.value })} />

      <Button type="submit" className="mt-5 w-full" loading={saving}>
        Save
      </Button>
      <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => onDelete(expense)}>
        Delete expense
      </Button>
    </form>
  );
}
