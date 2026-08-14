import { CopyButton } from "@ovutor/ui";

export function CredentialsPanel({
  portalUrl,
  portalEmail,
  portalPassword,
}: {
  portalUrl: string;
  portalEmail: string;
  portalPassword: string;
}) {
  return (
    <div className="space-y-3 border border-[#ddd] bg-bg-warm p-3 text-sm">
      <div>
        <div className="mb-0.5 flex items-center justify-between gap-2">
          <b>Portal URL</b>
          <CopyButton value={portalUrl} />
        </div>
        <a
          href={portalUrl}
          target="_blank"
          rel="noreferrer"
          className="break-all text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
        >
          {portalUrl}
        </a>
      </div>
      <div>
        <div className="mb-0.5 flex items-center justify-between gap-2">
          <b>Login email</b>
          <CopyButton value={portalEmail} />
        </div>
        <span className="break-all text-ink/70">{portalEmail}</span>
      </div>
      <div>
        <div className="mb-0.5 flex items-center justify-between gap-2">
          <b>Password</b>
          <CopyButton value={portalPassword} />
        </div>
        <span className="break-all text-ink/70">{portalPassword}</span>
      </div>
    </div>
  );
}
