import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Label, Checkbox } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("maya@northstarplanning.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-ink px-10 py-12 text-white lg:flex xl:px-16">
        <div className="pointer-events-none absolute -bottom-36 -right-40 h-[420px] w-[420px] rotate-[25deg] border border-primary" />
        <div>
          <div className="font-display text-3xl">
            Ovutor <span className="text-primary">&#9825;</span>
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#e7aca6]">Protected planning workspace</p>
        </div>
        <div className="relative z-10">
          <h1 className="max-w-md font-display text-5xl leading-[1.1]">Every celebration, beautifully in sync.</h1>
          <p className="mt-3.5 max-w-md leading-relaxed text-[#eee7e2]">
            Securely coordinate the decisions, people and details that keep meaningful wedding days moving.
          </p>
          <div className="mt-6 grid max-w-md grid-cols-2 gap-3.5 border-t border-white/30 pt-5">
            <div>
              <b className="block font-display text-3xl">38</b>
              <span className="text-sm text-[#eee7e2]">celebrations in planning</span>
            </div>
            <div>
              <b className="block font-display text-3xl">1 place</b>
              <span className="text-sm text-[#eee7e2]">for every detail that matters</span>
            </div>
          </div>
        </div>
      </section>

      <main className="grid place-items-center px-6 py-10 sm:px-10">
        <section className="w-full max-w-[430px]">
          <p className="text-[11px] font-bold uppercase tracking-[.13em] text-primary">Ovutor Admin</p>
          <h2 className="my-2 font-display text-4xl">Welcome back</h2>
          <p className="mb-6 text-ink/60">Sign in to keep every celebration moving.</p>
          <form onSubmit={handleSubmit}>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error ? (
              <div className="my-4 border-l-[3px] border-primary bg-[#fff2f0] p-3 leading-snug text-[#5d2924]">
                <b>We couldn't sign you in with those details.</b>
                <br />
                Check your email and password, or reset your password to get back in.
              </div>
            ) : null}

            <div className="my-4 flex flex-wrap items-center justify-between gap-2">
              <Checkbox id="keep-signed-in" label={<span>Keep me signed in <span className="text-ink/50">(personal devices only)</span></span>} />
              <a href="/forgot-password" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }} className="text-sm font-bold text-primary">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
            <p className="mt-4 text-xs leading-relaxed text-ink/50">
              Your account helps protect couples' plans and private event information.
            </p>
          </form>
          <div className="mt-8 flex flex-wrap gap-4 text-xs text-ink/50">
            <a href="#help" className="font-bold text-primary">Need help accessing your account?</a>
            <span>Privacy</span>
            <span>Terms</span>
            <span>System status</span>
          </div>
        </section>
      </main>
    </div>
  );
}
