import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { settleOrderMoney } from "../lib/money";

const prisma = new PrismaClient();
const password = "Fooody@2026";

async function main() {
  await prisma.paymentTender.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.deliveryDispatch.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventoryAlert.deleteMany();
  await prisma.requisitionLine.deleteMany();
  await prisma.inventoryRequisition.deleteMany();
  await prisma.riderProfile.deleteMany();
  await prisma.whatsAppCartSession.deleteMany();
  await prisma.tableSession.deleteMany();
  await prisma.order.deleteMany();
  await prisma.couponRedemption.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.adCampaign.deleteMany();
  await prisma.recipeLine.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.diningTable.deleteMany();
  await prisma.diningZone.deleteMany();
  await prisma.itemModifierGroup.deleteMany();
  await prisma.modifierOption.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.menuVariant.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.commissionRule.deleteMany();
  await prisma.operatingHour.deleteMany();
  await prisma.restaurantDomain.deleteMany();
  await prisma.restaurantMember.deleteMany();
  await prisma.otpChallenge.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.branchOrganization.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(password, 10);

  const owner = await prisma.user.create({
    data: {
      id: "usr_owner",
      email: "owner@fooody.in",
      phone: "9876543210",
      passwordHash,
      name: "Athul Menon",
    },
  });
  const manager = await prisma.user.create({
    data: {
      id: "usr_manager",
      email: "manager@fooody.in",
      phone: "9876543211",
      passwordHash,
      name: "Nisha Varghese",
    },
  });
  const kitchen = await prisma.user.create({
    data: {
      id: "usr_kitchen",
      email: "kitchen@fooody.in",
      phone: "9876543212",
      passwordHash,
      name: "Ravi Chef",
    },
  });
  const cashier = await prisma.user.create({
    data: {
      id: "usr_cashier",
      email: "cashier@fooody.in",
      phone: "9876543213",
      passwordHash,
      name: "Fathima Cash",
    },
  });
  const driver = await prisma.user.create({
    data: {
      id: "usr_driver",
      email: "driver@fooody.in",
      phone: "9876543214",
      passwordHash,
      name: "Jibin Rider",
    },
  });
  await prisma.user.create({
    data: {
      id: "usr_super",
      email: "admin@fooody.in",
      phone: "9876543299",
      passwordHash,
      name: "Fooody Super Admin",
      isSuperAdmin: true,
    },
  });

  const kochiGroup = await prisma.branchOrganization.create({
    data: { id: "org_kochi", name: "Fooody Kochi Group" },
  });

  const malabar = await prisma.restaurant.create({
    data: {
      id: "rst_malabar",
      slug: "malabar-kitchen",
      name: "Malabar Kitchen",
      tagline: "Wood-fire biryani & Kerala coastal plates",
      city: "Kochi",
      area: "Panampilly Nagar",
      address: "12/44, Panampilly Nagar, Kochi 682036",
      phone: "0484-4012345",
      cuisine: "Kerala, Malabar",
      gstin: "32AABCU9603R1ZX",
      upiVpa: "malabar@upi",
      listedOnMarketplace: true,
      commissionBps: 800,
      defaultDispatchType: "IN_HOUSE",
      rating: 4.8,
      prepTimeMins: 28,
      coverUrl:
        "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1400&q=80",
      logoUrl:
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=200&q=80",
      nextOrderNumber: 1088,
      organizationId: kochiGroup.id,
    },
  });

  const fort = await prisma.restaurant.create({
    data: {
      id: "rst_fortcochin",
      slug: "fort-cochin-cafe",
      name: "Fort Cochin Cafe",
      tagline: "All-day brunch by the harbour",
      city: "Kochi",
      area: "Fort Kochi",
      address: "Princess Street, Fort Kochi",
      phone: "0484-2210099",
      cuisine: "Cafe, Continental",
      listedOnMarketplace: true,
      rating: 4.5,
      prepTimeMins: 20,
      organizationId: kochiGroup.id,
    },
  });

  await prisma.restaurantDomain.createMany({
    data: [
      { restaurantId: malabar.id, host: "malabar-kitchen.fooody.in", isPrimary: true },
      { restaurantId: fort.id, host: "fort-cochin-cafe.fooody.in", isPrimary: true },
    ],
  });
  await prisma.operatingHour.createMany({
    data: [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
      restaurantId: malabar.id,
      weekday,
      opensAt: weekday === 1 ? "00:00" : "11:00",
      closesAt: "23:30",
      isClosed: weekday === 1,
    })),
  });
  await prisma.commissionRule.createMany({
    data: [
      { restaurantId: malabar.id, channel: "ONLINE_DELIVERY", commissionBps: 1000, platformFeePaise: 500 },
      { restaurantId: malabar.id, channel: "WHATSAPP", commissionBps: 400, platformFeePaise: 0 },
      { restaurantId: malabar.id, channel: "DINE_IN", commissionBps: 0, platformFeePaise: 0 },
    ],
  });
  await prisma.restaurantMember.createMany({
    data: [
      { restaurantId: malabar.id, userId: owner.id, role: "OWNER" },
      { restaurantId: malabar.id, userId: manager.id, role: "MANAGER" },
      { restaurantId: malabar.id, userId: kitchen.id, role: "KITCHEN_STAFF" },
      { restaurantId: malabar.id, userId: cashier.id, role: "BILLING_CASHIER" },
      { restaurantId: malabar.id, userId: driver.id, role: "DELIVERY_DRIVER" },
    ],
  });

  const cats = await Promise.all(
    [
      { name: "Biryani", sortOrder: 1 },
      { name: "Kerala Meals", sortOrder: 2 },
      { name: "Seafood", sortOrder: 3 },
      { name: "Breads & Sides", sortOrder: 4 },
      { name: "Beverages", sortOrder: 5 },
    ].map((c) =>
      prisma.menuCategory.create({
        data: { restaurantId: malabar.id, ...c },
      }),
    ),
  );

  const spice = await prisma.modifierGroup.create({
    data: {
      restaurantId: malabar.id,
      name: "Spice level",
      required: true,
      minSelect: 1,
      maxSelect: 1,
      options: {
        create: [
          { name: "Mild", pricePaise: 0 },
          { name: "Medium", pricePaise: 0 },
          { name: "Kerala hot", pricePaise: 0 },
        ],
      },
    },
    include: { options: true },
  });

  const extras = await prisma.modifierGroup.create({
    data: {
      restaurantId: malabar.id,
      name: "Add-ons",
      required: false,
      minSelect: 0,
      maxSelect: 4,
      options: {
        create: [
          { name: "Extra raita", pricePaise: 2500 },
          { name: "Boiled egg", pricePaise: 2000 },
          { name: "Extra cheese", pricePaise: 4000 },
          { name: "Dates pickle", pricePaise: 3000 },
        ],
      },
    },
  });

  const biryani = await prisma.menuItem.create({
    data: {
      restaurantId: malabar.id,
      categoryId: cats[0].id,
      title: "Malabar Chicken Biryani",
      description: "Kaima rice, slow-cooked masala, fried onions, boiled egg.",
      imageUrl:
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80",
      basePricePaise: 28000,
      taxRateBps: 500,
      diet: "NON_VEG",
      prepTimeMins: 35,
      variants: {
        create: [
          { name: "Half", pricePaise: 18000 },
          { name: "Full", pricePaise: 28000, isDefault: true },
        ],
      },
    },
  });

  const stew = await prisma.menuItem.create({
    data: {
      restaurantId: malabar.id,
      categoryId: cats[1].id,
      title: "Appam & Vegetable Stew",
      description: "Lacy hoppers with coconut stew, carrot and potato.",
      imageUrl:
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80",
      basePricePaise: 16000,
      taxRateBps: 500,
      diet: "VEG",
      prepTimeMins: 18,
    },
  });

  const moilee = await prisma.menuItem.create({
    data: {
      restaurantId: malabar.id,
      categoryId: cats[2].id,
      title: "Karimeen Moilee",
      description: "Pearl-spot in ginger-coconut moilee, mustard tempering.",
      imageUrl:
        "https://images.unsplash.com/photo-1625944525533-473f1a3ed54b?auto=format&fit=crop&w=1200&q=80",
      basePricePaise: 42000,
      taxRateBps: 500,
      diet: "NON_VEG",
      prepTimeMins: 30,
    },
  });

  const parotta = await prisma.menuItem.create({
    data: {
      restaurantId: malabar.id,
      categoryId: cats[3].id,
      title: "Malabar Parotta (2 pcs)",
      description: "Layered, griddled, served with salna.",
      imageUrl:
        "https://images.unsplash.com/photo-1631452180519-c014fe946bcc?auto=format&fit=crop&w=1200&q=80",
      basePricePaise: 7000,
      taxRateBps: 500,
      diet: "VEG",
      prepTimeMins: 12,
    },
  });

  const sulaimani = await prisma.menuItem.create({
    data: {
      restaurantId: malabar.id,
      categoryId: cats[4].id,
      title: "Sulaimani Chai",
      description: "Black tea, lemon, spices. The Malabar closer.",
      imageUrl:
        "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=1200&q=80",
      basePricePaise: 4000,
      taxRateBps: 500,
      diet: "VEG",
      prepTimeMins: 6,
    },
  });

  await prisma.itemModifierGroup.createMany({
    data: [
      { menuItemId: biryani.id, groupId: spice.id },
      { menuItemId: biryani.id, groupId: extras.id },
      { menuItemId: moilee.id, groupId: spice.id },
    ],
  });

  const rice = await prisma.inventoryItem.create({
    data: { restaurantId: malabar.id, name: "Kaima rice", unit: "KG", onHand: 18, lowStockAt: 8 },
  });
  const chicken = await prisma.inventoryItem.create({
    data: { restaurantId: malabar.id, name: "Chicken", unit: "KG", onHand: 6.5, lowStockAt: 8 },
  });
  const oil = await prisma.inventoryItem.create({
    data: { restaurantId: malabar.id, name: "Coconut oil", unit: "L", onHand: 4.2, lowStockAt: 3 },
  });
  const flour = await prisma.inventoryItem.create({
    data: { restaurantId: malabar.id, name: "Maida", unit: "KG", onHand: 12, lowStockAt: 5 },
  });

  await prisma.recipeLine.createMany({
    data: [
      { menuItemId: biryani.id, inventoryItemId: rice.id, qtyPerPortion: 0.18 },
      { menuItemId: biryani.id, inventoryItemId: chicken.id, qtyPerPortion: 0.22 },
      { menuItemId: biryani.id, inventoryItemId: oil.id, qtyPerPortion: 0.03 },
      { menuItemId: parotta.id, inventoryItemId: flour.id, qtyPerPortion: 0.12 },
      { menuItemId: parotta.id, inventoryItemId: oil.id, qtyPerPortion: 0.02 },
    ],
  });

  const indoor = await prisma.diningZone.create({
    data: { restaurantId: malabar.id, name: "Indoor hall", kind: "INDOOR" },
  });
  const outdoor = await prisma.diningZone.create({
    data: { restaurantId: malabar.id, name: "Courtyard", kind: "OUTDOOR" },
  });

  const tables = await Promise.all(
    [
      { zoneId: indoor.id, number: "1", seats: 2 },
      { zoneId: indoor.id, number: "2", seats: 4 },
      { zoneId: indoor.id, number: "4", seats: 4 },
      { zoneId: indoor.id, number: "8", seats: 6 },
      { zoneId: outdoor.id, number: "11", seats: 4 },
      { zoneId: outdoor.id, number: "12", seats: 2 },
    ].map((t) =>
      prisma.diningTable.create({
        data: {
          restaurantId: malabar.id,
          qrPath: `/qr/malabar-kitchen/table/${t.number}`,
          ...t,
        },
      }),
    ),
  );

  const tonight = new Date();
  tonight.setHours(20, 0, 0, 0);
  const tomorrow = new Date(tonight);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(13, 30, 0, 0);

  await prisma.reservation.createMany({
    data: [
      {
        restaurantId: malabar.id,
        tableId: tables[3].id,
        guestName: "Meera Krishnan",
        guestPhone: "9847011122",
        guestCount: 5,
        startsAt: tonight,
        specialRequests: "Window table, anniversary",
        status: "CONFIRMED",
      },
      {
        restaurantId: malabar.id,
        tableId: tables[4].id,
        guestName: "Arjun Philip",
        guestPhone: "9895012345",
        guestCount: 3,
        startsAt: tomorrow,
        specialRequests: "High chair",
        status: "CONFIRMED",
      },
      {
        restaurantId: malabar.id,
        tableId: tables[0].id,
        guestName: "Sana Fathima",
        guestPhone: "9744123456",
        guestCount: 2,
        startsAt: new Date(Date.now() - 40 * 60 * 1000),
        status: "SEATED",
      },
    ],
  });

  await prisma.coupon.createMany({
    data: [
      {
        restaurantId: malabar.id,
        code: "FOODY50",
        type: "PERCENTAGE",
        value: 10,
        minOrderPaise: 30000,
        maxDiscountPaise: 8000,
        usageLimitPerUser: 2,
        channel: "ALL",
      },
      {
        restaurantId: malabar.id,
        code: "DINEIN100",
        type: "FLAT",
        value: 10000,
        minOrderPaise: 50000,
        channel: "DINE_IN",
      },
    ],
  });

  await prisma.adCampaign.create({
    data: {
      restaurantId: malabar.id,
      name: "Biryani lunch boost",
      dailyBudgetPaise: 150000,
      spentTodayPaise: 42000,
      status: "ACTIVE",
    },
  });

  async function placeOrder(args: {
    number: number;
    channel: "ONLINE_DELIVERY" | "TAKEAWAY" | "DINE_IN" | "WHATSAPP" | "SELF_DELIVERY";
    status: "PENDING" | "ACCEPTED" | "PREPARING" | "READY" | "DISPATCHED" | "COMPLETED";
    name: string;
    phone: string;
    notes?: string;
    tableId?: string;
    minutesAgo: number;
    lines: {
      itemId: string;
      title: string;
      variantName?: string;
      qty: number;
      unit: number;
      diet: "VEG" | "NON_VEG";
      modifiers?: { name: string; pricePaise: number }[];
    }[];
    discount?: number;
    packaging?: number;
    delivery?: number;
    platform?: number;
    gateway: "RAZORPAY" | "STRIPE" | "UPI" | "CASH";
    payStatus: "PAID" | "CASH_ON_DELIVERY" | "PENDING";
  }) {
    const subtotal = args.lines.reduce((sum, line) => {
      const mods = (line.modifiers ?? []).reduce((m, x) => m + x.pricePaise, 0);
      return sum + (line.unit + mods) * line.qty;
    }, 0);
    const gst = Math.round(subtotal * 0.05);
    const money = settleOrderMoney({
      subtotalPaise: subtotal,
      discountPaise: args.discount,
      packagingFeePaise: args.packaging,
      deliveryFeePaise: args.delivery,
      platformFeePaise: args.platform,
      gstPaise: gst,
      gatewayFeePaise: args.payStatus === "PAID" ? Math.round(subtotal * 0.018) : 0,
    });
    const placedAt = new Date(Date.now() - args.minutesAgo * 60 * 1000);
    const order = await prisma.order.create({
      data: {
        restaurantId: malabar.id,
        orderNumber: args.number,
        channel: args.channel,
        status: args.status,
        customerName: args.name,
        customerPhone: args.phone,
        customerNotes: args.notes ?? "",
        tableId: args.tableId,
        subtotalPaise: subtotal,
        ...money,
        placedAt,
        acceptedAt: args.status === "PENDING" ? null : placedAt,
        items: {
          create: args.lines.map((line) => ({
            menuItemId: line.itemId,
            title: line.title,
            variantName: line.variantName,
            quantity: line.qty,
            unitPricePaise: line.unit,
            lineTotalPaise:
              (line.unit + (line.modifiers ?? []).reduce((m, x) => m + x.pricePaise, 0)) * line.qty,
            diet: line.diet,
            modifiersJson: line.modifiers ?? [],
          })),
        },
        payment: {
          create: {
            restaurantId: malabar.id,
            gateway: args.gateway,
            status: args.payStatus,
            amountPaise: money.totalPaise,
            reference: args.payStatus === "PAID" ? `pay_${args.number}` : null,
            settled: args.payStatus === "PAID",
          },
        },
      },
    });
    return order;
  }

  await placeOrder({
    number: 1082,
    channel: "ONLINE_DELIVERY",
    status: "PENDING",
    name: "Aditya Nair",
    phone: "9800001001",
    notes: "Less oil, extra pickle",
    minutesAgo: 1,
    packaging: 1500,
    delivery: 4000,
    platform: 0,
    gateway: "RAZORPAY",
    payStatus: "PAID",
    lines: [
      {
        itemId: biryani.id,
        title: "Malabar Chicken Biryani",
        variantName: "Full",
        qty: 2,
        unit: 28000,
        diet: "NON_VEG",
        modifiers: [
          { name: "Kerala hot", pricePaise: 0 },
          { name: "Extra raita", pricePaise: 2500 },
        ],
      },
    ],
  });

  await placeOrder({
    number: 1083,
    channel: "DINE_IN",
    status: "PREPARING",
    name: "Table 4 · Sana",
    phone: "9744123456",
    tableId: tables[2].id,
    minutesAgo: 12,
    gateway: "UPI",
    payStatus: "PAID",
    lines: [
      {
        itemId: stew.id,
        title: "Appam & Vegetable Stew",
        qty: 1,
        unit: 16000,
        diet: "VEG",
      },
      {
        itemId: parotta.id,
        title: "Malabar Parotta (2 pcs)",
        qty: 2,
        unit: 7000,
        diet: "VEG",
      },
    ],
  });

  await placeOrder({
    number: 1084,
    channel: "TAKEAWAY",
    status: "READY",
    name: "Joseph Mathew",
    phone: "9847000099",
    minutesAgo: 22,
    packaging: 1000,
    gateway: "CASH",
    payStatus: "CASH_ON_DELIVERY",
    lines: [
      {
        itemId: moilee.id,
        title: "Karimeen Moilee",
        qty: 1,
        unit: 42000,
        diet: "NON_VEG",
        modifiers: [{ name: "Medium", pricePaise: 0 }],
      },
    ],
  });

  const waOrder = await placeOrder({
    number: 1085,
    channel: "WHATSAPP",
    status: "DISPATCHED",
    name: "WhatsApp · Latha",
    phone: "9995001122",
    minutesAgo: 38,
    packaging: 1500,
    delivery: 3500,
    gateway: "UPI",
    payStatus: "PAID",
    lines: [
      {
        itemId: biryani.id,
        title: "Malabar Chicken Biryani",
        variantName: "Half",
        qty: 1,
        unit: 18000,
        diet: "NON_VEG",
      },
      {
        itemId: sulaimani.id,
        title: "Sulaimani Chai",
        qty: 2,
        unit: 4000,
        diet: "VEG",
      },
    ],
  });

  await prisma.deliveryDispatch.create({
    data: {
      restaurantId: malabar.id,
      orderId: waOrder.id,
      type: "IN_HOUSE",
      status: "IN_TRANSIT",
      driverUserId: driver.id,
      trackingUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/track/${waOrder.id}`,
      assignedAt: new Date(Date.now() - 20 * 60 * 1000),
    },
  });

  await prisma.diningTable.update({
    where: { id: tables[2].id },
    data: { status: "OCCUPIED" },
  });
  await prisma.diningTable.update({
    where: { id: tables[3].id },
    data: { status: "RESERVED" },
  });

  await placeOrder({
    number: 1079,
    channel: "ONLINE_DELIVERY",
    status: "COMPLETED",
    name: "Rahul Dev",
    phone: "9811112233",
    minutesAgo: 180,
    packaging: 1500,
    delivery: 4000,
    discount: 2800,
    gateway: "STRIPE",
    payStatus: "PAID",
    lines: [
      {
        itemId: biryani.id,
        title: "Malabar Chicken Biryani",
        variantName: "Full",
        qty: 1,
        unit: 28000,
        diet: "NON_VEG",
      },
    ],
  });

  const cafeCat = await prisma.menuCategory.create({
    data: { restaurantId: fort.id, name: "Brunch", sortOrder: 1 },
  });
  await prisma.menuItem.create({
    data: {
      restaurantId: fort.id,
      categoryId: cafeCat.id,
      title: "Harbour Eggs Benedict",
      description: "English muffin, poached eggs, hollandaise.",
      basePricePaise: 32000,
      diet: "EGG",
      imageUrl:
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
    },
  });
  await prisma.restaurantMember.createMany({
    data: [
      { restaurantId: fort.id, userId: owner.id, role: "OWNER" },
      { restaurantId: fort.id, userId: manager.id, role: "MANAGER" },
      { restaurantId: fort.id, userId: kitchen.id, role: "KITCHEN_STAFF" },
    ],
  });
  await prisma.inventoryItem.createMany({
    data: [
      { restaurantId: fort.id, name: "Kaima rice", unit: "KG", onHand: 28, lowStockAt: 8 },
      { restaurantId: fort.id, name: "Chicken", unit: "KG", onHand: 22, lowStockAt: 6 },
    ],
  });
  await prisma.riderProfile.create({
    data: {
      userId: driver.id,
      shiftStatus: "AVAILABLE",
      vehicleType: "BIKE",
      vehicleNumber: "KL-07-AB-4421",
    },
  });

  console.log("Seeded Malabar Kitchen + Fort Cochin Cafe");
  console.log("Login: owner@fooody.in / Fooody@2026");
  console.log("Super admin: admin@fooody.in / Fooody@2026");
  console.log("Driver: driver@fooody.in / Fooody@2026");
  console.log("Phone OTP: 9876543210 / 123456");
  console.log("QR table: /qr/malabar-kitchen/table/4");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
