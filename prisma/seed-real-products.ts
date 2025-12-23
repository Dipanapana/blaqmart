import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database with real South African products...")

  // Delete all existing products and hampers to start fresh
  console.log("Cleaning up old data...")
  await prisma.hamperPreset.deleteMany({})
  const deletedCount = await prisma.product.deleteMany({})
  console.log(`✓ Deleted hamper presets and ${deletedCount.count} old products`)

  // Create admin user
  const adminPassword = await hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@blaqmart.co.za" },
    update: {},
    create: {
      email: "admin@blaqmart.co.za",
      name: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })
  console.log("✓ Created admin user:", admin.email)

  // Create default supplier (Blaqmart)
  const supplier = await prisma.supplier.upsert({
    where: { slug: "blaqmart" },
    update: {},
    create: {
      userId: admin.id,
      shopName: "Blaqmart",
      slug: "blaqmart",
      description: "Essential groceries delivered to Warrenton",
      suburb: "Warrenton Central",
      city: "Warrenton",
      province: "Northern Cape",
      isActive: true,
      isVerified: true,
    },
  })
  console.log("✓ Created supplier:", supplier.shopName)

  // Create categories
  const categories = [
    {
      name: "Fresh Produce",
      slug: "fresh-produce",
      description: "Fresh fruits and vegetables",
      sortOrder: 1,
    },
    {
      name: "Meat & Poultry",
      slug: "meat-poultry",
      description: "Fresh meat, chicken, and braai essentials",
      sortOrder: 2,
    },
    {
      name: "Dairy & Eggs",
      slug: "dairy-eggs",
      description: "Milk, cheese, yogurt, and eggs",
      sortOrder: 3,
    },
    {
      name: "Bakery",
      slug: "bakery",
      description: "Fresh bread and baked goods",
      sortOrder: 4,
    },
    {
      name: "Pantry Staples",
      slug: "pantry-staples",
      description: "Rice, sugar, flour, oil, and cooking essentials",
      sortOrder: 5,
    },
    {
      name: "Beverages",
      slug: "beverages",
      description: "Cold drinks, juice, and refreshments",
      sortOrder: 6,
    },
    {
      name: "Cleaning Products",
      slug: "cleaning-products",
      description: "Household cleaning supplies",
      sortOrder: 7,
    },
    {
      name: "Personal Care",
      slug: "personal-care",
      description: "Toiletries and hygiene products",
      sortOrder: 8,
    },
    {
      name: "Snacks",
      slug: "snacks",
      description: "Chips, biscuits, and treats",
      sortOrder: 9,
    },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log("✓ Created", categories.length, "categories")

  // Get category IDs
  const produceCategory = await prisma.category.findUnique({ where: { slug: "fresh-produce" } })
  const meatCategory = await prisma.category.findUnique({ where: { slug: "meat-poultry" } })
  const dairyCategory = await prisma.category.findUnique({ where: { slug: "dairy-eggs" } })
  const bakeryCategory = await prisma.category.findUnique({ where: { slug: "bakery" } })
  const pantryCategory = await prisma.category.findUnique({ where: { slug: "pantry-staples" } })
  const beveragesCategory = await prisma.category.findUnique({ where: { slug: "beverages" } })
  const cleaningCategory = await prisma.category.findUnique({ where: { slug: "cleaning-products" } })
  const personalCareCategory = await prisma.category.findUnique({ where: { slug: "personal-care" } })
  const snacksCategory = await prisma.category.findUnique({ where: { slug: "snacks" } })

  // Real products with actual South African prices (2025 data)
  const products = [
    // FRESH PRODUCE
    {
      name: "Potatoes",
      slug: "potatoes-2kg",
      description: "Fresh white potatoes - 2kg bag",
      price: 36.00,
      categoryId: produceCategory!.id,
      stock: 50,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80"],
    },
    {
      name: "Tomatoes",
      slug: "tomatoes-1kg",
      description: "Fresh ripe tomatoes - per kg",
      price: 28.00,
      categoryId: produceCategory!.id,
      stock: 40,
      images: ["https://images.unsplash.com/photo-1546470427-227f42d32d25?w=800&q=80"],
    },
    {
      name: "Onions",
      slug: "onions-2kg",
      description: "Brown onions - 2kg bag",
      price: 32.00,
      categoryId: produceCategory!.id,
      stock: 45,
      images: ["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&q=80"],
    },
    {
      name: "Carrots",
      slug: "carrots-1kg",
      description: "Fresh carrots - per kg",
      price: 22.00,
      categoryId: produceCategory!.id,
      stock: 35,
      images: ["https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&q=80"],
    },
    {
      name: "Bananas",
      slug: "bananas",
      description: "Fresh bananas - per kg",
      price: 24.00,
      categoryId: produceCategory!.id,
      stock: 30,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80"],
    },
    {
      name: "Apples - Golden Delicious",
      slug: "apples-golden",
      description: "Golden Delicious apples - per kg",
      price: 35.00,
      categoryId: produceCategory!.id,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80"],
    },
    {
      name: "Cabbage",
      slug: "cabbage",
      description: "Fresh green cabbage - each",
      price: 18.00,
      categoryId: produceCategory!.id,
      stock: 20,
      images: ["https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&q=80"],
    },
    {
      name: "Spinach",
      slug: "spinach-bunch",
      description: "Fresh spinach - per bunch",
      price: 15.00,
      categoryId: produceCategory!.id,
      stock: 15,
      images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80"],
    },

    // MEAT & POULTRY
    {
      name: "Beef Mince",
      slug: "beef-mince-500g",
      description: "Lean beef mince - 500g",
      price: 75.00,
      categoryId: meatCategory!.id,
      stock: 20,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1603048588665-791ca8ead9cc?w=800&q=80"],
    },
    {
      name: "Chicken Pieces",
      slug: "chicken-pieces-1kg",
      description: "Fresh chicken portions - per kg",
      price: 68.00,
      categoryId: meatCategory!.id,
      stock: 25,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&q=80"],
    },
    {
      name: "Boerewors",
      slug: "boerewors-1kg",
      description: "Traditional beef boerewors - per kg",
      price: 95.00,
      categoryId: meatCategory!.id,
      stock: 15,
      images: ["https://images.unsplash.com/photo-1607623488052-1f6d072a3d5d?w=800&q=80"],
    },
    {
      name: "Lamb Chops",
      slug: "lamb-chops-500g",
      description: "Fresh lamb loin chops - 500g",
      price: 120.00,
      categoryId: meatCategory!.id,
      stock: 10,
      images: ["https://images.unsplash.com/photo-1574781681375-4fe77f1d36a6?w=800&q=80"],
    },
    {
      name: "Pork Sausage",
      slug: "pork-sausage-1kg",
      description: "Pork sausage - per kg",
      price: 72.00,
      categoryId: meatCategory!.id,
      stock: 18,
      images: ["https://images.unsplash.com/photo-1566522650166-bd8b3e3a2b4b?w=800&q=80"],
    },

    // DAIRY & EGGS
    {
      name: "Full Cream Milk 2L",
      slug: "full-cream-milk-2l",
      description: "Fresh full cream milk - 2 litre",
      price: 35.95,
      categoryId: dairyCategory!.id,
      stock: 40,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80"],
    },
    {
      name: "Eggs - Large (18)",
      slug: "eggs-large-18",
      description: "Large fresh eggs - tray of 18",
      price: 67.41,
      categoryId: dairyCategory!.id,
      stock: 30,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80"],
    },
    {
      name: "Eggs - Medium (6)",
      slug: "eggs-medium-6",
      description: "Medium fresh eggs - 6 pack",
      price: 22.00,
      categoryId: dairyCategory!.id,
      stock: 35,
      images: ["https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=800&q=80"],
    },
    {
      name: "Cheddar Cheese 400g",
      slug: "cheddar-cheese-400g",
      description: "Cheddar cheese block - 400g",
      price: 52.00,
      categoryId: dairyCategory!.id,
      stock: 20,
      images: ["https://images.unsplash.com/photo-1618164436241-4473940d1f5c?w=800&q=80"],
    },
    {
      name: "Butter 500g",
      slug: "butter-500g",
      description: "Salted butter - 500g",
      price: 48.00,
      categoryId: dairyCategory!.id,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80"],
    },
    {
      name: "Plain Yoghurt 1kg",
      slug: "plain-yoghurt-1kg",
      description: "Plain double cream yoghurt - 1kg tub",
      price: 38.00,
      categoryId: dairyCategory!.id,
      stock: 15,
      images: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80"],
    },

    // BAKERY
    {
      name: "White Bread",
      slug: "white-bread-700g",
      description: "Sliced white bread - 700g loaf",
      price: 18.43,
      categoryId: bakeryCategory!.id,
      stock: 50,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80"],
    },
    {
      name: "Brown Bread",
      slug: "brown-bread-700g",
      description: "Sliced brown bread - 700g loaf",
      price: 19.50,
      categoryId: bakeryCategory!.id,
      stock: 45,
      images: ["https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=800&q=80"],
    },
    {
      name: "Hot Dog Rolls (6)",
      slug: "hot-dog-rolls-6",
      description: "Soft hot dog rolls - pack of 6",
      price: 16.00,
      categoryId: bakeryCategory!.id,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1618912391780-75f72940bd04?w=800&q=80"],
    },

    // PANTRY STAPLES
    {
      name: "White Sugar 2.5kg",
      slug: "white-sugar-2-5kg",
      description: "Selati white sugar - 2.5kg",
      price: 42.00,
      categoryId: pantryCategory!.id,
      stock: 30,
      images: ["https://images.unsplash.com/photo-1587735243615-c03f25aaff15?w=800&q=80"],
    },
    {
      name: "Brown Sugar 2kg",
      slug: "brown-sugar-2kg",
      description: "Brown sugar - 2kg",
      price: 45.00,
      categoryId: pantryCategory!.id,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=800&q=80"],
    },
    {
      name: "Sunflower Oil 2L",
      slug: "sunflower-oil-2l",
      description: "Pure sunflower cooking oil - 2 litre",
      price: 48.00,
      categoryId: pantryCategory!.id,
      stock: 35,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80"],
    },
    {
      name: "Tastic Rice 2kg",
      slug: "tastic-rice-2kg",
      description: "Tastic white rice - 2kg",
      price: 38.00,
      categoryId: pantryCategory!.id,
      stock: 40,
      images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"],
    },
    {
      name: "Cake Flour 2.5kg",
      slug: "cake-flour-2-5kg",
      description: "Snowflake cake wheat flour - 2.5kg",
      price: 36.00,
      categoryId: pantryCategory!.id,
      stock: 30,
      images: ["https://images.unsplash.com/photo-1628784230353-5bee16e2f005?w=800&q=80"],
    },
    {
      name: "Maize Meal 2.5kg",
      slug: "maize-meal-2-5kg",
      description: "Iwisa super maize meal - 2.5kg",
      price: 32.00,
      categoryId: pantryCategory!.id,
      stock: 35,
      images: ["https://images.unsplash.com/photo-1608797178974-15b35a64ede9?w=800&q=80"],
    },
    {
      name: "Salt 500g",
      slug: "salt-500g",
      description: "Fine table salt - 500g",
      price: 12.00,
      categoryId: pantryCategory!.id,
      stock: 40,
      images: ["https://images.unsplash.com/photo-1598512726440-679de5fa0fb7?w=800&q=80"],
    },
    {
      name: "Pasta 500g",
      slug: "pasta-500g",
      description: "Spaghetti pasta - 500g",
      price: 18.00,
      categoryId: pantryCategory!.id,
      stock: 30,
      images: ["https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80"],
    },
    {
      name: "Baked Beans 410g",
      slug: "baked-beans-410g",
      description: "Baked beans in tomato sauce - 410g can",
      price: 14.50,
      categoryId: pantryCategory!.id,
      stock: 45,
      images: ["https://images.unsplash.com/photo-1562843436-c2b2c1a6997d?w=800&q=80"],
    },
    {
      name: "Tomato Sauce 700ml",
      slug: "tomato-sauce-700ml",
      description: "All Gold tomato sauce - 700ml",
      price: 24.00,
      categoryId: pantryCategory!.id,
      stock: 35,
      images: ["https://images.unsplash.com/photo-1628451859591-c1fb3335b2b0?w=800&q=80"],
    },

    // BEVERAGES
    {
      name: "Coca-Cola 2L",
      slug: "coca-cola-2l",
      description: "Coca-Cola Original - 2 litre",
      price: 26.00,
      categoryId: beveragesCategory!.id,
      stock: 50,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80"],
    },
    {
      name: "Coca-Cola 500ml",
      slug: "coca-cola-500ml",
      description: "Coca-Cola Original - 500ml bottle",
      price: 14.00,
      categoryId: beveragesCategory!.id,
      stock: 60,
      images: ["https://images.unsplash.com/photo-1629203851122-3726ecdf5c66?w=800&q=80"],
    },
    {
      name: "Sprite 2L",
      slug: "sprite-2l",
      description: "Sprite Lemon-Lime - 2 litre",
      price: 24.00,
      categoryId: beveragesCategory!.id,
      stock: 40,
      images: ["https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=800&q=80"],
    },
    {
      name: "Fanta Orange 2L",
      slug: "fanta-orange-2l",
      description: "Fanta Orange - 2 litre",
      price: 24.00,
      categoryId: beveragesCategory!.id,
      stock: 40,
      images: ["https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=800&q=80"],
    },
    {
      name: "Cappy 100% Apple Juice 1L",
      slug: "cappy-apple-juice-1l",
      description: "Cappy 100% apple juice - 1 litre",
      price: 32.00,
      categoryId: beveragesCategory!.id,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80"],
    },
    {
      name: "Cappy 100% Orange Juice 1L",
      slug: "cappy-orange-juice-1l",
      description: "Cappy 100% orange juice - 1 litre",
      price: 32.00,
      categoryId: beveragesCategory!.id,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80"],
    },
    {
      name: "Rooibos Tea (80 bags)",
      slug: "rooibos-tea-80",
      description: "Rooibos tea bags - 80 pack",
      price: 42.00,
      categoryId: beveragesCategory!.id,
      stock: 20,
      images: ["https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=800&q=80"],
    },
    {
      name: "Five Roses Tea (100 bags)",
      slug: "five-roses-tea-100",
      description: "Five Roses regular tea bags - 100 pack",
      price: 52.00,
      categoryId: beveragesCategory!.id,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80"],
    },
    {
      name: "Instant Coffee 200g",
      slug: "instant-coffee-200g",
      description: "Ricoffy instant coffee - 200g",
      price: 48.00,
      categoryId: beveragesCategory!.id,
      stock: 20,
      images: ["https://images.unsplash.com/photo-1611564371437-136c6d273652?w=800&q=80"],
    },

    // CLEANING PRODUCTS
    {
      name: "Domestos Thick Bleach 750ml",
      slug: "domestos-bleach-750ml",
      description: "Domestos multipurpose thick bleach - 750ml",
      price: 35.99,
      categoryId: cleaningCategory!.id,
      stock: 30,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&q=80"],
    },
    {
      name: "Jik Bleach 1.5L",
      slug: "jik-bleach-1-5l",
      description: "Jik lemon fresh liquid bleach - 1.5 litre",
      price: 46.99,
      categoryId: cleaningCategory!.id,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1563387852576-964bc31b73af?w=800&q=80"],
    },
    {
      name: "Sunlight Washing Powder 2kg",
      slug: "sunlight-powder-2kg",
      description: "Sunlight 2in1 auto washing powder - 2kg",
      price: 79.99,
      categoryId: cleaningCategory!.id,
      stock: 20,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80"],
    },
    {
      name: "Sunlight Laundry Soap 500g",
      slug: "sunlight-soap-500g",
      description: "Sunlight original laundry bar soap - 500g",
      price: 25.99,
      categoryId: cleaningCategory!.id,
      stock: 35,
      images: ["https://images.unsplash.com/photo-1622544499480-1e901d0e1df8?w=800&q=80"],
    },
    {
      name: "Handy Andy 750ml",
      slug: "handy-andy-750ml",
      description: "Handy Andy all purpose cleaner - 750ml",
      price: 28.00,
      categoryId: cleaningCategory!.id,
      stock: 30,
      images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80"],
    },
    {
      name: "Toilet Paper (9 rolls)",
      slug: "toilet-paper-9",
      description: "Premium soft toilet paper - 9 roll pack",
      price: 42.00,
      categoryId: cleaningCategory!.id,
      stock: 40,
      images: ["https://images.unsplash.com/photo-1584556326561-c8746083993b?w=800&q=80"],
    },
    {
      name: "Dishwashing Liquid 750ml",
      slug: "dishwash-liquid-750ml",
      description: "Sunlight dishwashing liquid lemon - 750ml",
      price: 28.00,
      categoryId: cleaningCategory!.id,
      stock: 30,
      images: ["https://images.unsplash.com/photo-1585574650763-8a5a1f73bef7?w=800&q=80"],
    },

    // PERSONAL CARE
    {
      name: "Bath Soap (3 pack)",
      slug: "bath-soap-3pack",
      description: "Lux beauty bar soap - 3 x 150g",
      price: 32.00,
      categoryId: personalCareCategory!.id,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=80"],
    },
    {
      name: "Toothpaste 75ml",
      slug: "toothpaste-75ml",
      description: "Colgate cavity protection toothpaste - 75ml",
      price: 22.00,
      categoryId: personalCareCategory!.id,
      stock: 30,
      images: ["https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80"],
    },
    {
      name: "Shampoo 400ml",
      slug: "shampoo-400ml",
      description: "Sunsilk shampoo - 400ml",
      price: 38.00,
      categoryId: personalCareCategory!.id,
      stock: 20,
      images: ["https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80"],
    },
    {
      name: "Roll-on Deodorant",
      slug: "deodorant-roll-on",
      description: "Shield anti-perspirant roll-on - 50ml",
      price: 28.00,
      categoryId: personalCareCategory!.id,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"],
    },

    // SNACKS
    {
      name: "Simba Chips 120g",
      slug: "simba-chips-120g",
      description: "Simba potato chips - 120g packet",
      price: 18.00,
      categoryId: snacksCategory!.id,
      stock: 50,
      images: ["https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&q=80"],
    },
    {
      name: "Tennis Biscuits 200g",
      slug: "tennis-biscuits-200g",
      description: "Bakers Tennis biscuits - 200g",
      price: 14.00,
      categoryId: snacksCategory!.id,
      stock: 40,
      images: ["https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80"],
    },
    {
      name: "Chocolates (Cadbury Dairy Milk) 80g",
      slug: "cadbury-dairy-milk-80g",
      description: "Cadbury Dairy Milk chocolate - 80g slab",
      price: 22.00,
      categoryId: snacksCategory!.id,
      stock: 35,
      isFeatured: true,
      images: ["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&q=80"],
    },
    {
      name: "Peanuts Salted 400g",
      slug: "peanuts-salted-400g",
      description: "Roasted salted peanuts - 400g",
      price: 32.00,
      categoryId: snacksCategory!.id,
      stock: 25,
      images: ["https://images.unsplash.com/photo-1573636543288-4fde8c6c5eff?w=800&q=80"],
    },
  ]

  // Create products
  for (const product of products) {
    await prisma.product.create({
      data: {
        ...product,
        images: JSON.stringify(product.images),
        supplierId: supplier.id,
      },
    })
  }
  console.log("✓ Created", products.length, "products with real SA prices and Unsplash images")

  // Create delivery zones for Warrenton
  const zones = [
    {
      name: "Warrenton Central",
      suburbs: [
        "Warrenton Central",
        "Warrenton West",
        "Warrenton East",
        "Warrenton North",
      ],
      baseFee: 40.0,
      freeAbove: 500.0,
    },
    {
      name: "Warrenton Surrounding",
      suburbs: [
        "Barkly West",
        "Delportshoop",
        "Windsorton",
        "Schmidtsdrift",
      ],
      baseFee: 60.0,
      freeAbove: 600.0,
    },
    {
      name: "Kimberley Area",
      suburbs: [
        "Kimberley",
        "Galeshewe",
        "Beaconsfield",
        "Hadison Park",
        "Royldene",
      ],
      baseFee: 100.0,
      freeAbove: 800.0,
    },
  ]

  for (const zone of zones) {
    const existing = await prisma.deliveryZone.findFirst({
      where: { name: zone.name },
    })

    if (!existing) {
      await prisma.deliveryZone.create({
        data: {
          ...zone,
          suburbs: JSON.stringify(zone.suburbs),
          isActive: true,
        },
      })
    }
  }
  console.log("✓ Created", zones.length, "delivery zones")

  // Create store settings
  await prisma.storeSetting.upsert({
    where: { key: "general" },
    update: {},
    create: {
      key: "general",
      value: {
        storeName: "Blaqmart",
        storeEmail: "orders@blaqmart.co.za",
        storePhone: "+27 53 497 3xxx",
        minimumOrderValue: 100,
        freeDeliveryThreshold: 500,
      },
    },
  })
  console.log("✓ Created store settings")

  console.log("\n✅ Database seeding completed successfully!")
  console.log("   Total products:", products.length)
  console.log("   Total categories:", categories.length)
  console.log("   All prices based on 2025 South African market data")
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
