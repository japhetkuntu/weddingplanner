import { useEffect, useState } from "react";
import { Badge, Button, Drawer, Input, Label, Modal, Select, Skeleton, Textarea, Toast } from "@ovutor/ui";
import { getVendors, addVendor, updateVendor, deleteVendor, uploadVendorPhoto, uploadVendorContract, errorMessage } from "@/lib/api";
import type { Vendor } from "@/types";

const CATEGORY_OPTIONS = ["Venue", "Catering", "Photography", "Videography", "Florist", "Music & Entertainment", "Decor", "Beauty", "Attire", "Transportation", "Other"];

function VendorsSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="mt-2 mb-6 h-4 w-72" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    </div>
  );
}

function VendorCard({ vendor, onClick }: { vendor: Vendor; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="block border border-[#ddd] bg-white text-left transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-bg-warm">
        {vendor.photoUrl ? (
          <img src={vendor.photoUrl} alt={vendor.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="grid h-full w-full place-items-center text-3xl text-ink/20">{vendor.name.charAt(0).toUpperCase()}</div>
        )}
      </div>
      <div className="p-4">
        {vendor.category ? (
          <span className="mb-1.5 inline-block border border-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.08em] text-primary">
            {vendor.category}
          </span>
        ) : null}
        <p className="font-display text-lg leading-snug">{vendor.name}</p>
        <p className="text-xs text-ink/50">{vendor.location}</p>
        {vendor.summary ? <p className="mt-1.5 line-clamp-2 text-xs text-ink/60">{vendor.summary}</p> : null}
      </div>
    </button>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<Vendor | null>(null);
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

  function handleUpdated(vendor: Vendor) {
    setVendors((prev) => prev.map((v) => (v.id === vendor.id ? vendor : v)));
    setSelected(vendor);
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteVendor(confirmDelete.id);
      setVendors((prev) => prev.filter((v) => v.id !== confirmDelete.id));
      setConfirmDelete(null);
      setSelected(null);
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
          <p className="text-ink/60">Everyone working on your weddings, with their contract on file.</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          + Add vendor
        </Button>
      </div>

      {vendors.length === 0 ? (
        <div className="border border-dashed border-[#ccc] bg-bg-warm p-8 text-center">
          <p className="text-ink/60">No vendors yet. Add your first one to start building the directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} onClick={() => setSelected(vendor)} />
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <VendorForm
          onClose={() => setShowAdd(false)}
          onSaved={(vendor) => {
            setVendors((prev) => [...prev, vendor]);
            setShowAdd(false);
            flashToast("Vendor added — open it to add a photo or contract");
          }}
        />
      </Modal>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? "Vendor"}>
        {selected ? (
          <VendorDetail
            vendor={selected}
            onUpdated={handleUpdated}
            onDelete={() => setConfirmDelete(selected)}
            onError={(msg) => flashError(msg)}
          />
        ) : null}
      </Drawer>

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

function VendorForm({ onClose, onSaved }: { onClose: () => void; onSaved: (vendor: Vendor) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");
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
      const saved = await addVendor({
        name: name.trim(),
        contact: contact.trim() || undefined,
        location: location.trim(),
        category,
        summary: summary.trim() || undefined,
      });
      onSaved(saved);
    } catch (err) {
      setError(errorMessage(err, "Couldn't save that vendor — please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">New vendor</p>
      <h2 className="my-1.5 font-display text-2xl">Add a vendor</h2>

      <Label htmlFor="vendor-name">Name</Label>
      <Input id="vendor-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />

      <Label htmlFor="vendor-category">Category</Label>
      <Select id="vendor-category" value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORY_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      <Label htmlFor="vendor-location">Location</Label>
      <Input id="vendor-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Accra, Kumasi" />

      <Label htmlFor="vendor-contact">Contact</Label>
      <Input id="vendor-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone or email" />

      <Label htmlFor="vendor-summary">What they provide</Label>
      <Textarea id="vendor-summary" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A one or two line summary for the card" />

      {error ? <p className="mt-3 border-l-[3px] border-primary bg-[#fff2f0] p-2.5 text-sm text-[#5d2924]">{error}</p> : null}

      <div className="mt-6 flex gap-2">
        <Button type="submit" className="flex-1" loading={saving} loadingText="Saving…">
          Add vendor
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function VendorDetail({
  vendor,
  onUpdated,
  onDelete,
  onError,
}: {
  vendor: Vendor;
  onUpdated: (vendor: Vendor) => void;
  onDelete: () => void;
  onError: (message: string) => void;
}) {
  const [form, setForm] = useState(vendor);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingContract, setUploadingContract] = useState(false);

  useEffect(() => setForm(vendor), [vendor]);

  async function handlePhotoChange(file: File | undefined) {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      onUpdated(await uploadVendorPhoto(vendor.id, file));
    } catch (err) {
      onError(errorMessage(err, "Couldn't upload that photo — please try again."));
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function handleContractChange(file: File | undefined) {
    if (!file) return;
    setUploadingContract(true);
    try {
      onUpdated(await uploadVendorContract(vendor.id, file));
    } catch (err) {
      onError(errorMessage(err, "Couldn't upload that contract — please try again."));
    } finally {
      setUploadingContract(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.location.trim()) {
      onError("Name and location are both required.");
      return;
    }
    setSaving(true);
    try {
      const saved = await updateVendor(vendor.id, {
        name: form.name.trim(),
        contact: form.contact?.trim() || undefined,
        location: form.location.trim(),
        category: form.category,
        summary: form.summary?.trim() || undefined,
      });
      onUpdated(saved);
    } catch (err) {
      onError(errorMessage(err, "Couldn't save those changes — please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-4 aspect-[4/3] w-full overflow-hidden border border-[#ddd] bg-bg-warm">
        {vendor.photoUrl ? (
          <img src={vendor.photoUrl} alt={vendor.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="grid h-full w-full place-items-center text-4xl text-ink/20">{vendor.name.charAt(0).toUpperCase()}</div>
        )}
      </div>
      {vendor.canManage ? (
        <>
          <Label htmlFor="vendor-photo" className={uploadingPhoto ? "pointer-events-none opacity-50" : "cursor-pointer text-primary"}>
            {uploadingPhoto ? "Uploading…" : vendor.photoUrl ? "Change photo" : "+ Add photo"}
          </Label>
          <input
            id="vendor-photo"
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={uploadingPhoto}
            onChange={(e) => handlePhotoChange(e.target.files?.[0])}
          />
        </>
      ) : (
        <p className="text-xs text-ink/50">Added by another planner — you can view this vendor but only its creator or a Super Admin can edit it.</p>
      )}

      <form onSubmit={handleSubmit} className="mt-2">
        <Label htmlFor="vendor-name-edit">Name</Label>
        <Input id="vendor-name-edit" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!vendor.canManage} />

        <Label htmlFor="vendor-category-edit">Category</Label>
        <Select id="vendor-category-edit" value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} disabled={!vendor.canManage}>
          <option value="">Not set</option>
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Label htmlFor="vendor-location-edit">Location</Label>
        <Input id="vendor-location-edit" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} disabled={!vendor.canManage} />

        <Label htmlFor="vendor-contact-edit">Contact</Label>
        <Input id="vendor-contact-edit" value={form.contact ?? ""} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="Phone or email" disabled={!vendor.canManage} />

        <Label htmlFor="vendor-summary-edit">What they provide</Label>
        <Textarea id="vendor-summary-edit" value={form.summary ?? ""} onChange={(e) => setForm({ ...form, summary: e.target.value })} disabled={!vendor.canManage} />

        <div className="my-4 border-t border-[#eee] pt-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[.1em] text-ink/40">Contract</p>
          {vendor.contractUrl ? (
            <div className="mb-2 flex items-center justify-between gap-2 border border-[#ddd] bg-bg-warm p-2.5 text-sm">
              <span className="truncate">{vendor.contractFileName}</span>
              <a href={vendor.contractUrl} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-bold uppercase tracking-[.06em] text-primary">
                Download
              </a>
            </div>
          ) : (
            <p className="mb-2 text-sm text-ink/50">No contract on file yet.</p>
          )}
          {vendor.canManage ? (
            <>
              <Label htmlFor="vendor-contract" className={uploadingContract ? "pointer-events-none opacity-50" : "cursor-pointer text-primary"}>
                {uploadingContract ? "Uploading…" : vendor.contractUrl ? "Replace contract" : "+ Attach contract"}
              </Label>
              <input
                id="vendor-contract"
                type="file"
                accept="application/pdf,.doc,.docx,image/*"
                className="sr-only"
                disabled={uploadingContract}
                onChange={(e) => handleContractChange(e.target.files?.[0])}
              />
            </>
          ) : null}
        </div>

        {vendor.canManage ? (
          <>
            <Button type="submit" className="w-full" loading={saving}>
              Save changes
            </Button>
            <Badge tone="muted" className="mt-3 block w-fit">
              {vendor.location}
            </Badge>
            <button type="button" onClick={onDelete} className="mt-4 block text-xs font-bold uppercase tracking-[.06em] text-primary">
              Remove vendor
            </button>
          </>
        ) : (
          <Badge tone="muted" className="mt-3 block w-fit">
            {vendor.location}
          </Badge>
        )}
      </form>
    </div>
  );
}
