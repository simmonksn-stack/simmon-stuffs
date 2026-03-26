"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenSquare,
  CalendarDays,
  Linkedin,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add-post", label: "Add Post", icon: PenSquare },
  { href: "/weekly-update", label: "Semanal", icon: CalendarDays },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Linkedin className="h-6 w-6 text-blue-500" />
          <span className="hidden font-bold tracking-tight sm:inline">
            LinkedIn Tracker
          </span>
          <span className="hidden text-sm text-slate-500 sm:inline">
            — {process.env.NEXT_PUBLIC_AUTHOR_NAME || "Simmon Nam"}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-blue-500/20 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
