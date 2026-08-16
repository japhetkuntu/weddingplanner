import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Checkbox, Input, Label, PasswordInput } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);
  const [email, setEmail] = useState("");
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
      <section className="hidden flex-col justify-between bg-ink px-10 py-12 text-white lg:flex xl:px-16">
        <div className="font-display text-3xl">
          Ovutor <span className="text-primary">&#9825;</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white">Your wedding, in hand</p>
          <h1 className="my-3 max-w-md font-display text-5xl leading-[1.1]">
            Thoughtfully planned.
            <br />
            Beautifully celebrated.
          </h1>
          <p className="max-w-md leading-relaxed text-[#eee7e2]">
            A calm shared home for every decision, detail, and moment on the way to your wedding day.
          </p>
          <div className="mt-8 max-w-md border-t border-white/30 pt-5 italic leading-relaxed text-[#eee7e2]">
            &ldquo;We can see what matters, together—and that makes planning feel lighter.&rdquo;
          </div>
        </div>
        <div />
      </section>

      <main className="grid place-items-center px-6 py-10 sm:px-10">
        <section className="w-full max-w-[420px]">
          <p className="text-[11px] font-bold uppercase tracking-[.13em] text-primary">Couple portal</p>
          <h2 className="my-2 font-display text-4xl">Welcome back.</h2>
          <p className="mb-6 text-ink/60">Sign in to your wedding workspace.</p>
          <form onSubmit={handleSubmit}>
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <div className="my-4">
              <Checkbox id="remember" label="Remember me" />
            </div>
            {error ? (
              <div className="my-4 border-l-[3px] border-primary bg-[#fff2f0] p-3 leading-snug text-[#5d2924]">
                We couldn't sign you in with those details.
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-5 text-sm text-ink/50">Need help with your account? Contact your Ovutor planner.</p>
        </section>
      </main>
    </div>
  );
}
