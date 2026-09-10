import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/db/prisma";

async function main() {
  const data = {
    users: await prisma.user.findMany(),
    members: await prisma.restaurantMember.findMany(),
    restaurants: await prisma.restaurant.findMany(),
    categories: await prisma.menuCategory.findMany(),
    items: await prisma.menuItem.findMany(),
    variants: await prisma.menuVariant.findMany(),
    modifierGroups: await prisma.modifierGroup.findMany(),
    modifierOptions: await prisma.modifierOption.findMany(),
    itemModifierGroups: await prisma.itemModifierGroup.findMany(),
    orders: await prisma.order.findMany(),
    orderItems: await prisma.orderItem.findMany(),
    payments: await prisma.payment.findMany(),
    zones: await prisma.diningZone.findMany(),
    tables: await prisma.diningTable.findMany(),
    tableSessions: await prisma.tableSession.findMany(),
    reservations: await prisma.reservation.findMany(),
    inventoryItems: await prisma.inventoryItem.findMany(),
    recipeLines: await prisma.recipeLine.findMany(),
    inventoryMovements: await prisma.inventoryMovement.findMany(),
    coupons: await prisma.coupon.findMany(),
    couponRedemptions: await prisma.couponRedemption.findMany(),
    campaigns: await prisma.adCampaign.findMany(),
    dispatches: await prisma.deliveryDispatch.findMany(),
    otpChallenges: [],
  };

  const dir = path.join(process.cwd(), "hostinger", "data");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "seed.json"),
    JSON.stringify(
      data,
      (_key, value) => (value instanceof Date ? value.toISOString() : value),
      2,
    ),
  );
  console.log("Wrote hostinger/data/seed.json");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
