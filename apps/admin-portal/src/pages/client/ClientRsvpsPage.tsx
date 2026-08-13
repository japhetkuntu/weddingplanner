import { useEffect, useMemo, useState } from "react";
import { Badge, DataGrid, Drawer, Input, Label, Select, Skeleton, StatCard, Textarea, Button, Toast, type DataGridColumn } from "@ovutor/ui";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { getRsvps, updateRsvp, errorMessage } from "@/lib/api";
import type { RsvpGuest, RsvpStatus } from "@/types";

const STATUS_LABEL: Record<RsvpStatus, string> = { attending: "Attending", declined: "Declined", awaiting: "Awaiting" };
const STATUS_TONE: Record<RsvpStatus, "success" | "muted" | "warning"> = { attending: "success", declined: "muted", awaiting: "warning" };

function RsvpsSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 mb-6 h-4 w-56" />
      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </section>
      <Skeleton className="mb-4 h-11 max-w-sm" />
      <div className="border border-[#ddd]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-[#eee] px-4 py-4 first:border-t-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="ml-auto h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientRsvpsPage() {
  const client = useCurrentClient();
  const [guests, setGuests] = useState<RsvpGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RsvpStatus | "all">("all");
  const [selected, setSelected] = useState<RsvpGuest | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      guests.filter((g) => {
        const matchesQuery = g.household.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || g.status === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [guests, search, statusFilter],
  );

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    getRsvps(client.id)
      .then(setGuests)
      .finally(() => setLoading(false));
  }, [client]);

  if (!client) return null;
  if (loading) return <RsvpsSkeleton />;

  const attending = guests.filter((g) => g.status === "attending").length;
  const declined = guests.filter((g) => g.status === "declined").length;
  const awaiting = guests.filter((g) => g.status === "awaiting").length;

  async function saveSelected(updated: RsvpGuest) {
    try {
      const saved = await updateRsvp(updated.id, {
        status: updated.status,
        attendanceCount: updated.attendanceCount,
        dietary: updated.dietary,
        plannerNote: updated.plannerNote,
      });
      setGuests((prev) => prev.map((g) => (g.id === saved.id ? saved : g)));
      setSelected(null);
      setToast("Saved");
      window.setTimeout(() => setToast(null), 2000);
    } catch (e) {
      setError(errorMessage(e, "Couldn't save that RSVP — please try again."));
      window.setTimeout(() => setError(null), 3200);
    }
  }

  const columns: DataGridColumn<RsvpGuest>[] = [
    {
      key: "household",
      header: "Guest / household",
      render: (g) => <b>{g.household}</b>,
    },
    { key: "status", header: "Status", render: (g) => <Badge tone={STATUS_TONE[g.status]}>{STATUS_LABEL[g.status]}</Badge>, width: "w-[120px]" },
    {
      key: "details",
      header: "Planning details",
      render: (g) => (
        <span className="text-sm text-ink/60">
          {g.status === "attending" ? `${g.attendanceCount ?? 1} attending` : g.status === "declined" ? "Declined" : "No response yet"}
        </span>
      ),
      hideBelow: "md",
    },
    {
      key: "action",
      header: "",
      render: (g) => (
        <button type="button" onClick={() => setSelected(g)} className="text-xs font-bold uppercase tracking-[.06em] text-primary">
          View
        </button>
      ),
      width: "w-[80px]",
    },
  ];

  return (
    <div className="ovutor-fade-in">
      <h1 className="mb-1.5 font-display text-3xl">RSVPs</h1>
      <p className="mb-6 text-ink/60">{client.coupleNames}'s guest responses.</p>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Invited" value={guests.length} />
        <StatCard label="Attending" value={attending} />
        <StatCard label="Declined" value={declined} />
        <StatCard label="Awaiting" value={awaiting} valueClassName="text-primary" />
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Search households" value={search} onChange={(e) => setSearch(e.target.value)} className="min-w-[220px] flex-1" />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as RsvpStatus | "all")} className="w-auto">
          <option value="all">All statuses</option>
          <option value="attending">Attending</option>
          <option value="declined">Declined</option>
          <option value="awaiting">Awaiting</option>
        </Select>
      </div>

      <DataGrid columns={columns} rows={filtered} rowKey={(g) => g.id} onRowClick={setSelected} emptyMessage="No guests match your search." />

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Guest response">
        {selected ? <RsvpDetailForm guest={selected} onSave={saveSelected} /> : null}
      </Drawer>

      <Toast open={!!toast}>{toast}</Toast>
      <Toast open={!!error} tone="error">{error}</Toast>
    </div>
  );
}

function RsvpDetailForm({ guest, onSave }: { guest: RsvpGuest; onSave: (g: RsvpGuest) => Promise<void> }) {
  const [form, setForm] = useState(guest);
  const [saving, setSaving] = useState(false);
  const initial = guest.household.trim().charAt(0).toUpperCase() || "?";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-5 flex items-start gap-3 border border-[#ddd] bg-bg-warm p-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/40 bg-white font-display text-lg text-primary">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-lg leading-tight">{guest.household}</p>
          <p className="mt-0.5 text-xs text-ink/50">
            {guest.respondedAt
              ? `Responded ${new Date(guest.respondedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
              : "Awaiting a response"}
          </p>
        </div>
        <Badge tone={STATUS_TONE[form.status]} className="ml-auto shrink-0">
          {STATUS_LABEL[form.status]}
        </Badge>
      </div>

      <p className="mb-2 text-[10px] font-bold uppercase tracking-[.1em] text-ink/40">Response</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="attendance">Status</Label>
          <Select id="attendance" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as RsvpStatus })}>
            <option value="attending">Attending</option>
            <option value="declined">Declined</option>
            <option value="awaiting">Awaiting</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="count">Party size</Label>
          <Input
            id="count"
            type="number"
            min={0}
            disabled={form.status !== "attending"}
            value={form.status === "attending" ? (form.attendanceCount ?? 1) : ""}
            placeholder={form.status === "attending" ? undefined : "—"}
            onChange={(e) => setForm({ ...form, attendanceCount: Number(e.target.value) })}
            className="disabled:bg-bg-warm disabled:text-ink/30"
          />
        </div>
      </div>

      <div className="my-5 h-px bg-[#eee]" />

      <p className="mb-2 text-[10px] font-bold uppercase tracking-[.1em] text-ink/40">Notes</p>
      <Label htmlFor="dietary">Dietary notes</Label>
      <Input
        id="dietary"
        placeholder="No dietary notes on file"
        value={form.dietary ?? ""}
        onChange={(e) => setForm({ ...form, dietary: e.target.value })}
      />

      <Label htmlFor="note">Planner note</Label>
      <Textarea
        id="note"
        placeholder="Add a private note for your team—guests never see this."
        value={form.plannerNote ?? ""}
        onChange={(e) => setForm({ ...form, plannerNote: e.target.value })}
      />

      <div className="mt-6 flex gap-2 border-t border-[#eee] pt-4">
        <Button type="submit" className="flex-1" loading={saving} loadingText="Saving changes…">
          Save changes
        </Button>
      </div>
    </form>
  );
}
