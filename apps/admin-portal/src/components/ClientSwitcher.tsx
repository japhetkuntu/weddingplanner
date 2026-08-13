import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, cn, Input } from "@ovutor/ui";
import type { Client, ClientStatus } from "@/types";

const STATUS_LABEL: Record<ClientStatus, string> = {
  "on-track": "On track",
  attention: "Attention",
  "early-planning": "Early planning",
};

const STATUS_TONE: Record<ClientStatus, "success" | "primary" | "muted"> = {
  "on-track": "success",
  attention: "primary",
  "early-planning": "muted",
};

export function ClientSwitcher({ clients, current }: { clients: Client[]; current: Client }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const filtered = clients.filter((c) => c.coupleNames.toLowerCase().includes(search.toLowerCase()));

  function select(id: string) {
    setOpen(false);
    if (id !== current.id) navigate(`/clients/${id}/overview`);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 border border-[#8e8985] bg-white px-3 py-2 text-xs font-bold uppercase tracking-[.05em] hover:border-ink"
      >
        Switch client
        <span className={cn("text-primary transition-transform", open && "rotate-180")}>&#9662;</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-[300px] border border-[#ddd] bg-white shadow-modal">
          <div className="border-b border-[#eee] p-2">
            <Input
              autoFocus
              placeholder="Search couples"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="p-4 text-center text-sm text-ink/50">No couples match your search.</p>
            ) : (
              filtered.map((c) => {
                const isCurrent = c.id === current.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => select(c.id)}
                    className={cn("flex w-full items-center gap-3 border-t border-[#f0f0f0] px-3 py-2.5 text-left first:border-t-0 hover:bg-bg-warm", isCurrent && "bg-bg-warm")}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center border border-primary/40 font-display text-sm text-primary">
                      {c.avatarInitials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">{c.coupleNames}</span>
                      <span className="block text-xs text-ink/50">
                        {new Date(c.weddingDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </span>
                    {isCurrent ? <span className="shrink-0 text-primary">&#10003;</span> : <Badge tone={STATUS_TONE[c.status]}>{STATUS_LABEL[c.status]}</Badge>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
