import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Label } from "@ovutor/ui";
import { AuthShell, AuthCard, AuthLogo, AuthEyebrow } from "@/components/AuthCard";
import { forgotPassword, errorMessage } from "@/lib/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <AuthShell>
      <AuthCard>
        <AuthLogo />
        <AuthEyebrow>Ovutor Admin · Account recovery</AuthEyebrow>
        <h1 className="my-2 font-display text-3xl">Reset your password</h1>
        <p className="mb-6 leading-relaxed text-ink/60">
          Enter the email you use for Ovutor. If it matches an account, we'll send secure instructions to reset your password.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            try {
              await forgotPassword(email);
              navigate("/reset-password/sent");
            } catch (err) {
              setError(errorMessage(err, "We couldn't send that reset link. Please try again."));
            } finally {
              setLoading(false);
            }
          }}
        >
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {error ? (
            <div className="my-4 border-l-[3px] border-primary bg-[#fff2f0] p-3 leading-snug text-[#5d2924]">{error}</div>
          ) : null}
          <Button type="submit" className="mt-5 w-full" loading={loading} loadingText="Sending…">
            Send reset link
          </Button>
        </form>
        <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }} className="mt-5 block text-sm font-bold text-primary">
          &larr; Back to sign in
        </a>
        <div className="mt-6 border-t border-[#eee] pt-5 text-sm leading-relaxed text-ink/60">
          <b className="text-ink">Secure by design</b>
          <br />
          Reset links expire after a limited time. You can safely request another if you need one.
        </div>
        <div className="mt-4 text-xs text-ink/50">
          Don't have access to this inbox? Contact your account administrator or <span className="font-bold text-primary">Ovutor Support</span>.
        </div>
      </AuthCard>
    </AuthShell>
  );
}
