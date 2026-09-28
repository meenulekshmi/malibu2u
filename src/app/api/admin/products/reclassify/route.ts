import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Ensure categories exist
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
    let updatedCount = 0;

    for (const product of allProducts) {
      const title = product.name.toLowerCase();
      let targetCategoryId = gamesCat.id;

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
        targetCategoryId = pcCat.id;
      } else if (
        title.includes('console') ||
        title.includes('ps5 digital') ||
        title.includes('ps5 slim') ||
        title.includes('ps5 pro') ||
        title.includes('switch oled')
      ) {
        targetCategoryId = consoleCat.id;
      } else if (
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
        targetCategoryId = accCat.id;
      }

      if (product.categoryId !== targetCategoryId) {
        await prisma.product.update({
          where: { id: product.id },
          data: { categoryId: targetCategoryId },
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully re-organized ${updatedCount} products into their correct categories.`,
      updatedCount,
    });
  } catch (error: any) {
    console.error('Error in reclassify route:', error);
    return NextResponse.json({ error: error?.message || 'Failed to reclassify products' }, { status: 500 });
  }
}
