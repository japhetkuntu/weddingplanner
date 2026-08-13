import { useState } from "react";
import { Button, Card, Input, Label, Modal, Toast } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";
import { changePassword, updateProfile, errorMessage } from "@/lib/api";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const setUser = useAuthStore((s) => s.setUser);

  const [fullName, setFullName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2000);
  }

  function flashError(message: string) {
    setError(message);
    window.setTimeout(() => setError(null), 3200);
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const updated = await updateProfile(fullName, email);
      setUser(updated);
      flashToast("Profile saved");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't save your profile — please try again."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      flashToast("Password updated");
    } catch (e) {
      flashError(errorMessage(e, "Couldn't update password — check your current password."));
    } finally {
      setSavingPassword(false);
    }
  }

  const passwordError = newPassword.length > 0 && (newPassword.length < 10 || !/\d/.test(newPassword));

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Planner account</p>
      <h1 className="my-1.5 font-display text-4xl">Profile &amp; settings</h1>
      <p className="mb-6 text-ink/60">Keep your planner identity and access settings current.</p>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-xl">Your profile</h2>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center border border-primary font-display text-lg text-primary">
              {fullName.split(" ").map((p) => p[0]).slice(0, 2).join("")}
            </div>
            <div>
              <b className="block">{fullName}</b>
              <small className="text-ink/50">Lead planner · Ovutor</small>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="workEmail">Work email</Label>
              <Input id="workEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Button className="mt-4" onClick={saveProfile} loading={savingProfile}>
            Save changes
          </Button>
        </Card>

        <div className="space-y-4">
          <Card>
            <h2 className="mb-4 font-display text-xl">Security</h2>
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            {passwordError ? (
              <p className="mt-2 border-l-[3px] border-primary bg-[#fff2f0] p-2.5 text-sm text-[#5d2924]">
                Use at least 10 characters, including a number.
              </p>
            ) : null}
            <Button
              className="mt-4"
              disabled={!currentPassword || !newPassword || passwordError}
              onClick={savePassword}
              loading={savingPassword}
              loadingText="Updating…"
            >
              Update password
            </Button>
          </Card>
        </div>
      </div>

      <button type="button" onClick={() => setLogoutOpen(true)} className="mt-6 text-sm font-bold uppercase tracking-[.06em] text-primary">
        Log out of Ovutor
      </button>

      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Log out confirmation</p>
        <h2 className="my-1.5 font-display text-2xl">Log out of Ovutor?</h2>
        <p className="mb-5 text-ink/60">Your open work has been saved. Sign in again to return to your planner workspace.</p>
        <div className="flex gap-2">
          <Button onClick={signOut} className="flex-1">
            Log out
          </Button>
          <Button variant="outline" onClick={() => setLogoutOpen(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      </Modal>

      <Toast open={!!toast}>{toast}</Toast>
      <Toast open={!!error} tone="error">{error}</Toast>
    </div>
  );
}
