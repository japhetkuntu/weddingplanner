import { useEffect, useMemo, useState } from "react";
import { Button, cn, Drawer, EmptyState, Label, Modal, Select, Skeleton, Toast } from "@ovutor/ui";
import { getDocuments, uploadDocument, errorMessage } from "@/lib/api";
import type { DocumentFile } from "@/types";

const ALL_FILES = "All files";
const UPLOAD_CATEGORIES = ["Contract", "Checklist", "Photo", "Other"];

function DocumentsSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-3 w-56" />
      <Skeleton className="my-2 h-9 w-64" />
      <Skeleton className="mb-6 h-4 w-full max-w-md" />
      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24" />
        ))}
      </div>
      <div className="divide-y divide-[#eee] border border-[#ddd]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="mt-1.5 h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentPreview({ doc }: { doc: DocumentFile }) {
  if (doc.url && doc.fileType?.startsWith("image/")) {
    return (
      <div className="mb-4 border border-[#ddd] bg-bg-warm">
        <img src={doc.url} alt={doc.name} className="max-h-64 w-full object-contain" loading="lazy" decoding="async" />
      </div>
    );
  }
  if (doc.url && doc.fileType === "application/pdf") {
    return (
      <div className="mb-4 border border-[#ddd]">
        <iframe title={doc.name} src={doc.url} className="h-64 w-full" />
      </div>
    );
  }
  return (
    <div className="mb-4 grid h-40 place-items-center border border-dashed border-[#ccc] bg-bg-warm text-center text-sm text-ink/40">
      No preview available for this file type.
    </div>
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadForm({ onClose, onUploaded }: { onClose: () => void; onUploaded: (doc: DocumentFile) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState(UPLOAD_CATEGORIES[0]);
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
    setUploading(true);
    try {
      const doc = await uploadDocument(file, category);
      onUploaded(doc);
    } catch (err) {
      setError(errorMessage(err, "Couldn't upload that file — please try again."));
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Share a file</p>
      <h2 className="my-1.5 font-display text-2xl">Upload a file</h2>
      <p className="mb-4 text-ink/60">Your planner will see this right away — contracts, checklists, or photos for your wedding website.</p>

      <label
        htmlFor="couple-file-upload"
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
        className={cn(
          "block cursor-pointer border border-dashed px-4 py-8 text-center transition-colors",
          dragActive ? "border-primary bg-bg-warm" : "border-[#ccc] hover:border-ink/40",
        )}
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
        <input id="couple-file-upload" type="file" className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
      </label>
      {error ? <p className="mt-2 border-l-[3px] border-primary bg-[#fff2f0] p-2.5 text-sm text-[#5d2924]">{error}</p> : null}

      <Label htmlFor="couple-file-category">Category</Label>
      <Select id="couple-file-category" value={category} onChange={(e) => setCategory(e.target.value)}>
        {UPLOAD_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>

      <div className="mt-6 flex gap-2">
        <Button type="submit" className="flex-1" loading={uploading} loadingText="Uploading…">
          Upload
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(ALL_FILES);
  const [selected, setSelected] = useState<DocumentFile | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, []);

  // Derived from the couple's actual documents rather than a fixed list — a category only shows
  // up as a filter once something has been shared under it.
  const filters = useMemo(() => [ALL_FILES, ...new Set(documents.map((d) => d.category))], [documents]);

  if (loading) return <DocumentsSkeleton />;

  const filtered = filter === ALL_FILES ? documents : documents.filter((d) => d.category === filter);

  function handleUploaded(doc: DocumentFile) {
    setDocuments((prev) => [doc, ...prev]);
    setUploadOpen(false);
    setToast("File uploaded");
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="ovutor-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Managed with your Ovutor planner</p>
          <h1 className="my-1.5 font-display text-4xl">Your wedding files</h1>
          <p className="text-ink/60">Contracts, checklists, and photos — shared both ways, always in one place.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>+ Upload file</Button>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title="No files yet"
          message="Upload a contract, checklist, or photo for your planner — or wait for them to share something with you."
          action={<Button onClick={() => setUploadOpen(true)}>+ Upload file</Button>}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "border px-3 py-1.5 text-xs font-bold uppercase tracking-[.06em]",
                  filter === f ? "border-gold bg-gold text-ink" : "border-ink/20 text-ink/60 hover:border-ink/40",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="divide-y divide-[#eee] border border-[#ddd] bg-white">
            {filtered.map((doc) => (
          <button key={doc.id} type="button" onClick={() => setSelected(doc)} className="flex w-full flex-wrap items-center gap-3 px-4 py-3.5 text-left hover:bg-bg-warm">
            <div className="grid h-10 w-10 shrink-0 place-items-center border border-[#ddd] bg-bg-warm text-xs font-bold text-ink/50">
              {doc.name.split(".").pop()?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{doc.name}</p>
              <p className="text-xs text-ink/50">
                {doc.uploader} · {doc.sizeLabel} · {new Date(doc.uploadedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </button>
            ))}
          </div>
        </>
      )}

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)}>
        <UploadForm onClose={() => setUploadOpen(false)} onUploaded={handleUploaded} />
      </Modal>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ""}>
        {selected ? (
          <div>
            <DocumentPreview doc={selected} />
            <p className="mb-4 text-sm text-ink/60">
              Uploaded by {selected.uploader} on {new Date(selected.uploadedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
            </p>
            <a
              href={selected.url}
              target="_blank"
              rel="noreferrer"
              className="block w-full border border-gold bg-gold px-4 py-3 text-center text-xs font-bold uppercase tracking-[.1em] text-ink"
            >
              Download
            </a>
          </div>
        ) : null}
      </Drawer>

      <Toast open={!!toast}>{toast}</Toast>
    </div>
  );
}
