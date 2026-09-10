-- Fooody.in multi-tenant Row Level Security for Supabase/Postgres.
-- Apply after switching DATABASE_URL to PostgreSQL and running `prisma migrate`.
-- Authorization lives in RestaurantMember (NOT auth.users.raw_user_meta_data).

alter table "User" enable row level security;
alter table "Restaurant" enable row level security;
alter table "RestaurantMember" enable row level security;
alter table "RestaurantDomain" enable row level security;
alter table "OperatingHour" enable row level security;
alter table "CommissionRule" enable row level security;
alter table "MenuCategory" enable row level security;
alter table "MenuItem" enable row level security;
alter table "MenuVariant" enable row level security;
alter table "ModifierGroup" enable row level security;
alter table "ModifierOption" enable row level security;
alter table "ItemModifierGroup" enable row level security;
alter table "Order" enable row level security;
alter table "OrderItem" enable row level security;
alter table "Payment" enable row level security;
alter table "DiningZone" enable row level security;
alter table "DiningTable" enable row level security;
alter table "TableSession" enable row level security;
alter table "Reservation" enable row level security;
alter table "InventoryItem" enable row level security;
alter table "RecipeLine" enable row level security;
alter table "InventoryMovement" enable row level security;
alter table "DeliveryDispatch" enable row level security;
alter table "WhatsAppCartSession" enable row level security;
alter table "Coupon" enable row level security;
alter table "CouponRedemption" enable row level security;
alter table "AdCampaign" enable row level security;
alter table "OtpChallenge" enable row level security;

create or replace function public.fooody_member_restaurant_ids()
returns setof text
language sql
stable
security definer
set search_path = public
as $$
  select "restaurantId"
  from "RestaurantMember"
  where "userId" = auth.uid()::text;
$$;

revoke all on function public.fooody_member_restaurant_ids() from public, anon;
grant execute on function public.fooody_member_restaurant_ids() to authenticated;

create policy restaurant_members_self on "RestaurantMember"
  for select to authenticated
  using ("userId" = auth.uid()::text);

create policy restaurants_member_read on "Restaurant"
  for select to authenticated
  using (id in (select public.fooody_member_restaurant_ids()));

create policy restaurants_public_marketplace on "Restaurant"
  for select to anon, authenticated
  using ("listedOnMarketplace" = true);

create policy tenant_isolation_domains on "RestaurantDomain"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_hours on "OperatingHour"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_commission on "CommissionRule"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_menu_category on "MenuCategory"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_menu_item on "MenuItem"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_orders on "Order"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_payments on "Payment"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_tables on "DiningTable"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_zones on "DiningZone"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_table_sessions on "TableSession"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_reservations on "Reservation"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_inventory on "InventoryItem"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_inventory_moves on "InventoryMovement"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_dispatch on "DeliveryDispatch"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_whatsapp on "WhatsAppCartSession"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_coupons on "Coupon"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));

create policy tenant_isolation_ads on "AdCampaign"
  using ("restaurantId" in (select public.fooody_member_restaurant_ids()));
