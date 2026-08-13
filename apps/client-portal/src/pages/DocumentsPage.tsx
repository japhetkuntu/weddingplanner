import { useEffect, useMemo, useState } from "react";
import { cn, Drawer, EmptyState, Skeleton } from "@ovutor/ui";
import { getDocuments } from "@/lib/api";
import type { DocumentFile } from "@/types";

const ALL_FILES = "All files";

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
        <img src={doc.url} alt={doc.name} className="max-h-64 w-full object-contain" />
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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(ALL_FILES);
  const [selected, setSelected] = useState<DocumentFile | null>(null);

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

  return (
    <div className="ovutor-fade-in">
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Managed by your Ovutor planner</p>
      <h1 className="my-1.5 font-display text-4xl">Shared documents</h1>
      <p className="mb-6 text-ink/60">Your current contracts, plans, and wedding records—always ready to revisit.</p>

      {documents.length === 0 ? (
        <EmptyState
          title="No documents shared yet"
          message="Once your planner uploads contracts, timelines, or vendor paperwork, they'll show up here."
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
                  filter === f ? "border-primary bg-primary text-white" : "border-ink/20 text-ink/60 hover:border-ink/40",
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
              className="block w-full border border-primary bg-primary px-4 py-3 text-center text-xs font-bold uppercase tracking-[.1em] text-white"
            >
              Download
            </a>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
