-- Remap legacy enum strings after schema expansion (SQLite stores enums as TEXT).
UPDATE "Order" SET channel = 'ONLINE_DELIVERY' WHERE channel = 'DELIVERY';
UPDATE "Order" SET channel = 'WHATSAPP' WHERE channel = 'WHATSAPP_BOT';
UPDATE "Order" SET status = 'READY' WHERE status = 'READY_FOR_PICKUP';
UPDATE "DiningZone" SET kind = 'INDOOR' WHERE kind IN ('indoor', 'INDOOR');
UPDATE "DiningZone" SET kind = 'OUTDOOR' WHERE kind IN ('outdoor', 'OUTDOOR');
UPDATE "InventoryItem" SET unit = 'KG' WHERE unit IN ('kg', 'KG');
UPDATE "InventoryItem" SET unit = 'L' WHERE unit IN ('L', 'l');
UPDATE "Coupon" SET channel = 'ONLINE_DELIVERY' WHERE channel = 'DELIVERY';
UPDATE "DiningTable" SET qrPath = replace(qrPath, '/malabar-kitchen/table/', '/qr/malabar-kitchen/table/') WHERE qrPath LIKE '/malabar-kitchen/table/%';
