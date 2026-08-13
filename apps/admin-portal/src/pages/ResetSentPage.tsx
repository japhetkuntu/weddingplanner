import { useNavigate } from "react-router-dom";
import { AuthShell, AuthCard, AuthLogo, AuthEyebrow } from "@/components/AuthCard";

const STEPS = ['Open the email from Ovutor', 'Select "Reset password"', "Create a new secure password"];

export default function ResetSentPage() {
  const navigate = useNavigate();
  return (
    <AuthShell>
      <AuthCard>
        <AuthLogo />
        <div className="mt-4 grid h-9 w-9 place-items-center border border-primary text-primary">&#10003;</div>
        <AuthEyebrow>Account recovery</AuthEyebrow>
        <h1 className="my-2 font-display text-3xl">Check your inbox</h1>
        <p className="mb-6 leading-relaxed text-ink/60">
          If an Ovutor account uses <b className="text-ink">jo••••@northstarplanning.com</b>, we've sent instructions to reset the password. The
          email usually arrives within a few minutes.
        </p>
        <div className="mb-6 space-y-3">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-3 text-sm">
              <span className="grid h-6 w-6 shrink-0 place-items-center border border-ink/30 text-xs font-bold">{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
        <button type="button" disabled className="w-full border border-ink/20 bg-bg-warm px-4 py-3 text-xs font-bold uppercase tracking-[.1em] text-ink/40">
          Resend email in 00:45
        </button>
        <div className="mt-4 flex flex-col gap-2 text-sm font-bold text-primary">
          <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }}>Use a different email</a>
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }}>Back to sign in</a>
        </div>
        <div className="mt-6 border-t border-[#eee] pt-5 text-sm leading-relaxed text-ink/60">
          <b className="text-ink">Still waiting?</b>
          <br />
          Check spam or promotions, or search for "Ovutor password reset." If it does not arrive, contact support.
        </div>
      </AuthCard>
    </AuthShell>
  );
}
