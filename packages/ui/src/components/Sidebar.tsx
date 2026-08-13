import { useState } from "react";
import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "../cn";

export interface SidebarNavItem {
  label: string;
  to: string;
  end?: boolean;
}

export interface SidebarProps {
  portalLabel: string;
  items: SidebarNavItem[];
  footer?: ReactNode;
  topContent?: ReactNode;
}

function NavList({ items, onNavigate }: { items: SidebarNavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="mt-2">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "block border-l-[3px] border-transparent px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5",
              isActive && "border-primary font-bold text-primary",
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar({ portalLabel, items, footer, topContent }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-[#bbb] bg-white px-4 py-3 lg:hidden">
        <div className="font-display text-xl">
          Ovutor <span className="text-primary">&#9825;</span>
        </div>
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="border border-ink/30 px-3 py-2 text-xs font-bold uppercase tracking-[.1em]"
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[260px] overflow-y-auto bg-white p-4">
            <div className="font-display text-2xl">
              Ovutor <span className="text-primary">&#9825;</span>
            </div>
            <p className="mt-1 text-xs font-bold text-ink/60">{portalLabel}</p>
            {topContent}
            <NavList items={items} onNavigate={() => setOpen(false)} />
            {footer}
          </aside>
        </div>
      ) : null}

      {/* Desktop sidebar — sticky to the viewport so only the main content scrolls. */}
      <aside className="hidden w-[225px] shrink-0 overflow-y-auto border-r border-[#bbb] bg-white px-4 py-6 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="font-display text-[26px] leading-none">
          Ovutor <span className="text-primary">&#9825;</span>
        </div>
        <p className="mt-2 text-xs font-bold text-ink/60">{portalLabel}</p>
        {topContent}
        <NavList items={items} />
        <div className="mt-auto pt-4">{footer}</div>
      </aside>
    </>
  );
}
