"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Wallet,
  Star,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  briefcase: Briefcase,
  message: MessageSquare,
  wallet: Wallet,
  star: Star,
  search: Search,
  settings: Settings,
  shield: ShieldCheck,
  users: Users,
} as const;

export type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
};

export default function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active =
          item.href === "/panel"
            ? pathname === "/panel"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
              active
                ? "bg-green text-white shadow-sm"
                : "text-ink-soft hover:bg-mint/50 hover:text-ink",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
