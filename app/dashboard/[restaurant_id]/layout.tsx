import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { requireMembership } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";

export default async function RestaurantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ restaurant_id: string }>;
}) {
  const { restaurant_id } = await params;
  try {
    const ctx = await requireMembership(restaurant_id);
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurant_id } });
    if (!restaurant) redirect("/dashboard");
    return (
      <DashboardShell
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        slug={restaurant.slug}
        role={ctx.role}
        userName={ctx.user.name}
      >
        {children}
      </DashboardShell>
    );
  } catch {
    redirect("/login");
  }
}
