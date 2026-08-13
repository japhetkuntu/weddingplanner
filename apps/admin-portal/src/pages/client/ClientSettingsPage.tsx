import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Select, Toast } from "@ovutor/ui";
import { useCurrentClient } from "@/hooks/useCurrentClient";
import { updateClient as apiUpdateClient, updatePortalEmail, resetPortalPassword } from "@/lib/api";
import { useClientsStore } from "@/store/clientsStore";
import { CURRENCIES } from "@/lib/currency";
import type { Client, ClientCredentials, ClientStatus } from "@/types";

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "on-track", label: "On track" },
  { value: "attention", label: "Attention" },
  { value: "early-planning", label: "Early planning" },
];

export default function ClientSettingsPage() {
  const client = useCurrentClient();
  const upsertClient = useClientsStore((s) => s.upsert);
  const [form, setForm] = useState<Client | undefined>(client);
  const [credentials, setCredentials] = useState<ClientCredentials | null>(null);
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  useEffect(() => {
    setForm(client);
  }, [client]);

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  }

  if (!client || !form) return null;

  async function saveDetails() {
    setSavingDetails(true);
    try {
      const updated = await apiUpdateClient(client!.id, {
        partnerA: form!.partnerA,
        partnerB: form!.partnerB,
        weddingDate: form!.weddingDate,
        venue: form!.venue,
        guestCount: form!.guestCount,
        status: form!.status,
        currency: form!.currency,
      });
      upsertClient(updated);
      flashToast("Client details saved");
    } finally {
      setSavingDetails(false);
    }
  }

  async function saveEmail() {
    setSavingEmail(true);
    try {
      const updated = await updatePortalEmail(client!.id, form!.portalEmail);
      upsertClient(updated);
      flashToast("Portal email saved");
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleResetPassword() {
    setResetting(true);
    try {
      const creds = await resetPortalPassword(client!.id);
      setCredentials(creds);
      flashToast("New password generated — copy and share it with the couple");
    } finally {
      setResetting(false);
    }
  }

  async function copyShareDetails() {
    if (!credentials) return;
    const shareText = `Portal: ${credentials.portalUrl}\nEmail: ${credentials.portalEmail}\nPassword: ${credentials.portalPassword}`;
    try {
      await navigator.clipboard.writeText(shareText);
      flashToast("Copied — paste it into a message to the couple");
    } catch {
      flashToast("Couldn't copy automatically — copy the details above manually");
    }
  }

  return (
    <div>
      <h1 className="mb-1.5 font-display text-3xl">Client settings</h1>
      <p className="mb-6 text-ink/60">Update {client.coupleNames}'s details and manage their Client Portal access.</p>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-xl">Client details</h2>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="partnerA">Partner one</Label>
              <Input id="partnerA" value={form.partnerA} onChange={(e) => setForm({ ...form, partnerA: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="partnerB">Partner two</Label>
              <Input id="partnerB" value={form.partnerB} onChange={(e) => setForm({ ...form, partnerB: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="weddingDate">Wedding date</Label>
              <Input id="weddingDate" type="date" value={form.weddingDate} onChange={(e) => setForm({ ...form, weddingDate: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="guestCount">Estimated guests</Label>
              <Input
                id="guestCount"
                type="number"
                min={0}
                value={form.guestCount}
                onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) || 0 })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="venue">Venue</Label>
              <Input id="venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="status">Planning status</Label>
              <Select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ClientStatus })}>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Budget currency</Label>
              <Select id="currency" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <Button className="mt-4" onClick={saveDetails} loading={savingDetails}>
            Save changes
          </Button>
        </Card>

        <Card>
          <h2 className="mb-1 font-display text-xl">Client Portal access</h2>
          <p className="mb-4 text-sm text-ink/60">
            Invitations aren't sent automatically. The password is only ever shown once, right after you generate it — reset it any time you
            need to share it again.
          </p>

          <Label htmlFor="portalEmail">Login email</Label>
          <div className="flex gap-2">
            <Input
              id="portalEmail"
              type="email"
              value={form.portalEmail}
              onChange={(e) => setForm({ ...form, portalEmail: e.target.value })}
              className="flex-1"
            />
            <Button variant="outline" onClick={saveEmail} loading={savingEmail}>
              Save
            </Button>
          </div>

          {credentials ? (
            <div className="mt-4 space-y-2 border border-[#ddd] bg-bg-warm p-3 text-sm">
              <p className="text-xs font-bold uppercase tracking-[.06em] text-primary">Shown once — copy it now</p>
              <div>
                <b className="block">Portal URL</b>
                <span className="text-ink/70">{credentials.portalUrl}</span>
              </div>
              <div>
                <b className="block">Login email</b>
                <span className="text-ink/70">{credentials.portalEmail}</span>
              </div>
              <div>
                <b className="block">Password</b>
                <span className="text-ink/70">{credentials.portalPassword}</span>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/50">Generate a password to see it and share it with the couple.</p>
          )}

          <div className="mt-5 flex flex-wrap gap-2 border-t border-[#eee] pt-4">
            <Button variant="outline" onClick={handleResetPassword} loading={resetting} loadingText="Generating…">
              Reset password
            </Button>
            <Button onClick={copyShareDetails} disabled={!credentials}>
              Copy portal, email &amp; password
            </Button>
          </div>
        </Card>
      </div>

      <Toast open={!!toast}>{toast}</Toast>
    </div>
  );
}
