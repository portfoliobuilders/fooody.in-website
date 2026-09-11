import type { DietTag, PrismaClient } from "@prisma/client";

const IMG = {
  sandwich: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80",
  burger: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
  chicken: "https://images.unsplash.com/photo-1626645738196-c2a9c10e155f?auto=format&fit=crop&w=900&q=80",
  combo: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=900&q=80",
  club: "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=900&q=80",
  arabic: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=900&q=80",
  shawarma: "https://images.unsplash.com/photo-1529006557810-274b0b6db27d?auto=format&fit=crop&w=900&q=80",
  shake: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=900&q=80",
  smoothie: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=900&q=80",
  mojito: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=900&q=80",
  lassi: "https://images.unsplash.com/photo-1571115177098-24ec17bd0250?auto=format&fit=crop&w=900&q=80",
  tea: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=900&q=80",
};

type Variant = { name: string; price: number; isDefault?: boolean };
type ItemSeed = {
  title: string;
  price: number;
  diet: DietTag;
  description?: string;
  variants?: Variant[];
  modifier?: "ice-cream";
};
type CategorySeed = { name: string; image: string; items: ItemSeed[] };

function many(titles: string[], price: number, diet: DietTag, extra?: Partial<ItemSeed>): ItemSeed[] {
  return titles.map((title) => ({ title, price, diet, ...extra }));
}

const MENU: CategorySeed[] = [
  {
    name: "Sandwiches",
    image: IMG.sandwich,
    items: [
      {
        title: "Classic Sandwich",
        price: 30,
        diet: "VEG",
        description: "Honey, jam, Nutella or Lays — pick one filling.",
        variants: [
          { name: "Honey", price: 30, isDefault: true },
          { name: "Jam", price: 30 },
          { name: "Nutella", price: 30 },
          { name: "Lays", price: 30 },
        ],
      },
      { title: "Cheese n Honey Sandwich", price: 40, diet: "VEG" },
      { title: "Peanut Butter Sandwich", price: 40, diet: "VEG" },
      { title: "Veg Cheese Sandwich", price: 45, diet: "VEG" },
      { title: "Veg Nuggets Sandwich", price: 65, diet: "VEG" },
      { title: "Veg Burger Sandwich", price: 80, diet: "VEG" },
      { title: "Veg Jalapeño Sandwich", price: 50, diet: "VEG" },
      { title: "Veg Fillet Sandwich", price: 70, diet: "VEG" },
      { title: "Veg Egg Sandwich", price: 50, diet: "EGG" },
      { title: "Egg Cheese Sandwich", price: 60, diet: "EGG" },
      { title: "Egg Double Down Sandwich", price: 70, diet: "EGG" },
      { title: "Mini Hot Dog", price: 50, diet: "NON_VEG" },
      { title: "Special Hot Dog", price: 70, diet: "NON_VEG" },
      { title: "Chicken Tikka Sandwich", price: 80, diet: "NON_VEG" },
      { title: "Chilli Chicken Sandwich", price: 60, diet: "NON_VEG" },
      { title: "Mini Chicken Nuggets Sandwich", price: 60, diet: "NON_VEG" },
      { title: "Special Chicken Nuggets Sandwich", price: 80, diet: "NON_VEG" },
      { title: "Chicken Jalapeño Sandwich", price: 80, diet: "NON_VEG" },
      { title: "Chicken Burger Sandwich", price: 90, diet: "NON_VEG" },
      { title: "Zinger Chicken Sandwich", price: 120, diet: "NON_VEG", description: "Crispy zinger fillet, mayo, shredded lettuce." },
    ],
  },
  {
    name: "Cheese Burgers",
    image: IMG.burger,
    items: [
      { title: "Veg Cheese Burger", price: 70, diet: "VEG" },
      { title: "Crazy Veg Burger", price: 80, diet: "VEG" },
      { title: "Veg Nuggets Burger", price: 80, diet: "VEG" },
      { title: "Potato Wedges Burger", price: 70, diet: "VEG" },
      { title: "Mixed Veg Burger", price: 85, diet: "VEG" },
      { title: "Egg Burger", price: 65, diet: "EGG" },
      { title: "Egg Double Down Burger", price: 75, diet: "EGG" },
      { title: "Hot Dog Burger", price: 85, diet: "NON_VEG" },
      { title: "Chicken Burger", price: 90, diet: "NON_VEG" },
      { title: "Crispy Chicken Patty Burger", price: 110, diet: "NON_VEG" },
      { title: "Crispy Chicken Big Patty Burger", price: 140, diet: "NON_VEG" },
      { title: "Fish Fillet Burger", price: 140, diet: "NON_VEG" },
      { title: "Beef Patty Burger", price: 120, diet: "NON_VEG" },
      { title: "Chicken Tikka Burger", price: 100, diet: "NON_VEG" },
      { title: "Chicken Nuggets Burger", price: 90, diet: "NON_VEG" },
      { title: "Chicken Fillet Burger", price: 100, diet: "NON_VEG" },
      { title: "Zinger Chicken Burger", price: 130, diet: "NON_VEG" },
      { title: "Mathafo Chicken Burger", price: 160, diet: "NON_VEG" },
    ],
  },
  {
    name: "Jumbo / Break Time",
    image: IMG.burger,
    items: [
      { title: "Break Time Special", price: 110, diet: "NON_VEG", description: "House jumbo burger special." },
      { title: "Jumbo Burger", price: 160, diet: "NON_VEG" },
      { title: "Veg Jumbo", price: 180, diet: "VEG" },
      { title: "Chicken Jumbo", price: 240, diet: "NON_VEG" },
      { title: "Crispy Chicken Jumbo", price: 210, diet: "NON_VEG" },
      { title: "Crispy Patty Jumbo", price: 210, diet: "NON_VEG" },
      { title: "Zinger Chicken Jumbo", price: 240, diet: "NON_VEG" },
    ],
  },
  {
    name: "Fried Chicken",
    image: IMG.chicken,
    items: [
      { title: "Broasted Chicken 1 pc", price: 70, diet: "NON_VEG" },
      { title: "Broasted Choice Piece", price: 85, diet: "NON_VEG" },
      {
        title: "Chicken Strips",
        price: 70,
        diet: "NON_VEG",
        variants: [
          { name: "4 pcs", price: 70, isDefault: true },
          { name: "6 pcs", price: 100 },
        ],
      },
      {
        title: "Fried Chicken Bucket",
        price: 250,
        diet: "NON_VEG",
        description: "Crispy broasted chicken, shareable.",
        variants: [
          { name: "4 pcs", price: 250, isDefault: true },
          { name: "6 pcs", price: 350 },
          { name: "9 pcs", price: 550 },
          { name: "12 pcs", price: 650 },
        ],
      },
    ],
  },
  {
    name: "Combos",
    image: IMG.combo,
    items: [
      {
        title: "Snacks Box",
        price: 199,
        diet: "NON_VEG",
        description: "2 pcs chicken, 1 bun, French fries, mayo, ketchup and Pepsi.",
      },
    ],
  },
  {
    name: "Club Sandwiches",
    image: IMG.club,
    items: [
      { title: "Veg Club", price: 100, diet: "VEG" },
      { title: "Veg Nuggets Club", price: 110, diet: "VEG" },
      { title: "Veg Fillet Club", price: 120, diet: "VEG" },
      { title: "Egg Club", price: 100, diet: "EGG" },
      { title: "Chicken Tikka Club", price: 150, diet: "NON_VEG" },
      { title: "Shawarma Club", price: 150, diet: "NON_VEG" },
      { title: "Chicken Nuggets Club", price: 150, diet: "NON_VEG" },
      { title: "Fish Fillet Club", price: 180, diet: "NON_VEG" },
      { title: "Chicken Fillet Club", price: 150, diet: "NON_VEG" },
      { title: "Zinger Club", price: 200, diet: "NON_VEG" },
      { title: "Chicken Club", price: 150, diet: "NON_VEG" },
      { title: "Chicken Hot Dog Club", price: 140, diet: "NON_VEG" },
      { title: "Break Time Special Mixed Club", price: 200, diet: "NON_VEG" },
    ],
  },
  {
    name: "Arabic Chicken",
    image: IMG.arabic,
    items: [
      {
        title: "Shawai",
        price: 380,
        diet: "NON_VEG",
        description: "Charcoal shawai, Arabian spices.",
        variants: [
          { name: "Full", price: 380, isDefault: true },
          { name: "Half", price: 199 },
          { name: "Quarter", price: 100 },
        ],
      },
      {
        title: "Al Faham",
        price: 420,
        diet: "NON_VEG",
        description: "Slow-grilled al faham.",
        variants: [
          { name: "Full", price: 420, isDefault: true },
          { name: "Half", price: 220 },
          { name: "Quarter", price: 120 },
        ],
      },
      { title: "Chicken Tikka (4 pcs)", price: 249, diet: "NON_VEG" },
      {
        title: "Barbecue Chicken",
        price: 499,
        diet: "NON_VEG",
        variants: [
          { name: "Full", price: 499, isDefault: true },
          { name: "Half", price: 250 },
          { name: "Quarter", price: 150 },
        ],
      },
    ],
  },
  {
    name: "Shawarma",
    image: IMG.shawarma,
    items: [
      { title: "Kuboos Roll", price: 75, diet: "NON_VEG" },
      { title: "Chapati Roll", price: 75, diet: "NON_VEG" },
      { title: "Porotta Roll", price: 85, diet: "NON_VEG" },
      { title: "Rumali Roll", price: 100, diet: "NON_VEG" },
      { title: "Chicken Only Roll", price: 75, diet: "NON_VEG" },
      { title: "Plate Shawarma", price: 110, diet: "NON_VEG" },
      { title: "Special Plate Shawarma (French Fries)", price: 130, diet: "NON_VEG" },
      { title: "Chicken Only Plate", price: 160, diet: "NON_VEG" },
    ],
  },
  {
    name: "Tender Coconut Shakes",
    image: IMG.shake,
    items: [
      ...many(
        [
          "Karikku Shake",
          "Chikku Shake",
          "Mango Shake",
          "Strawberry Shake",
          "Lychee Shake",
          "Rose Milk",
          "Cold Coffee",
          "Badam Shake",
          "Boost Shake",
          "Horlicks Shake",
          "Bournvita Shake",
          "Snickers Shake",
          "Oreo Shake",
          "Munch Shake",
          "Milkybar Shake",
          "Dairy Milk Shake",
          "5 Star Shake",
          "Muffin Shake",
          "Milk Bikis Shake",
          "Hide & Seek Shake",
          "Dark Fantasy Shake",
          "Gems Shake",
          "KitKat Shake",
          "Chocolate Shake",
          "Vanilla Shake",
          "Pista Shake",
          "Papaya Shake",
          "Guava Shake",
        ],
        65,
        "VEG",
        { modifier: "ice-cream" },
      ).map((item) =>
        item.title === "Karikku Shake"
          ? { ...item, price: 70, description: "Fresh tender coconut. Ice cream +₹25." }
          : item.title === "Chikku Shake"
            ? { ...item, price: 60 }
            : item,
      ),
      { title: "Cherry Shake", price: 70, diet: "VEG", modifier: "ice-cream" },
      { title: "Apple Shake", price: 90, diet: "VEG", modifier: "ice-cream" },
      { title: "Almond Shake", price: 100, diet: "VEG", modifier: "ice-cream" },
      { title: "Cashew Shake", price: 100, diet: "VEG", modifier: "ice-cream" },
      { title: "Butterscotch Shake", price: 70, diet: "VEG", modifier: "ice-cream" },
      { title: "Nutella Shake", price: 90, diet: "VEG", modifier: "ice-cream" },
      { title: "Kiwi Shake", price: 90, diet: "VEG", modifier: "ice-cream" },
      { title: "Anjeer Shake", price: 80, diet: "VEG", modifier: "ice-cream" },
      { title: "Royal Shake", price: 90, diet: "VEG", modifier: "ice-cream" },
      { title: "Brownie Shake", price: 90, diet: "VEG", modifier: "ice-cream" },
      { title: "Black Forest Shake", price: 80, diet: "VEG", modifier: "ice-cream" },
      { title: "Pomegranate Shake", price: 80, diet: "VEG", modifier: "ice-cream" },
      { title: "Dragon Fruit Shake", price: 120, diet: "VEG", modifier: "ice-cream" },
      { title: "Avocado Shake", price: 100, diet: "VEG", modifier: "ice-cream", description: "Butter fruit." },
      { title: "Dry Fruit Shake", price: 120, diet: "VEG", modifier: "ice-cream" },
    ],
  },
  {
    name: "Arabian Special Shakes",
    image: IMG.shake,
    items: [
      { title: "Abood", price: 100, diet: "VEG" },
      { title: "50+50", price: 100, diet: "VEG" },
      { title: "Cocktail Mix", price: 130, diet: "VEG" },
      { title: "Tabakath", price: 130, diet: "VEG" },
      { title: "Burj Al Arab", price: 130, diet: "VEG" },
    ],
  },
  {
    name: "Smoothies",
    image: IMG.smoothie,
    items: [
      { title: "Choco Smoothie", price: 70, diet: "VEG" },
      { title: "Grape Smoothie", price: 70, diet: "VEG" },
      { title: "Guava Smoothie", price: 70, diet: "VEG" },
      { title: "Mango Smoothie", price: 70, diet: "VEG" },
      { title: "Orange Smoothie", price: 70, diet: "VEG" },
      { title: "Pineapple Smoothie", price: 70, diet: "VEG" },
      { title: "Banana Smoothie", price: 70, diet: "VEG" },
      { title: "Boost Smoothie", price: 70, diet: "VEG" },
      { title: "Coffee Smoothie", price: 70, diet: "VEG" },
      { title: "Chikku Smoothie", price: 70, diet: "VEG" },
      { title: "Pomegranate Smoothie", price: 85, diet: "VEG" },
      { title: "Apple Smoothie", price: 85, diet: "VEG" },
    ],
  },
  {
    name: "Mojitos",
    image: IMG.mojito,
    items: [
      { title: "Banana Mojito", price: 70, diet: "VEG" },
      { title: "Masala Mojito", price: 70, diet: "VEG" },
      { title: "Spicy Mojito", price: 70, diet: "VEG" },
      { title: "Blue Mojito", price: 70, diet: "VEG" },
      { title: "Mint Mojito", price: 70, diet: "VEG" },
      { title: "Orange Mojito", price: 70, diet: "VEG" },
      { title: "Grape Mojito", price: 70, diet: "VEG" },
      { title: "Kiwi Mojito", price: 70, diet: "VEG" },
    ],
  },
  {
    name: "Lassi",
    image: IMG.lassi,
    items: [
      { title: "Sweet Lassi", price: 55, diet: "VEG" },
      { title: "Chocolate Lassi", price: 60, diet: "VEG" },
      { title: "Mango Lassi", price: 60, diet: "VEG" },
      { title: "Any Flavour Lassi", price: 60, diet: "VEG" },
      { title: "Blue Lassi", price: 60, diet: "VEG" },
      { title: "Break Time Special Lassi", price: 70, diet: "VEG" },
    ],
  },
  {
    name: "Milk Sarbaths",
    image: IMG.lassi,
    items: [
      { title: "Boost Sarbath", price: 65, diet: "VEG" },
      { title: "Horlicks Sarbath", price: 65, diet: "VEG" },
      { title: "Spicy Sarbath", price: 65, diet: "VEG" },
      { title: "Strawberry Sarbath", price: 65, diet: "VEG" },
      { title: "Pista Sarbath", price: 65, diet: "VEG" },
      { title: "Orange Sarbath", price: 65, diet: "VEG" },
    ],
  },
  {
    name: "Tea",
    image: IMG.tea,
    items: [
      { title: "Normal Tea", price: 12, diet: "VEG" },
      { title: "Cardamom Tea", price: 15, diet: "VEG" },
      { title: "Masala Tea", price: 16, diet: "VEG" },
      { title: "Special Kadak Tea", price: 17, diet: "VEG" },
      { title: "Vanilla Tea", price: 18, diet: "VEG" },
      { title: "Strawberry Tea", price: 19, diet: "VEG" },
      { title: "Chocolate Tea", price: 20, diet: "VEG" },
    ],
  },
  {
    name: "Sulaimani",
    image: IMG.tea,
    items: [
      { title: "Normal Sulaimani", price: 10, diet: "VEG" },
      { title: "Lime Sulaimani", price: 15, diet: "VEG" },
      { title: "Ginger Sulaimani", price: 15, diet: "VEG" },
      { title: "Mint Sulaimani", price: 15, diet: "VEG" },
      { title: "Sukku Sulaimani", price: 15, diet: "VEG" },
      { title: "Cardamom Sulaimani", price: 15, diet: "VEG" },
      { title: "Tulsi Sulaimani", price: 15, diet: "VEG" },
      { title: "Masala Sulaimani", price: 15, diet: "VEG" },
    ],
  },
];

export async function seedBaketreeMenu(prisma: PrismaClient, restaurantId: string) {
  const iceCream = await prisma.modifierGroup.create({
    data: {
      restaurantId,
      name: "Ice cream",
      required: false,
      minSelect: 0,
      maxSelect: 1,
      options: { create: [{ name: "Add ice cream", pricePaise: 2500 }] },
    },
  });

  const iceCreamItemIds: string[] = [];

  for (const [index, category] of MENU.entries()) {
    const cat = await prisma.menuCategory.create({
      data: { restaurantId, name: category.name, sortOrder: index + 1 },
    });
    for (const [itemIndex, item] of category.items.entries()) {
      const created = await prisma.menuItem.create({
        data: {
          restaurantId,
          categoryId: cat.id,
          title: item.title,
          description: item.description ?? "",
          imageUrl: category.image,
          basePricePaise: item.price * 100,
          taxRateBps: 500,
          diet: item.diet,
          prepTimeMins: category.name === "Tea" || category.name === "Sulaimani" ? 6 : 18,
          sortOrder: itemIndex,
          listedOnStorefront: true,
          listedOnMarketplace: true,
          variants: item.variants
            ? {
                create: item.variants.map((v) => ({
                  name: v.name,
                  pricePaise: v.price * 100,
                  isDefault: Boolean(v.isDefault),
                })),
              }
            : undefined,
        },
      });
      if (item.modifier === "ice-cream") iceCreamItemIds.push(created.id);
    }
  }

  if (iceCreamItemIds.length) {
    await prisma.itemModifierGroup.createMany({
      data: iceCreamItemIds.map((menuItemId) => ({ menuItemId, groupId: iceCream.id })),
    });
  }
}
