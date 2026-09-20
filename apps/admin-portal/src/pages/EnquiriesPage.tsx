import { useEffect, useState } from "react";
import { Button, DataGrid, Drawer, Modal, Skeleton, StatCard, Toast, type DataGridColumn } from "@ovutor/ui";
import { getEnquiries, setEnquiryRead, deleteEnquiry, errorMessage } from "@/lib/api";
import type { Enquiry } from "@/types";

function EnquiriesSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 mb-6 h-4 w-72" />
      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </section>
      <div className="border border-[#ddd]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-[#eee] px-4 py-4 first:border-t-0">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="ml-auto h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Enquiry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEnquiries()
      .then(setEnquiries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <EnquiriesSkeleton />;

  const unread = enquiries.filter((e) => !e.isRead).length;

  function flashError(message: string) {
    setError(message);
    window.setTimeout(() => setError(null), 3200);
  }

  async function openEnquiry(enquiry: Enquiry) {
    setSelected(enquiry);
    if (enquiry.isRead) return;
    try {
      const saved = await setEnquiryRead(enquiry.id, true);
      setEnquiries((prev) => prev.map((e) => (e.id === saved.id ? saved : e)));
      setSelected(saved);
    } catch {
      // Not marking as read is harmless — the admin can still read the drawer that's already open.
    }
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteEnquiry(confirmDelete.id);
      setEnquiries((prev) => prev.filter((e) => e.id !== confirmDelete.id));
      setConfirmDelete(null);
      setSelected(null);
      setToast("Enquiry deleted");
      window.setTimeout(() => setToast(null), 2000);
    } catch (e) {
      flashError(errorMessage(e, "Couldn't delete that enquiry — please try again."));
    } finally {
      setDeleting(false);
    }
  }

  const columns: DataGridColumn<Enquiry>[] = [
    {
      key: "name",
      header: "Enquiry",
      render: (e) => (
        <div className="flex items-center gap-2">
          {!e.isRead ? <span className="h-2 w-2 shrink-0 rounded-full bg-gold" aria-label="Unread" /> : null}
          <div>
            <b>{e.name}</b>
            <div className="text-xs text-ink/50">{e.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "details",
      header: "Wedding details",
      render: (e) => (
        <span className="text-sm text-ink/60">
          {[e.weddingDate, e.location, e.guestCount ? `${e.guestCount} guests` : null].filter(Boolean).join(" · ") || "—"}
        </span>
      ),
      hideBelow: "md",
    },
    {
      key: "submittedAt",
      header: "Received",
      render: (e) => (
        <span className="text-sm text-ink/50">
          {new Date(e.submittedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
      width: "w-[110px]",
    },
  ];

  return (
    <div className="ovutor-fade-in">
      <h1 className="mb-1.5 font-display text-3xl">Enquiries</h1>
      <p className="mb-6 text-ink/60">Leads submitted through the wedding-website's Connect with Us form.</p>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Total enquiries" value={enquiries.length} />
        <StatCard label="Unread" value={unread} valueClassName={unread > 0 ? "text-primary" : undefined} />
        <StatCard label="This month" value={enquiries.filter((e) => isSameMonth(e.submittedAt)).length} />
      </section>

      <DataGrid
        columns={columns}
        rows={enquiries}
        rowKey={(e) => e.id}
        onRowClick={openEnquiry}
        emptyMessage="No enquiries yet — they'll show up here as soon as someone submits the Connect with Us form."
      />

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Enquiry">
        {selected ? (
          <div>
            <p className="font-display text-2xl">{selected.name}</p>
            <a href={`mailto:${selected.email}`} className="text-sm font-bold text-primary hover:underline">
              {selected.email}
            </a>
            <p className="mt-1 text-xs text-ink/50">
              Received {new Date(selected.submittedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </p>

            <div className="my-5 h-px bg-[#eee]" />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.06em] text-ink/40">Wedding date</p>
                <p className="mt-0.5">{selected.weddingDate || "Not shared"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.06em] text-ink/40">Location</p>
                <p className="mt-0.5">{selected.location || "Not shared"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.06em] text-ink/40">Guests</p>
                <p className="mt-0.5">{selected.guestCount ?? "Not shared"}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[.06em] text-ink/40">Budget</p>
                <p className="mt-0.5">{selected.budget || "Not shared"}</p>
              </div>
            </div>

            {selected.message ? (
              <>
                <div className="my-5 h-px bg-[#eee]" />
                <p className="text-xs font-bold uppercase tracking-[.06em] text-ink/40">Message</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink/80">{selected.message}</p>
              </>
            ) : null}

            <div className="mt-6 flex gap-2 border-t border-[#eee] pt-4">
              <Button className="flex-1" onClick={() => (window.location.href = `mailto:${selected.email}`)}>
                Reply by email
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(selected)}>
                Delete
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        {confirmDelete ? (
          <div>
            <h3 className="mb-2 font-display text-2xl">Delete enquiry?</h3>
            <p className="mb-5 text-ink/60">"{confirmDelete.name}"'s enquiry will be permanently deleted. This can't be undone.</p>
            <div className="flex gap-2">
              <Button onClick={confirmDeleteAction} className="flex-1" loading={deleting} loadingText="Deleting…">
                Delete enquiry
              </Button>
              <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={deleting}>
                Cancel
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Toast open={!!error} tone="error">{error}</Toast>
      <Toast open={!!toast}>{toast}</Toast>
    </div>
  );
}

function isSameMonth(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
