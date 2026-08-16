import { useEffect, useMemo, useState } from "react";
import { Button, Card, Drawer, EmptyState, Input, Label, Modal, Select, Skeleton, StatCard, Textarea, Toast } from "@ovutor/ui";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { useClientsStore } from "@/store/clientsStore";
import {
  getBudget,
  addBudgetCategory,
  updateBudgetCategory,
  deleteBudgetCategory,
  addBudgetExpense,
  updateBudgetExpense,
  deleteBudgetExpense,
  updateFullPaymentDueDate,
  getVendors,
  addVendor,
  errorMessage,
} from "@/lib/api";
import { formatMoney } from "@/lib/currency";
import { vendorsEnabled } from "@/lib/featureFlags";
import type { BudgetCategory, BudgetExpense, Vendor } from "@/types";

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
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [editingExpense, setEditingExpense] = useState<{ categoryId: string; expense: BudgetExpense } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DeleteCandidate | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingDueDate, setSavingDueDate] = useState(false);
  const upsertClient = useClientsStore((s) => s.upsert);

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

  function flashError(message: string) {
    setError(message);
    window.setTimeout(() => setError(null), 3200);
  }

  function updateExpenseAmount(categoryId: string, expenseId: string, field: "estimated" | "actual" | "paid", value: string) {
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
    try {
      await updateBudgetExpense(expenseId, {
        vendor: expense.vendor,
        description: expense.description,
        estimated: expense.estimated,
        actual: expense.actual,
        paid: expense.paid,
        nextDue: expense.nextDue,
      });
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save that amount — please try again."));
    }
  }

  // One click adds the row and immediately opens it for editing, so a blank "New expense" never lingers.
  async function addExpense(categoryId: string) {
    try {
      const expense = await addBudgetExpense(categoryId);
      setCategories((prev) => prev.map((c) => (c.id !== categoryId ? c : { ...c, expenses: [...c.expenses, expense] })));
      setEditingExpense({ categoryId, expense });
    } catch (e) {
      flashError(errorMessage(e, "Couldn't add an expense — please try again."));
    }
  }

  async function saveExpense(categoryId: string, updated: BudgetExpense) {
    try {
      const saved = await updateBudgetExpense(updated.id, {
        vendor: updated.vendor.trim() || updated.vendor,
        vendorId: updated.vendorId,
        description: updated.description,
        estimated: updated.estimated,
        actual: updated.actual,
        paid: updated.paid,
        nextDue: updated.nextDue,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id !== categoryId ? c : { ...c, expenses: c.expenses.map((e) => (e.id === saved.id ? saved : e)) })),
      );
      setEditingExpense(null);
      flashToast("Saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save that expense — please try again."));
    }
  }

  async function saveDueDate(value: string) {
    if (!client) return;
    setSavingDueDate(true);
    try {
      const updated = await updateFullPaymentDueDate(client.id, value || null);
      upsertClient(updated);
      flashToast("Due date saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save that due date — please try again."));
    } finally {
      setSavingDueDate(false);
    }
  }

  async function addCategory() {
    if (!client) return;
    const name = newCategoryName.trim();
    if (!name) {
      flashError("Give the category a name before adding it.");
      return;
    }
    setAddingCategory(true);
    try {
      const category = await addBudgetCategory(client.id, name);
      setCategories((prev) => [...prev, { ...category, expenses: [] }]);
      setNewCategoryName("");
      setShowAddCategory(false);
      flashToast("Category added");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't add that category — please try again."));
    } finally {
      setAddingCategory(false);
    }
  }

  async function saveCategory(updated: BudgetCategory) {
    try {
      const saved = await updateBudgetCategory(updated.id, updated.name.trim() || updated.name, updated.description);
      setCategories((prev) => prev.map((c) => (c.id === saved.id ? { ...c, ...saved } : c)));
      setEditingCategory(null);
      flashToast("Saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save that category — please try again."));
    }
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
    } catch (e) {
      flashError(errorMessage(e, "Couldn't delete that — please try again."));
    } finally {
      setDeleting(false);
    }
  }

  const totals = useMemo(() => {
    let estimated = 0;
    let actual = 0;
    let paid = 0;
    for (const c of categories) {
      for (const e of c.expenses) {
        estimated += e.estimated;
        actual += e.actual;
        paid += e.paid;
      }
    }
    return { estimated, actual, paid, stillToPay: actual - paid };
  }, [categories]);

  if (!client) return null;
  if (loading) return <BudgetSkeleton />;

  const money = (n: number) => formatMoney(n, client.currency);
  const remaining = client.budgetTotal - totals.actual;

  return (
    <div className="ovutor-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Budget</h1>
          <p className="text-ink/60">Track what's estimated, actual and paid against the overall target.</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor="full-payment-due-date">Due date for full payment</Label>
            <Input
              id="full-payment-due-date"
              type="date"
              defaultValue={client.fullPaymentDueDate ?? ""}
              onBlur={(e) => saveDueDate(e.target.value)}
              disabled={savingDueDate}
              className="h-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAddCategory((v) => !v)}>
            + Add category
          </Button>
        </div>
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
        <StatCard label="Estimated" value={money(totals.estimated)} />
        <StatCard label="Paid so far" value={money(totals.paid)} />
        <StatCard label="Still to pay" value={money(totals.stillToPay)} />
        <StatCard label="Remaining" value={money(remaining)} valueClassName={remaining < 0 ? "text-primary" : undefined} />
      </section>

      <p className="mb-4 text-sm text-ink/50">Your figures update as you type. Estimated is what you expect to spend; actual is what you've agreed with the vendor; paid is what has already left your account.</p>

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
          const catEstimated = cat.expenses.reduce((s, e) => s + e.estimated, 0);
          const catActual = cat.expenses.reduce((s, e) => s + e.actual, 0);
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
                  <span className="hidden text-right sm:block">{money(catEstimated)}</span>
                  <span className="hidden text-right sm:block">{money(catActual)}</span>
                  <span className="hidden text-right sm:block">{money(catPaid)}</span>
                  <span className="text-right font-bold">
                    {money(catActual - catPaid)} <span className="ml-1 text-primary">{isCollapsed ? "›" : "⌄"}</span>
                  </span>
                </button>
              </div>

              {!isCollapsed ? (
                <div>
                  <div className="hidden grid-cols-[1fr_repeat(4,minmax(70px,1fr))] gap-2 px-4 pt-3 text-[10px] font-bold uppercase tracking-[.06em] text-ink/50 sm:grid">
                    <span>Expense</span>
                    <span className="text-right">Estimated</span>
                    <span className="text-right">Actual</span>
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
                        value={money(e.estimated)}
                        onChange={(ev) => updateExpenseAmount(cat.id, e.id, "estimated", ev.target.value)}
                        onBlur={() => persistExpenseAmount(cat.id, e.id)}
                        className="h-9 text-right text-sm"
                      />
                      <Input
                        value={money(e.actual)}
                        onChange={(ev) => updateExpenseAmount(cat.id, e.id, "actual", ev.target.value)}
                        onBlur={() => persistExpenseAmount(cat.id, e.id)}
                        className="h-9 text-right text-sm"
                      />
                      <Input
                        value={money(e.paid)}
                        onChange={(ev) => updateExpenseAmount(cat.id, e.id, "paid", ev.target.value)}
                        onBlur={() => persistExpenseAmount(cat.id, e.id)}
                        className="h-9 text-right text-sm"
                      />
                      <p className="text-right text-sm font-bold">{money(e.actual - e.paid)}</p>
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
      <Toast open={!!error} tone="error">{error}</Toast>
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

const NEW_VENDOR_OPTION = "__new__";
const CUSTOM_VENDOR_OPTION = "__custom__";

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
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showNewVendor, setShowNewVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorContact, setNewVendorContact] = useState("");
  const [newVendorLocation, setNewVendorLocation] = useState("");
  const [addingVendor, setAddingVendor] = useState(false);
  const [vendorError, setVendorError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorsEnabled) return;
    getVendors().then(setVendors);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, vendor: form.vendor.trim() || expense.vendor });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddVendor() {
    if (!newVendorName.trim() || !newVendorLocation.trim()) {
      setVendorError("Name and location are both required.");
      return;
    }
    setAddingVendor(true);
    setVendorError(null);
    try {
      const vendor = await addVendor(newVendorName.trim(), newVendorContact.trim() || undefined, newVendorLocation.trim());
      setVendors((prev) => [...prev, vendor]);
      setForm({ ...form, vendor: vendor.name, vendorId: vendor.id });
      setShowNewVendor(false);
      setNewVendorName("");
      setNewVendorContact("");
      setNewVendorLocation("");
    } catch (err) {
      setVendorError(errorMessage(err, "Couldn't add that vendor — please try again."));
    } finally {
      setAddingVendor(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {vendorsEnabled ? (
        <>
          <Label htmlFor="expense-vendor-select">Vendor</Label>
          <Select
            id="expense-vendor-select"
            value={showNewVendor ? NEW_VENDOR_OPTION : form.vendorId ?? CUSTOM_VENDOR_OPTION}
            onChange={(e) => {
              const value = e.target.value;
              if (value === NEW_VENDOR_OPTION) {
                setShowNewVendor(true);
                return;
              }
              setShowNewVendor(false);
              if (value === CUSTOM_VENDOR_OPTION) {
                setForm({ ...form, vendorId: undefined });
                return;
              }
              const vendor = vendors.find((v) => v.id === value);
              if (vendor) setForm({ ...form, vendor: vendor.name, vendorId: vendor.id });
            }}
          >
            <option value={CUSTOM_VENDOR_OPTION}>Custom title (no directory vendor)</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} · {v.location}
              </option>
            ))}
            <option value={NEW_VENDOR_OPTION}>+ Add new vendor…</option>
          </Select>

          {showNewVendor ? (
            <div className="mt-2 space-y-2 border border-[#eee] bg-bg-warm p-3">
              <Input placeholder="Vendor name" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} autoFocus />
              <Input placeholder="Contact (phone or email)" value={newVendorContact} onChange={(e) => setNewVendorContact(e.target.value)} />
              <Input placeholder="Location, e.g. Accra" value={newVendorLocation} onChange={(e) => setNewVendorLocation(e.target.value)} />
              {vendorError ? <p className="text-xs text-primary">{vendorError}</p> : null}
              <Button type="button" size="sm" onClick={handleAddVendor} loading={addingVendor}>
                Add &amp; select vendor
              </Button>
            </div>
          ) : null}
        </>
      ) : null}

      <Label htmlFor="expense-vendor">Title</Label>
      <Input
        id="expense-vendor"
        value={form.vendor}
        onChange={(e) => setForm({ ...form, vendor: e.target.value, vendorId: undefined })}
        disabled={vendorsEnabled && !!form.vendorId}
        className={vendorsEnabled && form.vendorId ? "bg-bg-warm text-ink/50" : undefined}
      />

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
