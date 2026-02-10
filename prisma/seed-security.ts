import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding BLAQMART Security products...');

  // 1. Find or create admin user for the security store
  let adminUser = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        phone: '+27000000000',
        name: 'BLAQMART Admin',
        role: 'ADMIN',
      },
    });
    console.log('Created admin user:', adminUser.id);
  }

  // 2. Create BLAQMART Security store
  let securityStore = await prisma.store.findFirst({
    where: { name: 'BLAQMART Security' },
  });

  if (!securityStore) {
    securityStore = await prisma.store.create({
      data: {
        name: 'BLAQMART Security',
        address: 'Nationwide - South Africa',
        phone: '+27000000001',
        latitude: -26.2041,
        longitude: 28.0473,
        isActive: true,
        vendorId: adminUser.id,
        subscriptionTier: 'ENTERPRISE',
      },
    });
    console.log('Created BLAQMART Security store:', securityStore.id);
  }

  // 3. Deactivate all existing grocery products
  const deactivated = await prisma.product.updateMany({
    where: {
      category: 'GROCERY',
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });
  console.log(`Deactivated ${deactivated.count} grocery products`);

  // 4. Seed security products
  const products = [
    {
      name: 'BM Pro Dashcam 1080P',
      description:
        'Capture every moment on the road with the BM Pro Dashcam. Full 1080P HD recording with a 170-degree ultra-wide angle lens ensures nothing is missed. Built-in night vision, G-sensor crash detection, and loop recording give you complete peace of mind. Compact 2.0" LCD screen design mounts discreetly on your windscreen.',
      price: 790.0,
      stock: 50,
      category: 'SECURITY_DASHCAM' as const,
      sku: 'BM-DC-001',
      weight: 0.15,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      specs: {
        resolution: '1080P Full HD',
        angle: '170-degree wide angle',
        screen: '2.0 inch LCD',
        nightVision: true,
        gSensor: true,
        loopRecording: true,
        parkingMonitor: true,
        maxSD: '32GB',
        powerInput: '5V/1A (USB)',
        mountType: 'Suction Cup',
        operatingTemp: '-20C to 70C',
        warranty: '1 Year',
      },
    },
    {
      name: 'BM Dual Dashcam Front + Rear',
      description:
        'Complete front and rear coverage for maximum protection. The BM Dual Dashcam records 1080P Full HD from the front and 720P HD from the rear simultaneously. With 170-degree front and 140-degree rear wide-angle lenses, you get full surround awareness. Perfect for Uber drivers, fleet vehicles, and safety-conscious motorists.',
      price: 1290.0,
      stock: 30,
      category: 'SECURITY_DASHCAM' as const,
      sku: 'BM-DC-002',
      weight: 0.25,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      specs: {
        resolution: '1080P Front + 720P Rear',
        frontAngle: '170-degree wide angle',
        rearAngle: '140-degree wide angle',
        screen: '3.0 inch IPS',
        nightVision: true,
        gSensor: true,
        loopRecording: true,
        parkingMonitor: true,
        dualRecording: true,
        maxSD: '64GB',
        powerInput: '5V/2A (USB)',
        mountType: 'Adhesive + Suction Cup',
        operatingTemp: '-20C to 70C',
        warranty: '1 Year',
      },
    },
    {
      name: 'BM 4K Ultra Dashcam',
      description:
        'The ultimate in road recording technology. The BM 4K Ultra Dashcam delivers crystal-clear 4K Ultra HD footage with built-in WiFi for instant phone connectivity. GPS tracking overlays your speed and location on every recording. Premium WDR night vision ensures clarity day or night. The choice for those who demand the best.',
      price: 1890.0,
      stock: 20,
      category: 'SECURITY_DASHCAM' as const,
      sku: 'BM-DC-003',
      weight: 0.2,
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      specs: {
        resolution: '4K Ultra HD (3840x2160)',
        angle: '170-degree wide angle',
        screen: '2.0 inch IPS',
        nightVision: true,
        wdr: true,
        gSensor: true,
        loopRecording: true,
        parkingMonitor: true,
        wifi: true,
        gps: true,
        speedOverlay: true,
        maxSD: '128GB',
        powerInput: '5V/2A (USB-C)',
        mountType: 'Magnetic Mount',
        operatingTemp: '-20C to 70C',
        warranty: '1 Year',
      },
    },
    {
      name: '32GB MicroSD Card',
      description:
        'High-endurance 32GB MicroSD card optimized for continuous dashcam loop recording. Class 10 UHS-I speed rating ensures smooth, uninterrupted recording. Built to withstand extreme temperatures and thousands of write cycles.',
      price: 149.0,
      stock: 100,
      category: 'SECURITY_ACCESSORY' as const,
      sku: 'BM-AC-001',
      weight: 0.01,
      specs: {
        capacity: '32GB',
        class: 'Class 10, UHS-I',
        readSpeed: 'Up to 95MB/s',
        writeSpeed: 'Up to 30MB/s',
        endurance: 'High Endurance',
        temperature: '-25C to 85C',
        warranty: '1 Year',
      },
    },
    {
      name: 'Dashcam Hardwire Kit',
      description:
        'Power your dashcam directly from your vehicle battery with this professional hardwire kit. Includes a 12V to 5V converter, fuse tap adapter, and 3.5m cable for clean, hidden installation. Enables 24/7 parking mode monitoring without draining your battery thanks to the built-in low voltage cutoff.',
      price: 199.0,
      stock: 75,
      category: 'SECURITY_ACCESSORY' as const,
      sku: 'BM-AC-002',
      weight: 0.1,
      specs: {
        inputVoltage: '12V/24V',
        outputVoltage: '5V/2.5A',
        cableLength: '3.5 meters',
        connector: 'Mini USB / Micro USB / USB-C',
        lowVoltageCutoff: '11.6V',
        fuseType: 'Mini blade fuse tap',
        warranty: '1 Year',
      },
    },
    {
      name: 'Universal Suction Cup Mount',
      description:
        'Premium universal suction cup mount with 360-degree rotation and quick-release design. Strong vacuum lock holds your dashcam securely on any windscreen. Easy one-hand attach and detach for when you need to move your camera between vehicles.',
      price: 89.0,
      stock: 100,
      category: 'SECURITY_ACCESSORY' as const,
      sku: 'BM-AC-003',
      weight: 0.05,
      specs: {
        rotation: '360-degree',
        mountType: 'Suction Cup',
        compatibility: 'Universal (most dashcams)',
        material: 'ABS Plastic + Silicone',
        quickRelease: true,
        warranty: '6 Months',
      },
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { sku: product.sku },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          ...product,
          storeId: securityStore.id,
          isActive: true,
          images: [],
        },
      });
      console.log(`Created product: ${product.name} (${product.sku})`);
    } else {
      console.log(`Product already exists: ${product.name} (${product.sku})`);
    }
  }

  console.log('Security products seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
