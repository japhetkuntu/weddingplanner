import { useEffect, useState } from "react";
import { EmptyState, Skeleton } from "@ovutor/ui";
import { getVendors } from "@/lib/api";
import type { Vendor } from "@/types";

function VendorsSkeleton() {
  return (
    <div className="ovutor-fade-in">
      <Skeleton className="h-3 w-56" />
      <Skeleton className="my-2 h-9 w-64" />
      <Skeleton className="mb-6 h-4 w-full max-w-md" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    </div>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="border border-[#ddd] bg-white">
      <div className="aspect-[4/3] w-full overflow-hidden bg-bg-warm">
        {vendor.photoUrl ? (
          <img src={vendor.photoUrl} alt={vendor.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="grid h-full w-full place-items-center text-3xl text-ink/20">{vendor.name.charAt(0).toUpperCase()}</div>
        )}
      </div>
      <div className="p-4">
        {vendor.category ? (
          <span className="mb-1.5 inline-block border border-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[.08em] text-primary">
            {vendor.category}
          </span>
        ) : null}
        <p className="font-display text-lg leading-snug">{vendor.name}</p>
        <p className="text-xs text-ink/50">{vendor.location}</p>
        {vendor.summary ? <p className="mt-1.5 text-xs text-ink/60">{vendor.summary}</p> : null}
        {vendor.contact ? <p className="mt-2 text-xs font-medium text-ink/70">{vendor.contact}</p> : null}
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVendors()
      .then(setVendors)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <VendorsSkeleton />;

  return (
    <div className="ovutor-fade-in">
      <p className="text-[10px] font-bold uppercase tracking-[.12em] text-primary">Booked for your wedding</p>
      <h1 className="my-1.5 font-display text-4xl">Your vendors</h1>
      <p className="mb-6 text-ink/60">Everyone your planner has booked for your day, with a way to reach each one.</p>

      {vendors.length === 0 ? (
        <EmptyState
          title="No vendors booked yet"
          message="Once your planner books a vendor for your wedding and links it to your budget, it'll show up here."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}
