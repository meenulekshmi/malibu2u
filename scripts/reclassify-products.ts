import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reclassifyProducts() {
  console.log('Starting product category reclassification...');

  // Ensure 'pc-hardware', 'consoles', 'accessories', 'games' categories exist
  let pcCat = await prisma.category.findUnique({ where: { slug: 'pc-hardware' } });
  if (!pcCat) {
    pcCat = await prisma.category.create({
      data: {
        name: 'PC Gaming Hardware',
        slug: 'pc-hardware',
        description: 'Graphics cards, gaming PCs, components and peripherals',
        isFeatured: true,
      },
    });
  }

  let consoleCat = await prisma.category.findUnique({ where: { slug: 'consoles' } });
  if (!consoleCat) {
    consoleCat = await prisma.category.create({
      data: {
        name: 'Consoles',
        slug: 'consoles',
        description: 'Gaming consoles across PS5, Xbox, and Nintendo',
        isFeatured: true,
      },
    });
  }

  let accCat = await prisma.category.findUnique({ where: { slug: 'accessories' } });
  if (!accCat) {
    accCat = await prisma.category.create({
      data: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Controllers, headsets, chargers, and accessories',
        isFeatured: true,
      },
    });
  }

  let gamesCat = await prisma.category.findUnique({ where: { slug: 'games' } });
  if (!gamesCat) {
    gamesCat = await prisma.category.create({
      data: {
        name: 'Video Games',
        slug: 'games',
        description: 'Video games discs and editions',
        isFeatured: true,
      },
    });
  }

  const allProducts = await prisma.product.findMany();
  console.log(`Found ${allProducts.length} products to evaluate.`);

  let pcCount = 0;
  let consoleCount = 0;
  let accCount = 0;
  let gameCount = 0;

  for (const product of allProducts) {
    const title = product.name.toLowerCase();

    // 1. Check if PC Hardware / Rig / GPU / Component
    if (
      title.includes('rtx') ||
      title.includes('gtx') ||
      title.includes('pc component') ||
      title.includes('gaming pc') ||
      title.includes('geforce') ||
      title.includes('radeon') ||
      title.includes('graphics card') ||
      title.includes('gpu') ||
      title.includes('motherboard') ||
      title.includes('ryzen') ||
      title.includes('intel core') ||
      title.includes('i9-') ||
      title.includes('i7-') ||
      title.includes('i5-') ||
      title.includes('ddr4') ||
      title.includes('ddr5') ||
      title.includes('cabinet') ||
      title.includes('cooler') ||
      title.includes('psu') ||
      title.includes('ssd') ||
      title.includes('monitor')
    ) {
      if (product.categoryId !== pcCat.id) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: pcCat.id },
        });
        pcCount++;
      }
    }
    // 2. Check if Console
    else if (
      title.includes('console') ||
      title.includes('ps5 digital') ||
      title.includes('ps5 slim') ||
      title.includes('ps5 pro') ||
      title.includes('switch oled')
    ) {
      if (product.categoryId !== consoleCat.id) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: consoleCat.id },
        });
        consoleCount++;
      }
    }
    // 3. Check if Accessory / Controller
    else if (
      title.includes('dualsense') ||
      title.includes('controller') ||
      title.includes('gamepad') ||
      title.includes('headset') ||
      title.includes('headphones') ||
      title.includes('dock') ||
      title.includes('charging') ||
      title.includes('wheel') ||
      title.includes('arcade stick')
    ) {
      if (product.categoryId !== accCat.id) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: accCat.id },
        });
        accCount++;
      }
    }
    // 4. Default remaining to Games
    else {
      if (product.categoryId !== gamesCat.id && !title.includes('hardware')) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: gamesCat.id },
        });
        gameCount++;
      }
    }
  }

  console.log(`Reclassification complete!`);
  console.log(`Moved to PC Hardware: ${pcCount}`);
  console.log(`Moved to Consoles: ${consoleCount}`);
  console.log(`Moved to Accessories: ${accCount}`);
  console.log(`Moved to Video Games: ${gameCount}`);
}

reclassifyProducts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
