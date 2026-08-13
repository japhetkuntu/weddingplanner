import { Badge, Card } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";

const STATUS_TONE: Record<string, "success" | "primary" | "muted"> = {
  "On track": "success",
  Attention: "primary",
  "Early planning": "muted",
};

export default function ProfilePage() {
  const profile = useAuthStore((s) => s.profile);
  if (!profile) return null;

  const initials = `${profile.partnerA[0]}${profile.partnerB[0]}`;

  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Your account</p>
      <h1 className="my-1.5 font-display text-4xl">Profile</h1>
      <p className="mb-6 max-w-xl text-ink/60">
        Your account information is maintained by your Ovutor planning team so your shared wedding record stays current and secure.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-display text-xl">Your information</h2>
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center border border-primary font-display text-lg text-primary">{initials}</div>
            <div>
              <b className="block">
                {profile.partnerA} &amp; {profile.partnerB}
              </b>
              <small className="text-ink/50">{profile.workspace}</small>
            </div>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-ink/50">Email</dt>
              <dd className="font-medium">{profile.email}</dd>
            </div>
            <div>
              <dt className="text-ink/50">Venue</dt>
              <dd className="font-medium">{profile.venue}</dd>
            </div>
            <div>
              <dt className="text-ink/50">Workspace</dt>
              <dd className="font-medium">{profile.workspace}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs font-bold uppercase tracking-[.06em] text-ink/40">View-only account</p>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-xl">Your planning team</h2>
          <div className="mb-4">
            <b className="block">{profile.planner.name}</b>
            <small className="text-ink/50">{profile.planner.role}</small>
          </div>
          <div className="border-t border-[#eee] pt-4">
            <span className="text-sm text-ink/60">Planning status:</span>{" "}
            <Badge tone={STATUS_TONE[profile.planningStatus] ?? "muted"}>{profile.planningStatus}</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
