import { useNavigate } from "react-router-dom";
import { Button } from "@ovutor/ui";
import { AuthLogo } from "@/components/AuthCard";

export default function ResetCompletePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg px-4 py-10">
      <div className="mx-auto max-w-[900px]">
        <AuthLogo />
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <section className="border border-[#ddd] bg-white p-8">
            <div className="grid h-10 w-10 place-items-center border border-[#2f6d43] text-[#2f6d43]">&#10003;</div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[.14em] text-primary">Account recovery complete</p>
            <h1 className="my-2 font-display text-3xl">Password updated</h1>
            <p className="mb-6 leading-relaxed text-ink/60">Your Ovutor password has been reset. Sign in with your new password to continue.</p>
            <Button onClick={() => navigate("/login")}>Go to sign in</Button>
            <p className="mt-4 text-xs text-ink/50">For your security, you may need to sign in again on other devices.</p>
          </section>
          <section className="border border-[#ddd] bg-bg-warm p-8">
            <div className="grid h-10 w-10 place-items-center border border-primary text-primary">!</div>
            <p className="mt-4 text-[10px] font-bold uppercase tracking-[.14em] text-primary">Recovery edge case</p>
            <h2 className="my-2 font-display text-2xl">This reset link has expired</h2>
            <p className="mb-6 leading-relaxed text-ink/60">
              Password reset links are single-use and expire to keep your account secure. You are not locked out—request a fresh link and continue.
            </p>
            <Button variant="outline" onClick={() => navigate("/forgot-password")}>
              Send a new reset link
            </Button>
            <button type="button" onClick={() => navigate("/login")} className="mt-4 block text-sm font-bold text-primary">
              Back to sign in
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
