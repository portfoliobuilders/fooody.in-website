import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardIndex() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  const memberships = await prisma.restaurantMember.findMany({
    where: { userId: session.userId },
    include: { restaurant: true },
  });
  const restaurants = user?.isSuperAdmin
    ? await prisma.restaurant.findMany({ orderBy: { name: "asc" } })
    : memberships.map((m) => m.restaurant);
  if (restaurants.length === 1 && !user?.isSuperAdmin) {
    redirect(`/dashboard/${restaurants[0].id}`);
  }
  return (
    <div className="mx-auto max-w-lg space-y-4 p-8">
      <h1 className="font-display text-3xl font-bold">Choose a kitchen</h1>
      <ul className="space-y-2">
        {restaurants.map((restaurant) => (
          <li key={restaurant.id}>
            <a className="block rounded-2xl border border-black/10 p-4 hover:border-ember" href={`/dashboard/${restaurant.id}`}>
              <p className="font-semibold">{restaurant.name}</p>
              <p className="text-sm text-mist">fooody.in/{restaurant.slug}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
