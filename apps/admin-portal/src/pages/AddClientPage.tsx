import { useState } from "react";
import { useNavigate } from "react-router-dom";
import clsx from "clsx";
import { Button, Card, ErrorModal, Input, Label, Modal, Select } from "@ovutor/ui";
import { createClient, errorMessage } from "@/lib/api";
import { useClientsStore } from "@/store/clientsStore";
import { CURRENCIES } from "@/lib/currency";
import { CredentialsPanel } from "@/components/CredentialsPanel";
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
  currency: string;
  budgetTarget: string;
}

// Which fields are required on each step, and the label to show if left blank — checked
// before advancing or submitting so a blank form can't silently go nowhere (previously
// "Create workspace" would just call the API with empty strings and, if that failed,
// show no feedback at all).
const REQUIRED_BY_STEP: { key: keyof FormState; label: string }[][] = [
  [
    { key: "partnerA", label: "Partner one" },
    { key: "partnerB", label: "Partner two" },
    { key: "email", label: "Preferred contact email" },
  ],
  [
    { key: "weddingDate", label: "Wedding date" },
    { key: "guestCount", label: "Estimated guests" },
    { key: "ceremonyVenue", label: "Ceremony venue" },
  ],
  [{ key: "budgetTarget", label: "Budget target" }],
];

const INITIAL: FormState = {
  partnerA: "",
  partnerB: "",
  email: "",
  weddingDate: "",
  guestCount: "",
  region: "",
  stage: "Discovery",
  ceremonyVenue: "",
  receptionVenue: "",
  packageType: "Full planning",
  portalAccess: "Invite after setup",
  currency: "USD",
  budgetTarget: "",
};

export default function AddClientPage() {
  const navigate = useNavigate();
  const upsertClient = useClientsStore((s) => s.upsert);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [saving, setSaving] = useState(false);
  const [credentials, setCredentials] = useState<{ clientId: string; creds: ClientCredentials } | null>(null);
  const [blockingError, setBlockingError] = useState<{ title: string; message: string } | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const firstA = form.partnerA.split(" ")[0] || "Partner one";
  const firstB = form.partnerB.split(" ")[0] || "partner two";

  /** Returns the labels of any required fields on this step still left blank. */
  function missingFieldsFor(stepIndex: number): string[] {
    return REQUIRED_BY_STEP[stepIndex].filter((f) => !form[f.key].trim()).map((f) => f.label);
  }

  function goToStep(next: number) {
    const missing = missingFieldsFor(step);
    if (missing.length > 0) {
      setBlockingError({
        title: "A few details are missing",
        message: `Please fill in before continuing: ${missing.join(", ")}.`,
      });
      return;
    }
    setStep(next);
  }

  async function finish() {
    const missing = missingFieldsFor(step);
    if (missing.length > 0) {
      setBlockingError({
        title: "A few details are missing",
        message: `Please fill in before creating the workspace: ${missing.join(", ")}.`,
      });
      return;
    }

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
    } catch (e) {
      setBlockingError({ title: "Couldn't create this workspace", message: errorMessage(e, "Something went wrong creating this client. Please try again.") });
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
                  <Input id="partnerA" placeholder="e.g. Maya Patel" value={form.partnerA} onChange={(e) => update("partnerA", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="partnerB">Partner two</Label>
                  <Input id="partnerB" placeholder="e.g. Jordan Reyes" value={form.partnerB} onChange={(e) => update("partnerB", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="email">Preferred contact email</Label>
                  <Input id="email" type="email" placeholder="couple@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="mb-1 font-display text-2xl">Tell us about the wedding</h2>
              <p className="mb-4 text-ink/60">
                These details create {firstA} &amp; {firstB}'s planning workspace and keep their wedding context visible everywhere.
              </p>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="weddingDate">Wedding date</Label>
                  <Input id="weddingDate" type="date" value={form.weddingDate} onChange={(e) => update("weddingDate", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="guestCount">Estimated guests</Label>
                  <Input id="guestCount" placeholder="e.g. 120" value={form.guestCount} onChange={(e) => update("guestCount", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="region">City / region</Label>
                  <Input id="region" placeholder="e.g. Brooklyn, New York" value={form.region} onChange={(e) => update("region", e.target.value)} />
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
                  <Input id="ceremonyVenue" placeholder="Venue name" value={form.ceremonyVenue} onChange={(e) => update("ceremonyVenue", e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="receptionVenue">Reception venue</Label>
                  <Input
                    id="receptionVenue"
                    placeholder="Venue name, or same as ceremony"
                    value={form.receptionVenue}
                    onChange={(e) => update("receptionVenue", e.target.value)}
                  />
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
              <p className="mb-4 text-ink/60">Set a budget target to seed their budget tracking.</p>
              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
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
                  <Input id="budgetTarget" placeholder="e.g. 45000" value={form.budgetTarget} onChange={(e) => update("budgetTarget", e.target.value)} />
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex justify-between border-t border-[#eee] pt-5">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
              &larr; Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => goToStep(step + 1)}>Continue &rarr;</Button>
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
            {firstA} &amp; {firstB}
          </h2>
          <div className="space-y-3 border-t border-[#ddd] pt-3 text-sm">
            <div>
              <b className="block">Lead planner</b>
              <small className="text-ink/60">Maya</small>
            </div>
            <div>
              <b className="block">Preferred contact</b>
              <small className="text-ink/60">Email · {form.email || "not set yet"}</small>
            </div>
            <div>
              <b className="block">Next step</b>
              <small className="text-ink/60">Set a budget target and invitation timing.</small>
            </div>
          </div>
          <div className="mt-4 border-t border-[#ddd] pt-3 text-sm text-ink/60">
            <b className="block text-ink">What happens when you finish</b>
            Ovutor creates the couple and their wedding command center — then takes you directly to their new overview.
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
          <CredentialsPanel
            portalUrl={credentials.creds.portalUrl}
            portalEmail={credentials.creds.portalEmail}
            portalPassword={credentials.creds.portalPassword}
          />
        ) : null}
        <Button className="mt-5 w-full" onClick={() => credentials && navigate(`/clients/${credentials.clientId}/overview`)}>
          Continue to workspace
        </Button>
      </Modal>

      <ErrorModal
        open={!!blockingError}
        onClose={() => setBlockingError(null)}
        title={blockingError?.title}
        message={blockingError?.message ?? ""}
      />
    </div>
  );
}
