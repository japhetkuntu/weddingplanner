import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Label, Modal, Skeleton, Toast } from "@ovutor/ui";
import { getVendors, addVendor, updateVendor, deleteVendor, errorMessage } from "@/lib/api";
import type { Vendor } from "@/types";

function VendorsSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 mb-6 h-4 w-72" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Vendor | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVendors()
      .then(setVendors)
      .finally(() => setLoading(false));
  }, []);

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }

  function flashError(message: string) {
    setError(message);
    window.setTimeout(() => setError(null), 3200);
  }

  const grouped = useMemo(() => {
    const groups = new Map<string, Vendor[]>();
    for (const v of vendors) {
      const list = groups.get(v.location) ?? [];
      list.push(v);
      groups.set(v.location, list);
    }
    return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [vendors]);

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteVendor(confirmDelete.id);
      setVendors((prev) => prev.filter((v) => v.id !== confirmDelete.id));
      setConfirmDelete(null);
      setEditing(null);
      flashToast("Vendor removed");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't remove that vendor — please try again."));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <VendorsSkeleton />;

  return (
    <div className="ovutor-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Vendors</h1>
          <p className="text-ink/60">Your shared directory, grouped by location.</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          + Add vendor
        </Button>
      </div>

      {vendors.length === 0 ? (
        <Card>
          <p className="text-ink/60">No vendors yet. Add your first one to start building the directory.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([location, list]) => (
            <div key={location}>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[.1em] text-ink/40">{location}</p>
              <div className="space-y-2">
                {list.map((vendor) => (
                  <Card key={vendor.id} className="flex items-center justify-between gap-3">
                    <div>
                      <b className="block">{vendor.name}</b>
                      <small className="text-ink/50">{vendor.contact || "No contact on file"}</small>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing(vendor)}
                      className="text-xs font-bold uppercase tracking-[.06em] text-primary"
                    >
                      Edit
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <VendorForm
          onClose={() => setShowAdd(false)}
          onSaved={(vendor) => {
            setVendors((prev) => [...prev, vendor]);
            setShowAdd(false);
            flashToast("Vendor added");
          }}
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing ? (
          <VendorForm
            vendor={editing}
            onClose={() => setEditing(null)}
            onSaved={(vendor) => {
              setVendors((prev) => prev.map((v) => (v.id === vendor.id ? vendor : v)));
              setEditing(null);
              flashToast("Saved");
            }}
            onDelete={() => setConfirmDelete(editing)}
          />
        ) : null}
      </Modal>

      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        {confirmDelete ? (
          <div>
            <h3 className="mb-2 font-display text-2xl">Remove {confirmDelete.name}?</h3>
            <p className="mb-6 text-ink/60">
              Any budget expenses linked to this vendor will keep their vendor name but lose the link. This can't be undone.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDelete} className="flex-1" loading={deleting} loadingText="Removing…">
                Remove
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

function VendorForm({
  vendor,
  onClose,
  onSaved,
  onDelete,
}: {
  vendor?: Vendor;
  onClose: () => void;
  onSaved: (vendor: Vendor) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(vendor?.name ?? "");
  const [contact, setContact] = useState(vendor?.contact ?? "");
  const [location, setLocation] = useState(vendor?.location ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setError("Name and location are both required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = vendor
        ? await updateVendor(vendor.id, name.trim(), contact.trim() || undefined, location.trim())
        : await addVendor(name.trim(), contact.trim() || undefined, location.trim());
      onSaved(saved);
    } catch (err) {
      setError(errorMessage(err, "Couldn't save that vendor — please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">{vendor ? "Edit vendor" : "New vendor"}</p>
      <h2 className="my-1.5 font-display text-2xl">{vendor ? vendor.name : "Add a vendor"}</h2>

      <Label htmlFor="vendor-name">Name</Label>
      <Input id="vendor-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />

      <Label htmlFor="vendor-contact">Contact</Label>
      <Input id="vendor-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or email" />

      <Label htmlFor="vendor-location">Location</Label>
      <Input id="vendor-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Accra, Kumasi" />

      {error ? <p className="mt-3 border-l-[3px] border-primary bg-[#fff2f0] p-2.5 text-sm text-[#5d2924]">{error}</p> : null}

      <div className="mt-6 flex gap-2">
        <Button type="submit" className="flex-1" loading={saving} loadingText="Saving…">
          {vendor ? "Save changes" : "Add vendor"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
      </div>
      {onDelete ? (
        <button type="button" onClick={onDelete} className="mt-4 block text-xs font-bold uppercase tracking-[.06em] text-primary">
          Remove vendor
        </button>
      ) : null}
    </form>
  );
}
