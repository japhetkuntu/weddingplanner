import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Button, Card, Input, Label, Modal, Select } from "@ovutor/ui";
import { createClient } from "@/lib/api";
import { useClientsStore } from "@/store/clientsStore";
import { CURRENCIES } from "@/lib/currency";
import type { ClientCredentials } from "@/types";

const STEPS = ["Couple details", "Wedding basics", "Start their plan"];

interface FormState {
  partnerA: string;
  partnerB: string;
  email: string;
  weddingDate: string;
  guestCount: string;
  region: string;
  stage: string;
  ceremonyVenue: string;
  receptionVenue: string;
  packageType: string;
  portalAccess: string;
  template: string;
  currency: string;
  budgetTarget: string;
}

const INITIAL: FormState = {
  partnerA: "Maya Patel",
  partnerB: "Jordan Reyes",
  email: "maya.patel@example.com",
  weddingDate: "2025-09-14",
  guestCount: "120",
  region: "Brooklyn, New York",
  stage: "Discovery",
  ceremonyVenue: "The Glasshouse",
  receptionVenue: "The Glasshouse — same venue",
  packageType: "Full planning",
  portalAccess: "Invite after setup",
  template: "Standard 12-month timeline",
  currency: "USD",
  budgetTarget: "45000",
};

export default function AddClientPage() {
  const navigate = useNavigate();
  const upsertClient = useClientsStore((s) => s.upsert);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<{ clientId: string; creds: ClientCredentials } | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function finish() {
    setSaving(true);
    try {
      const { client, credentials: creds } = await createClient({
        partnerA: form.partnerA,
        partnerB: form.partnerB,
        contactEmail: form.email,
        weddingDate: form.weddingDate,
        venue: form.ceremonyVenue,
        guestCount: Number(form.guestCount) || 0,
        currency: form.currency,
        budgetTarget: Number(form.budgetTarget) || 0,
      });
      upsertClient(client);
      setCredentials({ clientId: client.id, creds });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="text-sm text-ink/50">Clients / Add client</p>
      <p className="mt-3 text-[10px] font-bold uppercase tracking-[.12em] text-primary">New wedding workspace</p>
      <h1 className="my-1.5 font-display text-4xl">Add client</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <div className="mb-6 flex flex-wrap gap-4 border-b border-[#eee] pb-4">
            {STEPS.map((label, i) => (
              <div key={label} className={clsx("flex items-center gap-2 text-sm", i === step ? "font-bold text-primary" : i < step ? "text-[#2f6d43]" : "text-ink/40")}>
                <span className={clsx("grid h-6 w-6 place-items-center border text-xs", i === step ? "border-primary" : i < step ? "border-[#2f6d43]" : "border-ink/30")}>
                  {i < step ? "✓" : i + 1}
                </span>
                {label}
              </div>
            ))}
          </div>

          {step === 0 ? (
            <div>
              <h2 className="mb-1 font-display text-2xl">Who's getting married?</h2>
              <p className="mb-4 text-ink/60">This becomes the couple's name across the whole workspace.</p>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="partnerA">Partner one</Label>
                  <Input id="partnerA" value={form.partnerA} onChange={(e) => update("partnerA", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="partnerB">Partner two</Label>
                  <Input id="partnerB" value={form.partnerB} onChange={(e) => update("partnerB", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Preferred contact email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="mb-1 font-display text-2xl">Tell us about the wedding</h2>
              <p className="mb-4 text-ink/60">
                These details create {form.partnerA.split(" ")[0]} &amp; {form.partnerB.split(" ")[0]}'s planning workspace and keep their wedding
                context visible everywhere.
              </p>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="weddingDate">Wedding date</Label>
                  <Input id="weddingDate" type="date" value={form.weddingDate} onChange={(e) => update("weddingDate", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="guestCount">Estimated guests</Label>
                  <Input id="guestCount" value={form.guestCount} onChange={(e) => update("guestCount", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="region">City / region</Label>
                  <Input id="region" value={form.region} onChange={(e) => update("region", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="stage">Planning stage</Label>
                  <Select id="stage" value={form.stage} onChange={(e) => update("stage", e.target.value)}>
                    <option>Discovery</option>
                    <option>Design</option>
                    <option>Bookings</option>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="ceremonyVenue">Ceremony venue</Label>
                  <Input id="ceremonyVenue" value={form.ceremonyVenue} onChange={(e) => update("ceremonyVenue", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="receptionVenue">Reception venue</Label>
                  <Input id="receptionVenue" value={form.receptionVenue} onChange={(e) => update("receptionVenue", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="packageType">Planning package</Label>
                  <Select id="packageType" value={form.packageType} onChange={(e) => update("packageType", e.target.value)}>
                    <option>Full planning</option>
                    <option>Partial planning</option>
                    <option>Month-of coordination</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="portalAccess">Couple portal access</Label>
                  <Select id="portalAccess" value={form.portalAccess} onChange={(e) => update("portalAccess", e.target.value)}>
                    <option>Invite after setup</option>
                    <option>Invite now</option>
                  </Select>
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="mb-1 font-display text-2xl">Start their plan</h2>
              <p className="mb-4 text-ink/60">Choose a planning template and budget target to seed their checklist and budget.</p>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="template">Planning template</Label>
                  <Select id="template" value={form.template} onChange={(e) => update("template", e.target.value)}>
                    <option>Standard 12-month timeline</option>
                    <option>Condensed 6-month timeline</option>
                    <option>Elopement / small wedding</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency">Budget currency</Label>
                  <Select id="currency" value={form.currency} onChange={(e) => update("currency", e.target.value)}>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </Select>
                  <p className="mt-1 text-xs text-ink/50">The couple may prefer a different currency than yours — this sets how their budget displays everywhere.</p>
                </div>
                <div>
                  <Label htmlFor="budgetTarget">Budget target</Label>
                  <Input id="budgetTarget" value={form.budgetTarget} onChange={(e) => update("budgetTarget", e.target.value)} />
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex justify-between border-t border-[#eee] pt-5">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              &larr; Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue &rarr;</Button>
            ) : (
              <Button onClick={finish} loading={saving} loadingText="Creating…">
                Create workspace &rarr;
              </Button>
            )}
          </div>
        </Card>

        <aside className="h-fit border border-[#ddd] bg-bg-warm p-5">
          <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Workspace being created</p>
          <h2 className="my-1.5 font-display text-2xl">
            {form.partnerA.split(" ")[0]} &amp; {form.partnerB.split(" ")[0]}
          </h2>
          <div className="space-y-3 border-t border-[#ddd] pt-3 text-sm">
            <div>
              <b className="block">Lead planner</b>
              <small className="text-ink/60">Maya</small>
            </div>
            <div>
              <b className="block">Preferred contact</b>
              <small className="text-ink/60">Email · {form.email}</small>
            </div>
            <div>
              <b className="block">Next step</b>
              <small className="text-ink/60">Choose a planning template, budget target and invitation timing.</small>
            </div>
          </div>
          <div className="mt-4 border-t border-[#ddd] pt-3 text-sm text-ink/60">
            <b className="block text-ink">What happens when you finish</b>
            Ovutor creates the couple, their wedding command center and the selected planning structure — then takes you directly to their new
            overview.
          </div>
        </aside>
      </div>

      <Modal open={!!credentials} onClose={() => {}}>
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Workspace created</p>
        <h2 className="my-1.5 font-display text-2xl">Save the Client Portal password now</h2>
        <p className="mb-5 text-ink/60">
          This is the only time the password is shown. Copy it and share it with the couple — you can always generate a new one later from
          their Settings page.
        </p>
        {credentials ? (
          <div className="space-y-3 border border-[#ddd] bg-bg-warm p-3 text-sm">
            <div>
              <b className="block">Portal URL</b>
              <span className="text-ink/70">{credentials.creds.portalUrl}</span>
            </div>
            <div>
              <b className="block">Login email</b>
              <span className="text-ink/70">{credentials.creds.portalEmail}</span>
            </div>
            <div>
              <b className="block">Password</b>
              <span className="text-ink/70">{credentials.creds.portalPassword}</span>
            </div>
          </div>
        ) : null}
        <Button className="mt-5 w-full" onClick={() => credentials && navigate(`/clients/${credentials.clientId}/overview`)}>
          Continue to workspace
        </Button>
      </Modal>
    </div>
  );
}
