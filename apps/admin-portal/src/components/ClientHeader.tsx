import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import clsx from "clsx";
import { Badge, Button, Modal, Textarea, Toast } from "@ovutor/ui";
import type { Client } from "@/types";
import { useClientsStore } from "@/store/clientsStore";
import { useUiStore } from "@/store/uiStore";
import { notifyCouple, errorMessage } from "@/lib/api";
import { ClientSwitcher } from "./ClientSwitcher";

const TABS = [
  { label: "Overview", segment: "overview" },
  { label: "Checklist", segment: "checklist" },
  { label: "Budget", segment: "budget" },
  { label: "RSVPs", segment: "rsvps" },
  { label: "Website", segment: "website" },
  { label: "Files", segment: "documents" },
  { label: "Settings", segment: "settings" },
];

function daysToGo(dateIso: string) {
  const diff = Math.ceil((new Date(dateIso).getTime() - Date.now()) / 86_400_000);
  return diff > 0 ? diff : 0;
}

export function ClientHeader({ client }: { client: Client }) {
  const setLastClientId = useUiStore((s) => s.setLastClientId);
  const clients = useClientsStore((s) => s.clients);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    setLastClientId(client.id);
  }, [client.id, setLastClientId]);

  return (
    <div className="mb-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-[#ddd] bg-bg-warm px-4 py-3">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-lg">{client.coupleNames}</span>
          <span className="text-sm text-ink/60">
            {new Date(client.weddingDate).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} · {client.venue}
          </span>
          <span className="text-xs font-bold uppercase tracking-[.08em] text-primary">{daysToGo(client.weddingDate)} days to go</span>
          {client.isArchived ? <Badge tone="muted">Archived</Badge> : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNotifyOpen(true)}
            className="border border-primary px-3 py-2 text-xs font-bold uppercase tracking-[.06em] text-primary hover:border-gold hover:bg-gold hover:text-ink"
          >
            Notify couple
          </button>
          <ClientSwitcher clients={clients.filter((c) => !c.isArchived || c.id === client.id)} current={client} />
        </div>
      </div>

      <Modal open={notifyOpen} onClose={() => setNotifyOpen(false)}>
        <NotifyCoupleForm
          client={client}
          onClose={() => setNotifyOpen(false)}
          onSent={() => {
            setNotifyOpen(false);
            setToast("Update sent to their portal");
            window.setTimeout(() => setToast(null), 2400);
          }}
        />
      </Modal>
      <Toast open={!!toast}>{toast}</Toast>
      <nav className="flex flex-wrap gap-1 border-b border-[#ddd]">
        {TABS.map((tab) => (
          <NavLink
            key={tab.segment}
            to={`/clients/${client.id}/${tab.segment}`}
            className={({ isActive }) =>
              clsx(
                "border-b-2 border-transparent px-3 py-2.5 text-xs font-bold uppercase tracking-[.06em] text-ink/60 hover:text-ink",
                isActive && "border-primary text-primary",
              )
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function NotifyCoupleForm({ client, onClose, onSent }: { client: Client; onClose: () => void; onSent: () => void }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setError("Let them know what changed before sending.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      await notifyCouple(client.id, message.trim());
      onSent();
    } catch (err) {
      setError(errorMessage(err, "Couldn't send that update — please try again."));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Notify {client.coupleNames}</p>
      <h2 className="my-1.5 font-display text-2xl">What changed?</h2>
      <p className="mb-4 text-ink/60">This appears in their portal right away.</p>

      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="e.g. Confirmed your final seating chart with the venue."
        autoFocus
      />

      {error ? <p className="mt-3 border-l-[3px] border-primary bg-[#fff2f0] p-2.5 text-sm text-[#5d2924]">{error}</p> : null}

      <div className="mt-6 flex gap-2">
        <Button type="submit" className="flex-1" loading={sending} loadingText="Sending…">
          Submit
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={sending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
