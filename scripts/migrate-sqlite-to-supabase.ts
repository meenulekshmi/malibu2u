import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

// Native env loader
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

// Build temporary SQLite and PostgreSQL clients
const rawSchema = fs.readFileSync(path.join(process.cwd(), 'prisma', 'schema.prisma'), 'utf-8');
const modelsOnly = rawSchema
  .replace(/datasource db \{[\s\S]*?\}/, '')
  .replace(/generator client \{[\s\S]*?\}/, '');

const sqliteSchemaContent = `
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma-sqlite-source"
}

${modelsOnly}
`;

const pgSchemaContent = `
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma-pg-target"
}

${modelsOnly}
`;

const tempSqliteSchemaPath = path.join(process.cwd(), 'prisma', 'sqlite-source.prisma');
const tempPgSchemaPath = path.join(process.cwd(), 'prisma', 'pg-target.prisma');

fs.writeFileSync(tempSqliteSchemaPath, sqliteSchemaContent);
fs.writeFileSync(tempPgSchemaPath, pgSchemaContent);

async function migrateData() {
  console.log('--- STARTING SAFE SQLITE -> POSTGRESQL MIGRATION ---');
  
  // Generate dedicated isolated accessor clients
  console.log('Generating isolated migration clients...');
  execSync(`npx prisma generate --schema=prisma/sqlite-source.prisma`, { stdio: 'pipe' });
  execSync(`npx prisma generate --schema=prisma/pg-target.prisma`, { stdio: 'pipe' });
  
  const sqliteModuleUrl = pathToFileURL(path.join(process.cwd(), 'node_modules', '.prisma-sqlite-source', 'index.js')).href;
  const pgModuleUrl = pathToFileURL(path.join(process.cwd(), 'node_modules', '.prisma-pg-target', 'index.js')).href;

  // @ts-ignore
  const { PrismaClient: SqlitePrismaClient } = await import(sqliteModuleUrl);
  // @ts-ignore
  const { PrismaClient: PostgresPrismaClient } = await import(pgModuleUrl);
  
  const sqlite = new SqlitePrismaClient({
    datasources: { db: { url: 'file:./dev.db' } }
  });

  const pg = new PostgresPrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
  });

  try {
    // 1. SystemSettings
    console.log('\n[1/17] Migrating SystemSettings...');
    const settings = await sqlite.systemSetting.findMany();
    for (const item of settings) {
      await pg.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value, updatedAt: item.updatedAt },
        create: { key: item.key, value: item.value, updatedAt: item.updatedAt }
      });
    }
    console.log(`✓ Migrated ${settings.length} SystemSettings.`);

    // 2. WhatsAppMessageTemplates
    console.log('\n[2/17] Migrating WhatsAppMessageTemplates...');
    const templates = await sqlite.whatsAppMessageTemplate.findMany();
    for (const tpl of templates) {
      await pg.whatsAppMessageTemplate.upsert({
        where: { eventKey: tpl.eventKey },
        update: {
          name: tpl.name,
          description: tpl.description,
          body: tpl.body,
          isActive: tpl.isActive,
          autoSend: tpl.autoSend,
          updatedAt: tpl.updatedAt
        },
        create: {
          id: tpl.id,
          eventKey: tpl.eventKey,
          name: tpl.name,
          description: tpl.description,
          body: tpl.body,
          isActive: tpl.isActive,
          autoSend: tpl.autoSend,
          createdAt: tpl.createdAt,
          updatedAt: tpl.updatedAt
        }
      });
    }
    console.log(`✓ Migrated ${templates.length} WhatsAppMessageTemplates.`);

    // 3. Banners
    console.log('\n[3/17] Migrating Banners...');
    const banners = await sqlite.banner.findMany();
    for (const b of banners) {
      await pg.banner.upsert({
        where: { id: b.id },
        update: {
          title: b.title,
          subtitle: b.subtitle,
          image: b.image,
          buttonText: b.buttonText,
          buttonUrl: b.buttonUrl,
          displayOrder: b.displayOrder,
          active: b.active,
          updatedAt: b.updatedAt
        },
        create: {
          id: b.id,
          title: b.title,
          subtitle: b.subtitle,
          image: b.image,
          buttonText: b.buttonText,
          buttonUrl: b.buttonUrl,
          displayOrder: b.displayOrder,
          active: b.active,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt
        }
      });
    }
    console.log(`✓ Migrated ${banners.length} Banners.`);

    // 4. Coupons
    console.log('\n[4/17] Migrating Coupons...');
    const coupons = await sqlite.coupon.findMany();
    for (const c of coupons) {
      await pg.coupon.upsert({
        where: { id: c.id },
        update: {
          code: c.code,
          discountType: c.discountType,
          discountPercent: c.discountPercent,
          discountAmount: c.discountAmount,
          minPurchase: c.minPurchase,
          maxDiscount: c.maxDiscount,
          expiryDate: c.expiryDate,
          usageLimit: c.usageLimit,
          usedCount: c.usedCount,
          active: c.active,
          updatedAt: c.updatedAt
        },
        create: {
          id: c.id,
          code: c.code,
          discountType: c.discountType,
          discountPercent: c.discountPercent,
          discountAmount: c.discountAmount,
          minPurchase: c.minPurchase,
          maxDiscount: c.maxDiscount,
          expiryDate: c.expiryDate,
          usageLimit: c.usageLimit,
          usedCount: c.usedCount,
          active: c.active,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt
        }
      });
    }
    console.log(`✓ Migrated ${coupons.length} Coupons.`);

    // 5. Users
    console.log('\n[5/17] Migrating Users...');
    const users = await sqlite.user.findMany();
    for (const u of users) {
      await pg.user.upsert({
        where: { id: u.id },
        update: {
          email: u.email,
          passwordHash: u.passwordHash,
          name: u.name,
          role: u.role,
          phone: u.phone,
          updatedAt: u.updatedAt
        },
        create: {
          id: u.id,
          email: u.email,
          passwordHash: u.passwordHash,
          name: u.name,
          role: u.role,
          phone: u.phone,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt
        }
      });
    }
    console.log(`✓ Migrated ${users.length} Users.`);

    // 6. Categories (Handle parent categories first, then subcategories)
    console.log('\n[6/17] Migrating Categories...');
    const categories = await sqlite.category.findMany();
    for (const cat of categories) {
      await pg.category.upsert({
        where: { id: cat.id },
        update: {
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          description: cat.description,
          isFeatured: cat.isFeatured
        },
        create: {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          image: cat.image,
          description: cat.description,
          isFeatured: cat.isFeatured
        }
      });
    }
    for (const cat of categories) {
      if (cat.parentId) {
        await pg.category.update({
          where: { id: cat.id },
          data: { parentId: cat.parentId }
        });
      }
    }
    console.log(`✓ Migrated ${categories.length} Categories.`);

    // 7. Products
    console.log('\n[7/17] Migrating Products...');
    const products = await sqlite.product.findMany();
    for (const p of products) {
      await pg.product.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          shortDescription: p.shortDescription,
          price: p.price,
          mrp: p.mrp,
          discountPrice: p.discountPrice,
          condition: p.condition,
          platform: p.platform,
          brand: p.brand,
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold,
          sku: p.sku,
          specsJson: p.specsJson,
          rating: p.rating,
          reviewCount: p.reviewCount,
          isFeatured: p.isFeatured,
          isBestSeller: p.isBestSeller,
          isPreOrder: p.isPreOrder,
          isNewArrival: p.isNewArrival,
          isOnSale: p.isOnSale,
          isPreOwned: p.isPreOwned,
          categoryId: p.categoryId,
          updatedAt: p.updatedAt
        },
        create: {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          shortDescription: p.shortDescription,
          price: p.price,
          mrp: p.mrp,
          discountPrice: p.discountPrice,
          condition: p.condition,
          platform: p.platform,
          brand: p.brand,
          stock: p.stock,
          lowStockThreshold: p.lowStockThreshold,
          sku: p.sku,
          specsJson: p.specsJson,
          rating: p.rating,
          reviewCount: p.reviewCount,
          isFeatured: p.isFeatured,
          isBestSeller: p.isBestSeller,
          isPreOrder: p.isPreOrder,
          isNewArrival: p.isNewArrival,
          isOnSale: p.isOnSale,
          isPreOwned: p.isPreOwned,
          categoryId: p.categoryId,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt
        }
      });
    }
    console.log(`✓ Migrated ${products.length} Products.`);

    // 8. ProductImages
    console.log('\n[8/17] Migrating ProductImages...');
    const images = await sqlite.productImage.findMany();
    for (const img of images) {
      await pg.productImage.upsert({
        where: { id: img.id },
        update: {
          url: img.url,
          isPrimary: img.isPrimary,
          productId: img.productId
        },
        create: {
          id: img.id,
          url: img.url,
          isPrimary: img.isPrimary,
          productId: img.productId
        }
      });
    }
    console.log(`✓ Migrated ${images.length} ProductImages.`);

    // 9. Orders
    console.log('\n[9/17] Migrating Orders...');
    const orders = await sqlite.order.findMany();
    for (const o of orders) {
      await pg.order.upsert({
        where: { id: o.id },
        update: {
          userId: o.userId,
          totalAmount: o.totalAmount,
          subtotal: o.subtotal,
          discountAmount: o.discountAmount,
          shippingAmount: o.shippingAmount,
          advanceAmount: o.advanceAmount,
          remainingCodAmount: o.remainingCodAmount,
          amountDue: o.amountDue,
          amountPaid: o.amountPaid,
          remainingAmount: o.remainingAmount,
          status: o.status,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          advancePaymentStatus: o.advancePaymentStatus,
          remainingPaymentStatus: o.remainingPaymentStatus,
          paymentReference: o.paymentReference,
          paymentProof: o.paymentProof,
          rejectionReason: o.rejectionReason,
          cashfreeOrderId: o.cashfreeOrderId,
          cashfreePaymentId: o.cashfreePaymentId,
          paymentTimestampsJson: o.paymentTimestampsJson,
          shippingAddressJson: o.shippingAddressJson,
          trackingNumber: o.trackingNumber,
          updatedAt: o.updatedAt
        },
        create: {
          id: o.id,
          userId: o.userId,
          totalAmount: o.totalAmount,
          subtotal: o.subtotal,
          discountAmount: o.discountAmount,
          shippingAmount: o.shippingAmount,
          advanceAmount: o.advanceAmount,
          remainingCodAmount: o.remainingCodAmount,
          amountDue: o.amountDue,
          amountPaid: o.amountPaid,
          remainingAmount: o.remainingAmount,
          status: o.status,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          advancePaymentStatus: o.advancePaymentStatus,
          remainingPaymentStatus: o.remainingPaymentStatus,
          paymentReference: o.paymentReference,
          paymentProof: o.paymentProof,
          rejectionReason: o.rejectionReason,
          cashfreeOrderId: o.cashfreeOrderId,
          cashfreePaymentId: o.cashfreePaymentId,
          paymentTimestampsJson: o.paymentTimestampsJson,
          shippingAddressJson: o.shippingAddressJson,
          trackingNumber: o.trackingNumber,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt
        }
      });
    }
    console.log(`✓ Migrated ${orders.length} Orders.`);

    // 10. OrderItems
    console.log('\n[10/17] Migrating OrderItems...');
    const orderItems = await sqlite.orderItem.findMany();
    for (const item of orderItems) {
      await pg.orderItem.upsert({
        where: { id: item.id },
        update: {
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          condition: item.condition
        },
        create: {
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          condition: item.condition
        }
      });
    }
    console.log(`✓ Migrated ${orderItems.length} OrderItems.`);

    // 11. NotificationLogs
    console.log('\n[11/17] Migrating NotificationLogs...');
    const logs = await sqlite.notificationLog.findMany();
    for (const log of logs) {
      await pg.notificationLog.upsert({
        where: { id: log.id },
        update: {
          orderId: log.orderId,
          event: log.event,
          templateKey: log.templateKey,
          recipientPhone: log.recipientPhone,
          recipientName: log.recipientName,
          messageBody: log.messageBody,
          mediaUrl: log.mediaUrl,
          providerMessageId: log.providerMessageId,
          status: log.status,
          error: log.error
        },
        create: {
          id: log.id,
          orderId: log.orderId,
          event: log.event,
          templateKey: log.templateKey,
          recipientPhone: log.recipientPhone,
          recipientName: log.recipientName,
          messageBody: log.messageBody,
          mediaUrl: log.mediaUrl,
          providerMessageId: log.providerMessageId,
          status: log.status,
          error: log.error,
          createdAt: log.createdAt
        }
      });
    }
    console.log(`✓ Migrated ${logs.length} NotificationLogs.`);

    // 12. Address
    console.log('\n[12/17] Migrating Addresses...');
    const addresses = await sqlite.address.findMany();
    for (const addr of addresses) {
      await pg.address.upsert({
        where: { id: addr.id },
        update: {
          userId: addr.userId,
          fullName: addr.fullName,
          phone: addr.phone,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          landmark: addr.landmark,
          city: addr.city,
          district: addr.district,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          label: addr.label,
          isDefault: addr.isDefault,
          updatedAt: addr.updatedAt
        },
        create: {
          id: addr.id,
          userId: addr.userId,
          fullName: addr.fullName,
          phone: addr.phone,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          landmark: addr.landmark,
          city: addr.city,
          district: addr.district,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          label: addr.label,
          isDefault: addr.isDefault,
          createdAt: addr.createdAt,
          updatedAt: addr.updatedAt
        }
      });
    }
    console.log(`✓ Migrated ${addresses.length} Addresses.`);

    // 13. Carts
    console.log('\n[13/17] Migrating Carts...');
    const carts = await sqlite.cart.findMany();
    for (const c of carts) {
      await pg.cart.upsert({
        where: { id: c.id },
        update: { userId: c.userId, updatedAt: c.updatedAt },
        create: { id: c.id, userId: c.userId, createdAt: c.createdAt, updatedAt: c.updatedAt }
      });
    }
    console.log(`✓ Migrated ${carts.length} Carts.`);

    // 14. CartItems
    console.log('\n[14/17] Migrating CartItems...');
    const cartItems = await sqlite.cartItem.findMany();
    for (const item of cartItems) {
      await pg.cartItem.upsert({
        where: { id: item.id },
        update: { cartId: item.cartId, productId: item.productId, quantity: item.quantity, condition: item.condition },
        create: { id: item.id, cartId: item.cartId, productId: item.productId, quantity: item.quantity, condition: item.condition }
      });
    }
    console.log(`✓ Migrated ${cartItems.length} CartItems.`);

    // 15. WishlistItems
    console.log('\n[15/17] Migrating WishlistItems...');
    const wishlists = await sqlite.wishlistItem.findMany();
    for (const item of wishlists) {
      await pg.wishlistItem.upsert({
        where: { id: item.id },
        update: { userId: item.userId, productId: item.productId },
        create: { id: item.id, userId: item.userId, productId: item.productId, createdAt: item.createdAt }
      });
    }
    console.log(`✓ Migrated ${wishlists.length} WishlistItems.`);

    // 16. Reviews
    console.log('\n[16/17] Migrating Reviews...');
    const reviews = await sqlite.review.findMany();
    for (const rev of reviews) {
      await pg.review.upsert({
        where: { id: rev.id },
        update: {
          productId: rev.productId,
          userId: rev.userId,
          userName: rev.userName,
          rating: rev.rating,
          title: rev.title,
          comment: rev.comment,
          isApproved: rev.isApproved
        },
        create: {
          id: rev.id,
          productId: rev.productId,
          userId: rev.userId,
          userName: rev.userName,
          rating: rev.rating,
          title: rev.title,
          comment: rev.comment,
          isApproved: rev.isApproved,
          createdAt: rev.createdAt
        }
      });
    }
    console.log(`✓ Migrated ${reviews.length} Reviews.`);

    // 17. SellTradeRequests
    console.log('\n[17/17] Migrating SellTradeRequests...');
    const sellRequests = await sqlite.sellTradeRequest.findMany();
    for (const req of sellRequests) {
      await pg.sellTradeRequest.upsert({
        where: { id: req.id },
        update: {
          userId: req.userId,
          itemName: req.itemName,
          category: req.category,
          platform: req.platform,
          condition: req.condition,
          brand: req.brand,
          model: req.model,
          storage: req.storage,
          originalBox: req.originalBox,
          accessories: req.accessories,
          purchaseInfo: req.purchaseInfo,
          expectedPrice: req.expectedPrice,
          photosJson: req.photosJson,
          estimatedCash: req.estimatedCash,
          estimatedCredit: req.estimatedCredit,
          payoutChoice: req.payoutChoice,
          status: req.status,
          fullName: req.fullName,
          email: req.email,
          phone: req.phone,
          pickupAddress: req.pickupAddress,
          userNotes: req.userNotes,
          adminNotes: req.adminNotes,
          updatedAt: req.updatedAt
        },
        create: {
          id: req.id,
          userId: req.userId,
          itemName: req.itemName,
          category: req.category,
          platform: req.platform,
          condition: req.condition,
          brand: req.brand,
          model: req.model,
          storage: req.storage,
          originalBox: req.originalBox,
          accessories: req.accessories,
          purchaseInfo: req.purchaseInfo,
          expectedPrice: req.expectedPrice,
          photosJson: req.photosJson,
          estimatedCash: req.estimatedCash,
          estimatedCredit: req.estimatedCredit,
          payoutChoice: req.payoutChoice,
          status: req.status,
          fullName: req.fullName,
          email: req.email,
          phone: req.phone,
          pickupAddress: req.pickupAddress,
          userNotes: req.userNotes,
          adminNotes: req.adminNotes,
          createdAt: req.createdAt,
          updatedAt: req.updatedAt
        }
      });
    }
    console.log(`✓ Migrated ${sellRequests.length} SellTradeRequests.`);

    console.log('\n========================================');
    console.log('✅ DATA MIGRATION TO SUPABASE COMPLETE!');
    console.log('========================================\n');

  } catch (error: any) {
    console.error('❌ MIGRATION ERROR:', error);
    process.exit(1);
  } finally {
    await sqlite.$disconnect();
    await pg.$disconnect();
    if (fs.existsSync(tempSqliteSchemaPath)) fs.unlinkSync(tempSqliteSchemaPath);
    if (fs.existsSync(tempPgSchemaPath)) fs.unlinkSync(tempPgSchemaPath);
  }
}

migrateData();
