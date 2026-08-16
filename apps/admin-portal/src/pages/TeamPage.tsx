import { useEffect, useState } from "react";
import { Button, Card, Input, Label, Modal, Skeleton, Toast } from "@ovutor/ui";
import { getTeam, addTeamMember, removeTeamMember, errorMessage } from "@/lib/api";
import { CredentialsPanel } from "@/components/CredentialsPanel";
import { useAuthStore } from "@/store/authStore";
import type { AdminUser } from "@/types";

function TeamSkeleton() {
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

export default function TeamPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [members, setMembers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<AdminUser | null>(null);
  const [removing, setRemoving] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ email: string; password: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTeam()
      .then(setMembers)
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

  async function handleRemove() {
    if (!confirmRemove) return;
    setRemoving(true);
    try {
      await removeTeamMember(confirmRemove.id);
      setMembers((prev) => prev.filter((m) => m.id !== confirmRemove.id));
      setConfirmRemove(null);
      flashToast("Team member removed");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't remove that team member — please try again."));
    } finally {
      setRemoving(false);
    }
  }

  if (loading) return <TeamSkeleton />;

  return (
    <div className="ovutor-fade-in">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Team</h1>
          <p className="text-ink/60">Everyone with access to the Ovutor admin portal.</p>
        </div>
        <Button size="sm" onClick={() => setShowAdd(true)}>
          + Add team member
        </Button>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <Card key={member.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center border border-primary font-display text-lg text-primary">
                {member.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div>
                <b className="block">{member.name}</b>
                <small className="text-ink/50">{member.email} · {member.role}</small>
              </div>
            </div>
            {member.id !== currentUser?.id ? (
              <button
                type="button"
                onClick={() => setConfirmRemove(member)}
                className="text-xs font-bold uppercase tracking-[.06em] text-primary"
              >
                Remove
              </button>
            ) : (
              <span className="text-xs text-ink/40">You</span>
            )}
          </Card>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)}>
        <AddTeamMemberForm
          onClose={() => setShowAdd(false)}
          onAdded={(member, temporaryPassword) => {
            setMembers((prev) => [...prev, member]);
            setShowAdd(false);
            setNewCredentials({ email: member.email, password: temporaryPassword });
          }}
        />
      </Modal>

      <Modal open={!!newCredentials} onClose={() => setNewCredentials(null)}>
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Team member added</p>
        <h2 className="my-1.5 font-display text-2xl">Save this password now</h2>
        <p className="mb-5 text-ink/60">
          This is the only time the password is shown. Copy it and share it with your teammate — they can update it later from Profile & Settings.
        </p>
        {newCredentials ? (
          <CredentialsPanel
            portalUrl={`${window.location.origin}/login`}
            portalEmail={newCredentials.email}
            portalPassword={newCredentials.password}
          />
        ) : null}
        <Button className="mt-5 w-full" onClick={() => setNewCredentials(null)}>
          Done
        </Button>
      </Modal>

      <Modal open={!!confirmRemove} onClose={() => setConfirmRemove(null)}>
        {confirmRemove ? (
          <div>
            <h3 className="mb-2 font-display text-2xl">Remove {confirmRemove.name}?</h3>
            <p className="mb-6 text-ink/60">They'll immediately lose access to the admin portal. This can't be undone.</p>
            <div className="flex gap-2">
              <Button onClick={handleRemove} className="flex-1" loading={removing} loadingText="Removing…">
                Remove
              </Button>
              <Button variant="outline" onClick={() => setConfirmRemove(null)} className="flex-1" disabled={removing}>
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

function AddTeamMemberForm({ onClose, onAdded }: { onClose: () => void; onAdded: (member: AdminUser, temporaryPassword: string) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Planner");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Name and email are both required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await addTeamMember(name.trim(), email.trim(), role.trim() || "Planner");
      onAdded(result.user, result.temporaryPassword);
    } catch (err) {
      setError(errorMessage(err, "Couldn't add that team member — please try again."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">New team member</p>
      <h2 className="my-1.5 font-display text-2xl">Add to the team</h2>
      <p className="mb-5 text-ink/60">They'll get a temporary password to sign in with — shown once you add them.</p>

      <Label htmlFor="member-name">Full name</Label>
      <Input id="member-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />

      <Label htmlFor="member-email">Work email</Label>
      <Input id="member-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <Label htmlFor="member-role">Role</Label>
      <Input id="member-role" value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Lead Planner, Coordinator" />

      {error ? <p className="mt-3 border-l-[3px] border-primary bg-[#fff2f0] p-2.5 text-sm text-[#5d2924]">{error}</p> : null}

      <div className="mt-6 flex gap-2">
        <Button type="submit" className="flex-1" loading={saving} loadingText="Adding…">
          Add team member
        </Button>
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
