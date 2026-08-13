import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input, Label } from "@ovutor/ui";
import { AuthShell, AuthCard, AuthLogo, AuthEyebrow } from "@/components/AuthCard";
import { resetPassword, errorMessage } from "@/lib/api";
import clsx from "clsx";

const RULES = ["At least 10 characters", "A mix of letters, numbers and symbols", "Not a commonly used password"];

export default function NewPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const match = password.length > 0 && password === confirm;
  const showError = confirm.length > 0 && !match;

  return (
    <AuthShell>
      <AuthCard>
        <AuthLogo />
        <AuthEyebrow>Secure account recovery</AuthEyebrow>
        <h1 className="my-2 font-display text-3xl">Create a new password</h1>
        <p className="mb-4 leading-relaxed text-ink/60">Choose a new password for your Ovutor Admin account.</p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setApiError(null);
            try {
              await resetPassword(token, password);
              navigate("/reset-password/complete");
            } catch (err) {
              setApiError(errorMessage(err, "We couldn't reset your password. The link may have expired — request a new one."));
            } finally {
              setLoading(false);
            }
          }}
        >
          <Label htmlFor="new-password">New password</Label>
          <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />

          {showError ? (
            <div className="my-4 border-l-[3px] border-primary bg-[#fff2f0] p-3 text-sm text-[#5d2924]">
              <b>Passwords don't match yet.</b> Check both entries before continuing.
            </div>
          ) : null}

          {apiError ? <div className="my-4 border-l-[3px] border-primary bg-[#fff2f0] p-3 text-sm text-[#5d2924]">{apiError}</div> : null}

          <div className="my-4 border border-[#ddd] p-3 text-sm">
            <b className="mb-2 block">Password guidance</b>
            {RULES.map((rule) => (
              <div key={rule} className="flex items-center gap-2 py-0.5 text-ink/70">
                <span className="text-[#2f6d43]">&#10003;</span> {rule}
              </div>
            ))}
            <div className={clsx("flex items-center gap-2 py-0.5", match ? "text-[#2f6d43]" : "text-ink/50")}>
              <span>{match ? "✓" : "○"}</span> Confirm the same password above
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!match} loading={loading} loadingText="Saving…">
            Reset password
          </Button>
        </form>
        <p className="mt-4 text-xs text-ink/50">This secure link is valid for a limited time · Need help? Contact support</p>
      </AuthCard>
    </AuthShell>
  );
}
