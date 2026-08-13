import { useEffect, useState } from "react";
import { Badge, Button, Card, Skeleton, Toast } from "@ovutor/ui";
import { useAuthStore } from "@/store/authStore";
import { getWebsiteStatus } from "@/lib/api";
import type { WebsiteStatus } from "@/types";

function WebsiteSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-3 w-56" />
      <Skeleton className="my-2 h-9 w-64" />
      <Skeleton className="mb-6 h-4 w-full max-w-xl" />
      <Card className="mb-4">
        <Skeleton className="mb-3 h-6 w-24" />
        <Skeleton className="h-[480px] w-full" />
      </Card>
      <Card>
        <Skeleton className="mb-1 h-4 w-32" />
        <Skeleton className="mb-4 h-8 w-64" />
        <div className="flex gap-2">
          <Skeleton className="h-11 w-28" />
          <Skeleton className="h-11 w-28" />
        </div>
      </Card>
    </div>
  );
}

export default function WebsitePage() {
  const profile = useAuthStore((s) => s.profile);
  const [status, setStatus] = useState<WebsiteStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    getWebsiteStatus()
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !status || !profile) return <WebsiteSkeleton />;

  const isLive = status.isLive;
  const siteUrl = status.siteUrl;

  function flashToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(siteUrl);
      flashToast("Link copied");
    } catch {
      flashToast("Couldn't copy automatically — copy it from the address field above");
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${profile!.partnerA} & ${profile!.partnerB}'s wedding`, url: siteUrl });
      } catch {
        // user cancelled the share sheet — nothing to do
      }
    } else {
      copyLink();
    }
  }

  return (
    <div className="ovutor-fade-in">
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Managed by your Ovutor planner</p>
      <h1 className="my-1.5 font-display text-4xl">My wedding website</h1>
      <p className="mb-6 max-w-xl text-ink/60">
        Your planner keeps this page current for your guests. Preview it below, then copy or share the link whenever you're ready.
      </p>

      <Card className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <Badge tone={isLive ? "success" : "warning"}>{isLive ? "Live" : "Being set up"}</Badge>
        </div>

        <div className="border border-[#ddd]">
          <div className="flex items-center gap-2 border-b border-[#ddd] bg-bg-warm px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ddd]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ddd]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ddd]" />
            <span className="ml-2 truncate text-xs text-ink/50">{siteUrl}</span>
          </div>
          <iframe title="Wedding website preview" src={siteUrl} className="h-[480px] w-full border-0" />
        </div>
      </Card>

      <Card>
        <p className="mb-1 text-sm text-ink/50">Your website link</p>
        <p className="mb-4 break-all font-display text-xl">{siteUrl}</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={copyLink}>Copy link</Button>
          <Button variant="outline" onClick={shareLink}>
            Share
          </Button>
          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-[45px] items-center border border-ink px-5 text-[11px] font-bold uppercase tracking-[.1em] text-ink hover:bg-ink hover:text-white"
          >
            Open link
          </a>
        </div>
      </Card>

      <Toast open={!!toast}>{toast}</Toast>
    </div>
  );
}
