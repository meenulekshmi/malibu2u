import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning Malibu2u database and setting up core system defaults...');

  // 1. Clean existing dummy/sample data
  await prisma.sellTradeRequest.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  // 2. Create System Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@malibu2u.com',
      name: 'Malibu2u Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+91 9876543210',
    },
  });

  console.log(`System Admin created (${admin.email})`);

  // 3. Create Store Categories Structure (No products attached)
  await prisma.category.create({
    data: {
      name: 'Consoles',
      slug: 'consoles',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
      description: 'Next-gen and classic gaming consoles (PS5, Xbox Series X, Nintendo Switch)',
      isFeatured: true,
    },
  });

  await prisma.category.create({
    data: {
      name: 'Video Games',
      slug: 'games',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      description: 'Latest blockbusters and legendary titles across all platforms',
      isFeatured: true,
    },
  });

  await prisma.category.create({
    data: {
      name: 'Controllers',
      slug: 'controllers',
      image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80',
      description: 'Pro controllers, wireless gamepads, and custom arcade sticks',
      isFeatured: true,
    },
  });

  await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      description: 'Headsets, charging docks, storage expansion cards, and protective cases',
      isFeatured: true,
    },
  });

  await prisma.category.create({
    data: {
      name: 'PC Gaming Hardware',
      slug: 'pc-hardware',
      image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80',
      description: 'Graphics cards, mechanical keyboards, ultra-fast gaming mice & monitors',
      isFeatured: true,
    },
  });

  console.log('Malibu2u database cleaned successfully. Zero products and zero dummy data remaining.');
}

main()
  .catch((e) => {
    console.error('Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
