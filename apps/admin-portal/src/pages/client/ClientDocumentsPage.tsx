import { useEffect, useState } from "react";
import { Badge, Button, Drawer, EmptyState, Input, Label, Modal, Select, Skeleton, Toast } from "@ovutor/ui";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import {
  getDocuments,
  getDocumentCategories,
  addDocumentCategory,
  uploadDocument,
  updateDocument,
  deleteDocument,
  errorMessage,
} from "@/lib/api";
import type { DocumentFile, DocumentVisibility } from "@/types";

function DocumentsSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-11 w-40" />
      </div>
      <Skeleton className="mb-4 h-11 max-w-md" />
      <div className="divide-y divide-[#eee] border border-[#ddd]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="mt-1.5 h-3 w-40" />
            </div>
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ClientDocumentsPage() {
  const client = useCurrentClient();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState<DocumentVisibility | "all">("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentFile | null>(null);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState<DocumentFile | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!client) return;
    setLoading(true);
    Promise.all([getDocuments(client.id).then(setDocuments), getDocumentCategories().then(setCategories)]).finally(() => setLoading(false));
  }, [client]);

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  function flashError(message: string) {
    setError(message);
    window.setTimeout(() => setError(null), 3200);
  }

  async function registerCategory(name: string) {
    try {
      const updated = await addDocumentCategory(name);
      setCategories(updated);
    } catch (e) {
      flashError(errorMessage(e, "Couldn't add that category — please try again."));
    }
  }

  if (!client) return null;
  if (loading) return <DocumentsSkeleton />;

  function handleUploaded(doc: DocumentFile) {
    setDocuments((prev) => [doc, ...prev]);
    setUploadOpen(false);
    flashToast("Document uploaded");
  }

  async function saveDoc(updated: DocumentFile) {
    try {
      const saved = await updateDocument(updated.id, updated.name.trim() || updated.name, updated.category, updated.visibility);
      setDocuments((prev) => prev.map((d) => (d.id === saved.id ? saved : d)));
      setEditingDoc(null);
      flashToast("Saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save that document — please try again."));
    }
  }

  async function confirmDelete() {
    if (!confirmDeleteDoc) return;
    setDeleting(true);
    try {
      await deleteDocument(confirmDeleteDoc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== confirmDeleteDoc.id));
      setConfirmDeleteDoc(null);
      setEditingDoc(null);
      flashToast("Document deleted");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't delete that document — please try again."));
    } finally {
      setDeleting(false);
    }
  }

  const filtered = documents.filter((d) => {
    const matchesQuery = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesVisibility = visibility === "all" || d.visibility === visibility;
    return matchesQuery && matchesVisibility;
  });

  return (
    <div className="ovutor-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Documents</h1>
          <p className="text-ink/60">Files shared with {client.coupleNames} and internal planning notes.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>Upload document</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Search documents" value={search} onChange={(e) => setSearch(e.target.value)} className="min-w-[220px] flex-1" />
        <Select value={visibility} onChange={(e) => setVisibility(e.target.value as DocumentVisibility | "all")} className="w-auto">
          <option value="all">All visibility</option>
          <option value="client">Visible to client</option>
          <option value="planner-only">Planner only</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No documents yet"
          message="Uploaded contracts, proposals and planning files will appear here."
          action={<Button onClick={() => setUploadOpen(true)}>Upload document</Button>}
        />
      ) : (
        <div className="divide-y divide-[#eee] border border-[#ddd] bg-white">
          {filtered.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setEditingDoc(doc)}
              className="flex w-full flex-wrap items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-warm"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center border border-[#ddd] bg-bg-warm text-xs font-bold text-ink/50">
                {doc.name.split(".").pop()?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{doc.name}</p>
                <p className="text-xs text-ink/50">
                  {doc.uploader} · {doc.category} · {doc.sizeLabel} · {new Date(doc.uploadedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
              <Badge tone={doc.visibility === "client" ? "success" : "muted"}>
                {doc.visibility === "client" ? "Visible to client" : "Planner only"}
              </Badge>
              <span className="shrink-0 text-xs font-bold uppercase tracking-[.06em] text-primary">View</span>
            </button>
          ))}
        </div>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload document">
        <UploadForm
          clientId={client.id}
          categories={categories}
          onAddCategory={registerCategory}
          onUploaded={handleUploaded}
        />
      </Modal>

      <Drawer open={!!editingDoc} onClose={() => setEditingDoc(null)} title="Document">
        {editingDoc ? (
          <DocumentDetailForm
            key={editingDoc.id}
            doc={editingDoc}
            categories={categories}
            onAddCategory={registerCategory}
            onSave={saveDoc}
            onDelete={(d) => setConfirmDeleteDoc(d)}
          />
        ) : null}
      </Drawer>

      <Modal open={!!confirmDeleteDoc} onClose={() => setConfirmDeleteDoc(null)}>
        {confirmDeleteDoc ? (
          <div>
            <h3 className="mb-2 font-display text-2xl">Delete document?</h3>
            <p className="mb-6 text-ink/60">"{confirmDeleteDoc.name}" will be permanently deleted. This can't be undone.</p>
            <div className="flex gap-2">
              <Button onClick={confirmDelete} className="flex-1" loading={deleting} loadingText="Deleting…">
                Delete
              </Button>
              <Button variant="outline" onClick={() => setConfirmDeleteDoc(null)} className="flex-1" disabled={deleting}>
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

/** Lets the admin pick from categories used so far, or add a new one on the spot — the list is never
 * fixed. If nothing exists yet, it goes straight to "add your first category" instead of an empty picker. */
function CategoryField({
  id,
  categories,
  value,
  onChange,
  onAddCategory,
}: {
  id: string;
  categories: string[];
  value: string;
  onChange: (value: string) => void;
  onAddCategory: (name: string) => void;
}) {
  const [adding, setAdding] = useState(categories.length === 0);
  const [draft, setDraft] = useState("");

  function commitNewCategory() {
    const name = draft.trim();
    if (!name) return;
    onAddCategory(name);
    onChange(name);
    setDraft("");
    setAdding(false);
  }

  if (adding) {
    return (
      <div>
        <Label htmlFor={id}>{categories.length === 0 ? "Add your first category" : "New category"}</Label>
        <div className="flex gap-2">
          <Input
            id={id}
            placeholder="e.g. Contracts"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitNewCategory();
              }
            }}
            className="flex-1"
            autoFocus
          />
          <Button type="button" onClick={commitNewCategory}>
            Add
          </Button>
          {categories.length > 0 ? (
            <Button type="button" variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label htmlFor={id}>Category</Label>
      <Select
        id={id}
        value={value}
        onChange={(e) => {
          if (e.target.value === "__add__") setAdding(true);
          else onChange(e.target.value);
        }}
      >
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
        <option value="__add__">+ Add new category…</option>
      </Select>
    </div>
  );
}

function DocumentPreview({ doc }: { doc: DocumentFile }) {
  if (doc.previewUrl && doc.fileType?.startsWith("image/")) {
    return (
      <div className="mb-4 border border-[#ddd] bg-bg-warm">
        <img src={doc.previewUrl} alt={doc.name} className="max-h-64 w-full object-contain" />
      </div>
    );
  }
  if (doc.previewUrl && doc.fileType === "application/pdf") {
    return (
      <div className="mb-4 border border-[#ddd]">
        <iframe title={doc.name} src={doc.previewUrl} className="h-64 w-full" />
      </div>
    );
  }
  return (
    <div className="mb-4 grid h-40 place-items-center border border-dashed border-[#ccc] bg-bg-warm text-center text-sm text-ink/40">
      No preview available for this file type.
      <br />
      {doc.previewUrl ? (
        <a href={doc.previewUrl} target="_blank" rel="noreferrer" className="mt-1 font-bold text-primary">
          Open file
        </a>
      ) : null}
    </div>
  );
}

function DocumentDetailForm({
  doc,
  categories,
  onAddCategory,
  onSave,
  onDelete,
}: {
  doc: DocumentFile;
  categories: string[];
  onAddCategory: (name: string) => void;
  onSave: (doc: DocumentFile) => Promise<void>;
  onDelete: (doc: DocumentFile) => void;
}) {
  const [form, setForm] = useState(doc);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, name: form.name.trim() || doc.name });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <DocumentPreview doc={doc} />
      <form onSubmit={handleSubmit}>
        <Label htmlFor="doc-name">Title</Label>
        <Input id="doc-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />

        <CategoryField
          id="doc-category-edit"
          categories={categories}
          value={form.category}
          onChange={(category) => setForm({ ...form, category })}
          onAddCategory={onAddCategory}
        />

        <Label htmlFor="doc-visibility-edit">Visibility</Label>
        <Select id="doc-visibility-edit" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as DocumentVisibility })}>
          <option value="client">Visible to client</option>
          <option value="planner-only">Planner only</option>
        </Select>

        <p className="mt-4 text-xs text-ink/50">
          {doc.uploader} · {doc.sizeLabel} · Uploaded {new Date(doc.uploadedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <Button type="submit" className="mt-5 w-full" loading={saving}>
          Save
        </Button>
        <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => onDelete(doc)}>
          Delete document
        </Button>
      </form>
    </div>
  );
}

function UploadForm({
  clientId,
  categories,
  onAddCategory,
  onUploaded,
}: {
  clientId: string;
  categories: string[];
  onAddCategory: (name: string) => void;
  onUploaded: (doc: DocumentFile) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState(categories[0] ?? "");
  const [visibility, setVisibility] = useState<DocumentVisibility>("client");
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function handleFiles(files: FileList | null) {
    const picked = files?.[0];
    if (picked) {
      setFile(picked);
      setError(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    if (!category.trim()) {
      setError("Add a category for this document.");
      return;
    }
    setUploading(true);
    try {
      const doc = await uploadDocument(clientId, file, category, visibility);
      onUploaded(doc);
    } catch (err) {
      setError(errorMessage(err, "Couldn't upload that file — please try again."));
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label
        htmlFor="file-upload"
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`block cursor-pointer border border-dashed px-4 py-8 text-center transition-colors ${
          dragActive ? "border-primary bg-bg-warm" : "border-[#ccc] hover:border-ink/40"
        }`}
      >
        {file ? (
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-xs text-ink/50">{formatFileSize(file.size)}</p>
          </div>
        ) : (
          <div>
            <p className="font-medium">Drag a file here, or click to browse</p>
            <p className="mt-1 text-xs text-ink/50">PDF, DOCX, JPG or PNG up to 25 MB</p>
          </div>
        )}
        <input id="file-upload" type="file" className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
      </label>
      {error ? <p className="mt-2 border-l-[3px] border-primary bg-[#fff2f0] p-2.5 text-sm text-[#5d2924]">{error}</p> : null}

      <CategoryField id="doc-category" categories={categories} value={category} onChange={setCategory} onAddCategory={onAddCategory} />

      <Label htmlFor="doc-visibility">Visibility</Label>
      <Select id="doc-visibility" value={visibility} onChange={(e) => setVisibility(e.target.value as DocumentVisibility)}>
        <option value="client">Visible to client</option>
        <option value="planner-only">Planner only</option>
      </Select>

      <Button type="submit" className="mt-5 w-full" loading={uploading} loadingText="Uploading…">
        Upload
      </Button>
    </form>
  );
}
