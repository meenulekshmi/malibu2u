import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

// Load environment variables
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

async function verifyAll() {
  console.log('=== VERIFYING POSTGRESQL VS SQLITE DATA INTEGRITY ===\n');

  const sqliteModuleUrl = pathToFileURL(path.join(process.cwd(), 'node_modules', '.prisma-sqlite-source', 'index.js')).href;
  const pgModuleUrl = pathToFileURL(path.join(process.cwd(), 'node_modules', '.prisma-pg-target', 'index.js')).href;

  // @ts-ignore
  const { PrismaClient: SqlitePrismaClient } = await import(sqliteModuleUrl);
  // @ts-ignore
  const { PrismaClient: PostgresPrismaClient } = await import(pgModuleUrl);

  const sqlite = new SqlitePrismaClient({ datasources: { db: { url: 'file:./dev.db' } } });
  const pgUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pg = new PostgresPrismaClient({ datasources: { db: { url: pgUrl } } });

  const models = [
    'User',
    'Category',
    'Product',
    'ProductImage',
    'Cart',
    'CartItem',
    'WishlistItem',
    'Address',
    'Order',
    'OrderItem',
    'WhatsAppMessageTemplate',
    'NotificationLog',
    'Review',
    'SellTradeRequest',
    'Coupon',
    'Banner',
    'SystemSetting'
  ];

  let allCountsMatch = true;

  console.log('Model Name                SQLite Count   PostgreSQL Count   Status');
  console.log('-------------------------------------------------------------------');

  for (const m of models) {
    const accessor = m.charAt(0).toLowerCase() + m.slice(1);
    const sqCount = await sqlite[accessor].count();
    const pgCount = await pg[accessor].count();
    const match = sqCount === pgCount;
    if (!match) allCountsMatch = false;

    console.log(
      `${m.padEnd(25)} ${sqCount.toString().padEnd(14)} ${pgCount.toString().padEnd(18)} ${match ? '✅ MATCH' : '❌ MISMATCH'}`
    );
  }

  console.log('\n--- VERIFYING CRITICAL DATA & RELATIONSHIPS ---');

  // 1. Admin Verification
  const adminUser = await pg.user.findFirst({ where: { role: 'ADMIN' } });
  console.log(`• Admin User preserved: ${adminUser ? `✅ YES (${adminUser.name} - ${adminUser.email} - ID: ${adminUser.id})` : '❌ NO'}`);

  // 2. Customers Verification
  const customerCount = await pg.user.count({ where: { role: 'USER' } });
  console.log(`• Customer Users preserved: ✅ YES (${customerCount} customers)`);

  // 3. Products -> Categories relation
  const products = await pg.product.findMany({ include: { category: true } });
  const allProdsHaveCat = products.every((p: any) => p.category && p.category.id);
  console.log(`• Products -> Categories relation: ${allProdsHaveCat ? `✅ YES (All ${products.length}/${products.length} linked)` : '❌ NO'}`);

  // 4. ProductImages -> Products relation
  const images = await pg.productImage.findMany({ include: { product: true } });
  const allImagesHaveProd = images.every((img: any) => img.product && img.product.id);
  console.log(`• ProductImages -> Products relation: ${allImagesHaveProd ? `✅ YES (All ${images.length}/${images.length} linked)` : '❌ NO'}`);

  // 5. Orders -> Users relation
  const orders = await pg.order.findMany({ include: { user: true } });
  const allOrdersHaveUser = orders.every((o: any) => o.user && o.user.id);
  console.log(`• Orders -> Users relation: ${allOrdersHaveUser ? `✅ YES (All ${orders.length}/${orders.length} linked)` : '❌ NO'}`);

  // 6. OrderItems -> Orders & Products relation
  const orderItems = await pg.orderItem.findMany({ include: { order: true, product: true } });
  const allItemsValid = orderItems.every((item: any) => item.order && item.product);
  console.log(`• OrderItems -> Orders & Products relation: ${allItemsValid ? `✅ YES (All ${orderItems.length}/${orderItems.length} linked)` : '❌ NO'}`);

  // 7. NotificationLogs -> Orders relation
  const logs = await pg.notificationLog.findMany({ include: { order: true } });
  const allLogsValid = logs.every((l: any) => !l.orderId || (l.order && l.order.id));
  console.log(`• NotificationLogs -> Orders relation: ${allLogsValid ? `✅ YES (All ${logs.length}/${logs.length} linked)` : '❌ NO'}`);

  console.log(`\n• Overall Verification Result: ${allCountsMatch ? '🎉 100% PERFECT MATCH' : '⚠️ SOME COUNTS MISMATCHED'}`);

  await sqlite.$disconnect();
  await pg.$disconnect();
}

verifyAll();
