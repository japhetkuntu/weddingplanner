import { useEffect, useMemo, useState } from "react";
import { Badge, DataGrid, Drawer, Input, Skeleton, StatCard, type DataGridColumn } from "@ovutor/ui";
import { getRsvps } from "@/lib/api";
import type { RsvpGuest, RsvpStatus } from "@/types";

const STATUS_LABEL: Record<RsvpStatus, string> = { attending: "Attending", declined: "Declined", awaiting: "Awaiting" };
const STATUS_TONE: Record<RsvpStatus, "success" | "muted" | "warning"> = { attending: "success", declined: "muted", awaiting: "warning" };

function RsvpsSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-3 w-72" />
      <Skeleton className="my-2 h-9 w-40" />
      <Skeleton className="mb-6 h-4 w-64" />
      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </section>
      <Skeleton className="mb-6 h-2.5 w-full" />
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

export default function RsvpsPage() {
  const [guests, setGuests] = useState<RsvpGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<RsvpGuest | null>(null);

  useEffect(() => {
    getRsvps()
      .then(setGuests)
      .finally(() => setLoading(false));
  }, []);

  const attending = guests.filter((g) => g.status === "attending").length;
  const declined = guests.filter((g) => g.status === "declined").length;
  const awaiting = guests.filter((g) => g.status === "awaiting").length;

  const filtered = useMemo(() => guests.filter((g) => g.household.toLowerCase().includes(search.toLowerCase())), [guests, search]);

  if (loading) return <RsvpsSkeleton />;

  const columns: DataGridColumn<RsvpGuest>[] = [
    { key: "household", header: "Household", render: (g) => <b>{g.household}</b> },
    { key: "status", header: "Response", render: (g) => <Badge tone={STATUS_TONE[g.status]}>{STATUS_LABEL[g.status]}</Badge>, width: "w-[120px]" },
    {
      key: "details",
      header: "Attendance details",
      render: (g) => <span className="text-sm text-ink/60">{g.dietary ?? (g.status === "attending" ? `${g.attendanceCount ?? 1} attending` : "—")}</span>,
      hideBelow: "md",
    },
    {
      key: "view",
      header: "",
      render: (g) => (
        <button type="button" onClick={() => setSelected(g)} className="text-xs font-bold uppercase tracking-[.06em] text-primary">
          View
        </button>
      ),
      width: "w-[70px]",
    },
  ];

  return (
    <div className="ovutor-fade-in">
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Guest response overview · managed by planning team</p>
      <h1 className="my-1.5 font-display text-4xl">My RSVPs</h1>
      <p className="mb-6 text-ink/60">See how your guest celebration is taking shape.</p>

      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Invited" value={guests.length} hint="Across all events" />
        <StatCard label="Confirmed" value={attending} hint={`${Math.round((attending / guests.length) * 100)}% response rate`} />
        <StatCard label="Declined" value={declined} hint="Updated by guests" />
        <StatCard label="Awaiting" value={awaiting} valueClassName="text-primary" hint="Planning team follow-up" />
      </section>

      <div className="mb-6 flex h-2.5 w-full overflow-hidden">
        <div className="bg-[#2f6d43]" style={{ width: `${(attending / guests.length) * 100}%` }} />
        <div className="bg-ink/20" style={{ width: `${(declined / guests.length) * 100}%` }} />
        <div className="bg-primary/30" style={{ width: `${(awaiting / guests.length) * 100}%` }} />
      </div>

      <div className="mb-4">
        <Input placeholder="Search guests or households" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <DataGrid columns={columns} rows={filtered} rowKey={(g) => g.id} onRowClick={setSelected} emptyMessage="No guests match your search." />

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Guest response">
        {selected ? (
          <div>
            <div className="mb-5 flex items-start gap-3 border border-[#ddd] bg-bg-warm p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-primary/40 bg-white font-display text-lg text-primary">
                {selected.household.trim().charAt(0).toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-lg leading-tight">{selected.household}</p>
                <p className="mt-0.5 text-xs text-ink/50">
                  {selected.respondedAt
                    ? `Responded ${new Date(selected.respondedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`
                    : "Awaiting a response"}
                </p>
              </div>
              <Badge tone={STATUS_TONE[selected.status]} className="ml-auto shrink-0">
                {STATUS_LABEL[selected.status]}
              </Badge>
            </div>

            <dl className="space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-[#eee] pb-3">
                <dt className="text-xs font-bold uppercase tracking-[.06em] text-ink/40">Party size</dt>
                <dd className="text-ink">{selected.status === "attending" ? `${selected.attendanceCount ?? 1} guest(s)` : "—"}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-[#eee] pb-3">
                <dt className="text-xs font-bold uppercase tracking-[.06em] text-ink/40">Email</dt>
                <dd className="text-ink/70">{selected.email || "Not on file"}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-[#eee] pb-3">
                <dt className="text-xs font-bold uppercase tracking-[.06em] text-ink/40">Mobile</dt>
                <dd className="text-ink/70">{selected.mobile || "Not on file"}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-[#eee] pb-3">
                <dt className="text-xs font-bold uppercase tracking-[.06em] text-ink/40">Accommodation</dt>
                <dd className="text-ink/70">{selected.needsAccommodation ? "Needed" : "Not needed"}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-[#eee] pb-3">
                <dt className="text-xs font-bold uppercase tracking-[.06em] text-ink/40">Transportation</dt>
                <dd className="text-ink/70">{selected.needsTransportation ? "Needed" : "Not needed"}</dd>
              </div>
              <div className="border-b border-[#eee] pb-3">
                <dt className="mb-1 text-xs font-bold uppercase tracking-[.06em] text-ink/40">Dietary notes</dt>
                <dd className="text-ink/70">{selected.dietary || "No dietary notes on file"}</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
