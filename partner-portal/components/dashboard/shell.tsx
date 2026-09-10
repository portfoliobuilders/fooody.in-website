"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ConciergeBell,
  ChefHat,
  UtensilsCrossed,
  Armchair,
  CalendarDays,
  Wallet,
  Boxes,
  TicketPercent,
  Megaphone,
  Users,
  Moon,
  Sun,
  LogOut,
  Store,
} from "lucide-react";
import { useTheme } from "next-themes";
import type { StaffRole } from "@prisma/client";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/tenant/host";

const NAV: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: StaffRole[];
}[] = [
  { href: "", label: "Overview", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "KITCHEN_STAFF", "BILLING_CASHIER", "DELIVERY_DRIVER"] },
  { href: "/orders", label: "Orders", icon: ConciergeBell, roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "KITCHEN_STAFF", "BILLING_CASHIER", "DELIVERY_DRIVER"] },
  { href: "/kitchen", label: "Kitchen", icon: ChefHat, roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "KITCHEN_STAFF"] },
  { href: "/menu", label: "Menu", icon: UtensilsCrossed, roles: ["SUPER_ADMIN", "OWNER", "MANAGER"] },
  { href: "/tables", label: "Tables", icon: Armchair, roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "BILLING_CASHIER"] },
  { href: "/reservations", label: "Reservations", icon: CalendarDays, roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "BILLING_CASHIER"] },
  { href: "/payments", label: "Payments", icon: Wallet, roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "BILLING_CASHIER"] },
  { href: "/inventory", label: "Inventory", icon: Boxes, roles: ["SUPER_ADMIN", "OWNER", "MANAGER", "KITCHEN_STAFF"] },
  { href: "/promotions", label: "Promotions", icon: TicketPercent, roles: ["SUPER_ADMIN", "OWNER", "MANAGER"] },
  { href: "/ads", label: "Ad engine", icon: Megaphone, roles: ["SUPER_ADMIN", "OWNER", "MANAGER"] },
  { href: "/staff", label: "Staff", icon: Users, roles: ["SUPER_ADMIN", "OWNER"] },
];

export function DashboardShell({
  restaurantId,
  restaurantName,
  slug,
  role,
  userName,
  children,
}: {
  restaurantId: string;
  restaurantName: string;
  slug: string;
  role: StaffRole;
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const base = `/dashboard/${restaurantId}`;
  const items = NAV.filter((item) => item.roles.includes(role));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-black/8 bg-obsidian text-ivory md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <BrandMark />
          <div>
            <p className="font-display text-lg font-extrabold">
              fooody<span className="text-flame">.</span>in
            </p>
            <p className="text-[11px] tracking-[0.14em] text-gold uppercase">Partner OS</p>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="truncate text-sm font-semibold">{restaurantName}</p>
            <p className="text-xs text-mist">fooody.in/{slug}</p>
            <p className="mt-1 text-[11px] text-gold">{ROLE_LABEL[role]}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {items.map((item) => {
            const href = `${base}${item.href}`;
            const active = item.href === "" ? pathname === base : pathname.startsWith(href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-ivory/70 hover:bg-white/5 hover:text-ivory",
                  active && "bg-white/10 text-ivory",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-2 p-4">
          <Link href={`/${slug}`} className="flex items-center gap-2 text-sm text-ivory/70 hover:text-ivory">
            <Store className="size-4" /> Direct storefront
          </Link>
          <p className="text-xs text-mist">{userName}</p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-black/8 px-4 py-3 dark:border-white/10">
          <div className="md:hidden">
            <p className="font-display font-bold">{restaurantName}</p>
            <p className="text-xs text-mist">{ROLE_LABEL[role]}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="size-4 dark:hidden" />
              <Moon className="hidden size-4 dark:block" />
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 pb-24 md:p-6">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-black/10 bg-background/95 p-2 backdrop-blur md:hidden">
          {items.slice(0, 6).map((item) => {
            const href = `${base}${item.href}`;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={href}
                className="flex min-w-16 flex-col items-center rounded-xl px-2 py-1 text-[10px]"
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
