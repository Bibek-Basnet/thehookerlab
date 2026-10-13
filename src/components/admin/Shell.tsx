"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChatCircleText,
  Gauge,
  GraduationCap,
  List,
  Question,
  Quotes,
  SignOut,
  SlidersHorizontal,
  Stack,
  TextAa,
  UserCircle,
  UsersThree,
  X,
} from "@phosphor-icons/react";

import { logout } from "@/lib/admin/actions/auth";
import type { AdminUser } from "@/lib/auth/dal";
import { cn } from "@/lib/utils";

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", icon: Gauge },
  { href: "/admin/programmes", label: "Programmes", icon: Stack },
  { href: "/admin/expertise", label: "Expertise", icon: GraduationCap },
  { href: "/admin/testimonials", label: "Testimonials", icon: Quotes },
  { href: "/admin/faq", label: "FAQ", icon: Question },
  { href: "/admin/sections", label: "Section copy", icon: TextAa },
  { href: "/admin/enquiries", label: "Enquiries", icon: ChatCircleText },
  { href: "/admin/registrations", label: "Registrations", icon: UsersThree },
  { href: "/admin/settings", label: "Settings", icon: SlidersHorizontal },
  { href: "/admin/account", label: "Account", icon: UserCircle },
] as const;

export default function Shell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/admin" ? pathname === href : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Admin">
      {ADMIN_NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
            isActive(href)
              ? "bg-steel text-bone"
              : "text-mist hover:bg-steel/60 hover:text-bone",
          )}
        >
          <Icon size={18} />
          {label}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="mt-auto border-t border-line pt-4">
      <p className="truncate text-sm text-bone">{user.name}</p>
      <p className="truncate text-xs text-mist">{user.email}</p>
      <form action={logout} className="mt-3">
        <button
          type="submit"
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-mist hover:text-bone"
        >
          <SignOut size={16} /> Sign out
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink text-bone">
      <header className="flex items-center justify-between border-b border-line px-5 py-4 lg:hidden">
        <Link href="/admin" className="font-display text-xl uppercase">
          The Hooker Lab
        </Link>
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <List size={24} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex w-72 flex-col bg-coal p-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-xl uppercase">Admin</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X size={22} />
              </button>
            </div>
            {nav}
            {footer}
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="flex-1 bg-ink/70"
            onClick={() => setOpen(false)}
          />
        </div>
      )}

      <div className="lg:grid lg:grid-cols-[260px_1fr]">
        <aside className="hidden min-h-screen flex-col border-r border-line bg-coal p-5 lg:flex">
          <Link href="/admin" className="mb-8 font-display text-2xl uppercase">
            The Hooker Lab
          </Link>
          {nav}
          {footer}
        </aside>
        <div className="min-w-0 px-5 py-8 md:px-10">{children}</div>
      </div>
    </div>
  );
}
