import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

// Helper to generate placeholder image URLs
const getPlaceholderImage = (category: string, id: number) => {
  // Using placehold.co with category-based colors
  const colors: Record<string, string> = {
    writing: "1E3A5F/FFB81C",     // Navy/Gold
    notebooks: "22C55E/FFFFFF",  // Green/White
    art: "EC4899/FFFFFF",        // Pink/White
    folders: "3B82F6/FFFFFF",    // Blue/White
    math: "F59E0B/FFFFFF",       // Amber/White
    bags: "8B5CF6/FFFFFF",       // Purple/White
    lunch: "10B981/FFFFFF",      // Emerald/White
    labels: "6366F1/FFFFFF",     // Indigo/White
  }
  const color = colors[category] || "1E3A5F/FFFFFF"
  return `https://placehold.co/400x400/${color}?text=${encodeURIComponent(category)}`
}

async function main() {
  console.log("🌱 Seeding Blaqmart database with SA stationery products...")

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
      shopName: "Blaqmart Stationery",
      slug: "blaqmart",
      description: "Quality school stationery at unbeatable prices - Grade R to Matric",
      suburb: "Warrenton Central",
      city: "Warrenton",
      province: "Northern Cape",
      isActive: true,
      isVerified: true,
    },
  })
  console.log("✓ Created supplier:", supplier.shopName)

  // Create grades (Grade R to Grade 12)
  const gradeData = [
    { name: "Grade R", slug: "grade-r", description: "Foundation Phase - Reception Year", sortOrder: 0 },
    { name: "Grade 1", slug: "grade-1", description: "Foundation Phase", sortOrder: 1 },
    { name: "Grade 2", slug: "grade-2", description: "Foundation Phase", sortOrder: 2 },
    { name: "Grade 3", slug: "grade-3", description: "Foundation Phase", sortOrder: 3 },
    { name: "Grade 4", slug: "grade-4", description: "Intermediate Phase", sortOrder: 4 },
    { name: "Grade 5", slug: "grade-5", description: "Intermediate Phase", sortOrder: 5 },
    { name: "Grade 6", slug: "grade-6", description: "Intermediate Phase", sortOrder: 6 },
    { name: "Grade 7", slug: "grade-7", description: "Senior Phase", sortOrder: 7 },
    { name: "Grade 8", slug: "grade-8", description: "Senior Phase", sortOrder: 8 },
    { name: "Grade 9", slug: "grade-9", description: "Senior Phase", sortOrder: 9 },
    { name: "Grade 10", slug: "grade-10", description: "FET Phase", sortOrder: 10 },
    { name: "Grade 11", slug: "grade-11", description: "FET Phase", sortOrder: 11 },
    { name: "Grade 12", slug: "grade-12", description: "FET Phase - Matric", sortOrder: 12 },
  ]

  for (const grade of gradeData) {
    await prisma.grade.upsert({
      where: { slug: grade.slug },
      update: {},
      create: grade,
    })
  }
  console.log("✓ Created grades (Grade R - Grade 12)")

  // Create stationery categories
  const categories = [
    { name: "Writing Instruments", slug: "writing-instruments", description: "Pens, pencils, crayons, markers & highlighters", sortOrder: 1 },
    { name: "Notebooks & Paper", slug: "notebooks-paper", description: "Exercise books, exam pads, drawing books & loose leaf", sortOrder: 2 },
    { name: "Art & Craft Supplies", slug: "art-supplies", description: "Paints, brushes, glue, scissors & creative supplies", sortOrder: 3 },
    { name: "Folders & Filing", slug: "folders-files", description: "Ring binders, display files, folders & document wallets", sortOrder: 4 },
    { name: "Calculators & Maths", slug: "calculators-math", description: "Scientific calculators, geometry sets & maths tools", sortOrder: 5 },
    { name: "School Bags", slug: "school-bags", description: "Backpacks, trolley bags & pencil cases", sortOrder: 6 },
    { name: "Lunch & Bottles", slug: "lunch-bottles", description: "Lunch boxes, water bottles & snack containers", sortOrder: 7 },
    { name: "Labels & Covers", slug: "labels-covers", description: "Book covers, name labels & stickers", sortOrder: 8 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log("✓ Created stationery categories")

  // Get category IDs
  const writingCategory = await prisma.category.findUnique({ where: { slug: "writing-instruments" } })
  const notebooksCategory = await prisma.category.findUnique({ where: { slug: "notebooks-paper" } })
  const artCategory = await prisma.category.findUnique({ where: { slug: "art-supplies" } })
  const foldersCategory = await prisma.category.findUnique({ where: { slug: "folders-files" } })
  const mathCategory = await prisma.category.findUnique({ where: { slug: "calculators-math" } })
  const bagsCategory = await prisma.category.findUnique({ where: { slug: "school-bags" } })
  const lunchCategory = await prisma.category.findUnique({ where: { slug: "lunch-bottles" } })
  const labelsCategory = await prisma.category.findUnique({ where: { slug: "labels-covers" } })

  // Create SA stationery products with realistic pricing (based on Yokico, Waltons, YourSchoolBox)
  const products = [
    // === WRITING INSTRUMENTS (Popular SA Brands) ===
    {
      name: "Staedtler Noris HB Pencils (12 Pack)",
      slug: "staedtler-noris-hb-pencils-12",
      description: "The classic yellow and black pencil loved by students. Break-resistant with smooth graphite core.",
      price: 59.99,
      comparePrice: 79.99,
      stock: 150,
      categoryId: writingCategory!.id,
      isFeatured: true,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=Pencils"]),
      tags: JSON.stringify(["staedtler", "pencils", "HB", "premium"]),
    },
    {
      name: "Bic Cristal Ballpoint Pens Blue (10 Pack)",
      slug: "bic-cristal-pens-blue-10",
      description: "Smooth-writing Bic Cristal pens with clear barrel. The world's best-selling pen.",
      price: 44.99,
      comparePrice: 54.99,
      stock: 120,
      categoryId: writingCategory!.id,
      isFeatured: true,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=Pens"]),
      tags: JSON.stringify(["bic", "pens", "blue", "ballpoint"]),
    },
    {
      name: "Pilot V5 Hi-Tecpoint Pens (4 Pack)",
      slug: "pilot-v5-pens-4-pack",
      description: "Premium liquid ink rollerball pens with precision tip. Smooth, skip-free writing.",
      price: 89.99,
      comparePrice: 109.99,
      stock: 60,
      categoryId: writingCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=Pilot"]),
      tags: JSON.stringify(["pilot", "pens", "premium", "liquid ink"]),
    },
    {
      name: "Pilot Frixion Erasable Pens (3 Pack)",
      slug: "pilot-frixion-erasable-3",
      description: "Write, erase, and rewrite! Thermo-sensitive ink that erases cleanly.",
      price: 79.99,
      stock: 45,
      categoryId: writingCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=Frixion"]),
      tags: JSON.stringify(["pilot", "erasable", "frixion"]),
    },
    {
      name: "Croxley Wax Crayons (24 Pack)",
      slug: "croxley-wax-crayons-24",
      description: "Vibrant, non-toxic wax crayons in 24 bright colors. Perfect for young artists.",
      price: 39.99,
      comparePrice: 49.99,
      stock: 100,
      categoryId: writingCategory!.id,
      isFeatured: true,
      images: JSON.stringify(["https://placehold.co/400x400/EC4899/FFFFFF?text=Crayons"]),
      tags: JSON.stringify(["croxley", "crayons", "colors"]),
    },
    {
      name: "Staedtler Triplus Fineliners (10 Pack)",
      slug: "staedtler-triplus-fineliners-10",
      description: "Triangular barrel for comfortable grip. Dry-safe ink stays fresh for days without cap.",
      price: 149.99,
      comparePrice: 179.99,
      stock: 40,
      categoryId: writingCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=Fineliners"]),
      tags: JSON.stringify(["staedtler", "fineliners", "colors"]),
    },
    {
      name: "Stabilo Boss Highlighters (6 Pack)",
      slug: "stabilo-boss-highlighters-6",
      description: "Original Stabilo Boss highlighters in neon colors. Anti-dry-out ink lasts up to 4 hours uncapped.",
      price: 89.99,
      comparePrice: 99.99,
      stock: 70,
      categoryId: writingCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/FFB81C/1E3A5F?text=Highlighters"]),
      tags: JSON.stringify(["stabilo", "highlighters", "neon"]),
    },
    {
      name: "Faber-Castell Colour Pencils (12 Pack)",
      slug: "faber-castell-colour-pencils-12",
      description: "Premium colour pencils with rich pigments. Break-resistant leads for smooth colouring.",
      price: 49.99,
      comparePrice: 64.99,
      stock: 90,
      categoryId: writingCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/EC4899/FFFFFF?text=Colour+Pencils"]),
      tags: JSON.stringify(["faber-castell", "colour pencils", "premium"]),
    },
    {
      name: "Pentel Energel Pens Black (3 Pack)",
      slug: "pentel-energel-black-3",
      description: "Quick-drying gel ink perfect for left-handers. Smooth, vibrant lines.",
      price: 69.99,
      stock: 55,
      categoryId: writingCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=Gel+Pens"]),
      tags: JSON.stringify(["pentel", "gel pen", "black"]),
    },
    {
      name: "Large White Eraser (2 Pack)",
      slug: "large-white-eraser-2-pack",
      description: "Soft, dust-free eraser that won't tear paper. Cleans up easily.",
      price: 14.99,
      stock: 200,
      categoryId: writingCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/FFFFFF/1E3A5F?text=Erasers"]),
      tags: JSON.stringify(["eraser", "correction"]),
    },
    {
      name: "Metal Pencil Sharpener Double",
      slug: "metal-sharpener-double",
      description: "Heavy-duty double hole sharpener for pencils and colour pencils.",
      price: 19.99,
      stock: 120,
      categoryId: writingCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/6B7280/FFFFFF?text=Sharpener"]),
      tags: JSON.stringify(["sharpener", "metal"]),
    },

    // === NOTEBOOKS & PAPER ===
    {
      name: "Croxley A4 Feint & Margin 72pg (5 Pack)",
      slug: "croxley-a4-72pg-5-pack",
      description: "Quality A4 exercise books with feint lines and red margin. Soft cover.",
      price: 64.99,
      comparePrice: 79.99,
      stock: 200,
      categoryId: notebooksCategory!.id,
      isFeatured: true,
      images: JSON.stringify(["https://placehold.co/400x400/22C55E/FFFFFF?text=Exercise+Books"]),
      tags: JSON.stringify(["croxley", "exercise book", "A4"]),
    },
    {
      name: "Croxley A4 Hard Cover 192pg",
      slug: "croxley-a4-hardcover-192pg",
      description: "Durable hard cover exercise book for heavy use. Feint ruled with margin.",
      price: 34.99,
      comparePrice: 44.99,
      stock: 120,
      categoryId: notebooksCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/22C55E/FFFFFF?text=Hard+Cover"]),
      tags: JSON.stringify(["croxley", "hard cover", "192 page"]),
    },
    {
      name: "Croxley A5 Exercise Book 96pg (3 Pack)",
      slug: "croxley-a5-96pg-3-pack",
      description: "Compact A5 exercise books perfect for vocabulary and notes.",
      price: 29.99,
      stock: 150,
      categoryId: notebooksCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=croxley-a5.jpg"]),
      tags: JSON.stringify(["croxley", "A5", "exercise book"]),
    },
    {
      name: "A4 Exam Pad 100 Sheets",
      slug: "a4-exam-pad-100-sheets",
      description: "Punched A4 exam pad with feint ruled pages. Perfect for tests and exams.",
      price: 29.99,
      comparePrice: 39.99,
      stock: 100,
      categoryId: notebooksCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=exam-pad.jpg"]),
      tags: JSON.stringify(["exam pad", "A4", "tests"]),
    },
    {
      name: "Drawing Book A3",
      slug: "drawing-book-a3",
      description: "Large format A3 drawing book with cartridge paper. 24 pages.",
      price: 24.99,
      stock: 80,
      categoryId: notebooksCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=drawing-book.jpg"]),
      tags: JSON.stringify(["drawing", "A3", "art"]),
    },
    {
      name: "Flip File A4 (20 Pocket)",
      slug: "flip-file-a4-20-pocket",
      description: "Display book with 20 clear pockets. Great for projects and portfolios.",
      price: 29.99,
      stock: 90,
      categoryId: notebooksCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=flip-file.jpg"]),
      tags: JSON.stringify(["flip file", "display", "filing"]),
    },

    // === ART & CRAFT SUPPLIES ===
    {
      name: "Reeves Watercolour Set (24 Colours)",
      slug: "reeves-watercolour-24",
      description: "Professional quality watercolours with brush included. Vibrant, mixable colours.",
      price: 149.99,
      comparePrice: 189.99,
      stock: 35,
      categoryId: artCategory!.id,
      isFeatured: true,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=reeves-watercolour.jpg"]),
      tags: JSON.stringify(["reeves", "watercolour", "paint"]),
    },
    {
      name: "Dala Poster Paint Set (6 Colours)",
      slug: "dala-poster-paint-6",
      description: "Bright, opaque poster paints in 6 primary colours. Non-toxic, washable.",
      price: 54.99,
      stock: 60,
      categoryId: artCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=dala-poster.jpg"]),
      tags: JSON.stringify(["dala", "poster paint", "washable"]),
    },
    {
      name: "UHU Glue Stick 40g (2 Pack)",
      slug: "uhu-glue-stick-40g-2-pack",
      description: "Solvent-free, washable glue stick. Dries clear with strong bond.",
      price: 39.99,
      stock: 150,
      categoryId: artCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=uhu-glue.jpg"]),
      tags: JSON.stringify(["uhu", "glue", "adhesive"]),
    },
    {
      name: "Pritt Stick 43g",
      slug: "pritt-stick-43g",
      description: "The original glue stick. Non-toxic, acid-free, and washable.",
      price: 29.99,
      comparePrice: 34.99,
      stock: 100,
      categoryId: artCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=pritt-stick.jpg"]),
      tags: JSON.stringify(["pritt", "glue", "original"]),
    },
    {
      name: "Safety Scissors Rounded Tip",
      slug: "safety-scissors-rounded",
      description: "Safe scissors with rounded tips for young children. Comfortable grip handles.",
      price: 24.99,
      stock: 100,
      categoryId: artCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=safety-scissors.jpg"]),
      tags: JSON.stringify(["scissors", "safe", "children"]),
    },
    {
      name: "Paint Brush Set (12 Pack)",
      slug: "paint-brush-set-12",
      description: "Assorted brush sizes with wooden handles. Great for all paint types.",
      price: 34.99,
      stock: 70,
      categoryId: artCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=paint-brushes.jpg"]),
      tags: JSON.stringify(["brushes", "paint", "art"]),
    },
    {
      name: "Modelling Clay Set (8 Colours)",
      slug: "modelling-clay-8-colours",
      description: "Non-drying modelling clay in 8 bright colours. Soft and easy to mould.",
      price: 44.99,
      stock: 50,
      categoryId: artCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=modelling-clay.jpg"]),
      tags: JSON.stringify(["clay", "modelling", "craft"]),
    },

    // === FOLDERS & FILING ===
    {
      name: "Bantex A4 Ring Binder 2D 25mm",
      slug: "bantex-ring-binder-2d-25mm",
      description: "Quality PVC ring binder with 2D ring mechanism. Holds up to 200 sheets.",
      price: 49.99,
      comparePrice: 59.99,
      stock: 80,
      categoryId: foldersCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=bantex-binder.jpg"]),
      tags: JSON.stringify(["bantex", "ring binder", "filing"]),
    },
    {
      name: "Document Wallet A4 Clear (10 Pack)",
      slug: "document-wallet-clear-10",
      description: "Clear plastic document wallets with press-stud closure.",
      price: 34.99,
      stock: 100,
      categoryId: foldersCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=document-wallets.jpg"]),
      tags: JSON.stringify(["document wallet", "clear", "filing"]),
    },
    {
      name: "Plastic Sleeve A4 (50 Pack)",
      slug: "plastic-sleeve-a4-50",
      description: "Clear plastic sleeves for ring binders. Punched holes for filing.",
      price: 44.99,
      stock: 80,
      categoryId: foldersCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=plastic-sleeves.jpg"]),
      tags: JSON.stringify(["sleeves", "filing", "clear"]),
    },

    // === CALCULATORS & MATHS ===
    {
      name: "Casio FX-82ZA Plus II Scientific",
      slug: "casio-fx82za-plus-ii",
      description: "The CAPS-approved scientific calculator for SA schools. 252 functions.",
      price: 279.99,
      comparePrice: 329.99,
      stock: 40,
      categoryId: mathCategory!.id,
      isFeatured: true,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=casio-fx82za.jpg"]),
      tags: JSON.stringify(["casio", "calculator", "scientific", "CAPS"]),
    },
    {
      name: "Sharp EL-531 Scientific Calculator",
      slug: "sharp-el531-scientific",
      description: "Advanced scientific calculator with 272 functions. Solar and battery powered.",
      price: 199.99,
      comparePrice: 249.99,
      stock: 35,
      categoryId: mathCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=sharp-calculator.jpg"]),
      tags: JSON.stringify(["sharp", "calculator", "scientific"]),
    },
    {
      name: "Helix Oxford Maths Set",
      slug: "helix-oxford-maths-set",
      description: "Complete 9-piece geometry set in tin. Compass, protractor, set squares & more.",
      price: 49.99,
      comparePrice: 64.99,
      stock: 70,
      categoryId: mathCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=helix-maths-set.jpg"]),
      tags: JSON.stringify(["helix", "geometry", "maths set"]),
    },
    {
      name: "Staedtler Geometry Set",
      slug: "staedtler-geometry-set",
      description: "Premium geometry set with precision compass and instruments.",
      price: 39.99,
      stock: 60,
      categoryId: mathCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=staedtler-geometry.jpg"]),
      tags: JSON.stringify(["staedtler", "geometry"]),
    },
    {
      name: "Plastic Ruler 30cm Clear",
      slug: "plastic-ruler-30cm",
      description: "Shatterproof clear plastic ruler with metric and inch markings.",
      price: 9.99,
      stock: 200,
      categoryId: mathCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=ruler-30cm.jpg"]),
      tags: JSON.stringify(["ruler", "30cm", "measuring"]),
    },

    // === SCHOOL BAGS ===
    {
      name: "Totem Orthopaedic School Bag",
      slug: "totem-orthopaedic-bag",
      description: "Ergonomic design supports growing spines. Multiple compartments, padded straps.",
      price: 599.99,
      comparePrice: 749.99,
      stock: 25,
      categoryId: bagsCategory!.id,
      isFeatured: true,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=totem-bag.jpg"]),
      tags: JSON.stringify(["totem", "orthopaedic", "backpack"]),
    },
    {
      name: "Canvas Student Backpack",
      slug: "canvas-student-backpack",
      description: "Durable canvas backpack with laptop pocket. Water-resistant base.",
      price: 299.99,
      comparePrice: 399.99,
      stock: 40,
      categoryId: bagsCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=canvas-backpack.jpg"]),
      tags: JSON.stringify(["backpack", "canvas", "laptop"]),
    },
    {
      name: "Junior Trolley School Bag",
      slug: "junior-trolley-bag",
      description: "Wheeled trolley bag for little ones. Takes the weight off shoulders.",
      price: 449.99,
      comparePrice: 549.99,
      stock: 20,
      categoryId: bagsCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=trolley-bag.jpg"]),
      tags: JSON.stringify(["trolley", "wheeled", "junior"]),
    },
    {
      name: "Pencil Case Double Zip",
      slug: "pencil-case-double-zip",
      description: "Spacious pencil case with two compartments. Durable canvas material.",
      price: 49.99,
      stock: 100,
      categoryId: bagsCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=pencil-case.jpg"]),
      tags: JSON.stringify(["pencil case", "storage"]),
    },

    // === LUNCH & BOTTLES ===
    {
      name: "Sistema Lunch Cube Container",
      slug: "sistema-lunch-cube",
      description: "BPA-free lunch container with removable compartments. Microwave safe.",
      price: 89.99,
      stock: 50,
      categoryId: lunchCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=sistema-lunch.jpg"]),
      tags: JSON.stringify(["sistema", "lunch box", "BPA free"]),
    },
    {
      name: "Water Bottle 500ml BPA Free",
      slug: "water-bottle-500ml",
      description: "Leak-proof water bottle with flip-top lid. Easy to clean.",
      price: 59.99,
      stock: 80,
      categoryId: lunchCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=water-bottle.jpg"]),
      tags: JSON.stringify(["water bottle", "BPA free"]),
    },

    // === LABELS & COVERS ===
    {
      name: "A4 Book Cover Roll (2m)",
      slug: "book-cover-roll-2m",
      description: "Self-adhesive transparent book cover. Protects books from wear and tear.",
      price: 34.99,
      stock: 100,
      categoryId: labelsCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=book-cover.jpg"]),
      tags: JSON.stringify(["book cover", "protection"]),
    },
    {
      name: "Name Labels Self-Adhesive (100 Pack)",
      slug: "name-labels-100-pack",
      description: "Blank white labels for books, stationery and belongings.",
      price: 19.99,
      stock: 150,
      categoryId: labelsCategory!.id,
      images: JSON.stringify(["https://placehold.co/400x400/1E3A5F/FFB81C?text=name-labels.jpg"]),
      tags: JSON.stringify(["labels", "name tags"]),
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        supplierId: supplier.id,
      },
    })
  }
  console.log(`✓ Created ${products.length} SA stationery products`)

  // Get grades for stationery packs
  const gradeR = await prisma.grade.findUnique({ where: { slug: "grade-r" } })
  const grade1 = await prisma.grade.findUnique({ where: { slug: "grade-1" } })
  const grade4 = await prisma.grade.findUnique({ where: { slug: "grade-4" } })
  const grade8 = await prisma.grade.findUnique({ where: { slug: "grade-8" } })
  const grade12 = await prisma.grade.findUnique({ where: { slug: "grade-12" } })

  // Get key products for packs
  const staedtlerPencils = await prisma.product.findUnique({ where: { slug: "staedtler-noris-hb-pencils-12" } })
  const bicPens = await prisma.product.findUnique({ where: { slug: "bic-cristal-pens-blue-10" } })
  const croxleyCrayons = await prisma.product.findUnique({ where: { slug: "croxley-wax-crayons-24" } })
  const colourPencils = await prisma.product.findUnique({ where: { slug: "faber-castell-colour-pencils-12" } })
  const croxleyA4_72 = await prisma.product.findUnique({ where: { slug: "croxley-a4-72pg-5-pack" } })
  const croxleyHardcover = await prisma.product.findUnique({ where: { slug: "croxley-a4-hardcover-192pg" } })
  const uhuGlue = await prisma.product.findUnique({ where: { slug: "uhu-glue-stick-40g-2-pack" } })
  const safetyScissors = await prisma.product.findUnique({ where: { slug: "safety-scissors-rounded" } })
  const eraser = await prisma.product.findUnique({ where: { slug: "large-white-eraser-2-pack" } })
  const sharpener = await prisma.product.findUnique({ where: { slug: "metal-sharpener-double" } })
  const ruler = await prisma.product.findUnique({ where: { slug: "plastic-ruler-30cm" } })
  const mathsSet = await prisma.product.findUnique({ where: { slug: "helix-oxford-maths-set" } })
  const casioCalc = await prisma.product.findUnique({ where: { slug: "casio-fx82za-plus-ii" } })
  const ringBinder = await prisma.product.findUnique({ where: { slug: "bantex-ring-binder-2d-25mm" } })
  const highlighters = await prisma.product.findUnique({ where: { slug: "stabilo-boss-highlighters-6" } })

  // Delete existing pack items to avoid duplicates
  await prisma.stationeryPackItem.deleteMany({})
  await prisma.stationeryPack.deleteMany({})

  // Create Grade R Pack (R199.99)
  await prisma.stationeryPack.create({
    data: {
      supplierId: supplier.id,
      gradeId: gradeR!.id,
      name: "Grade R Complete Stationery Pack",
      slug: "grade-r-complete-pack",
      description: "Everything your little one needs for their first year. Colourful supplies to make learning fun!",
      price: 199.99,
      comparePrice: 259.99,
      isFeatured: true,
      items: {
        create: [
          { productId: staedtlerPencils!.id, quantity: 1 },
          { productId: croxleyCrayons!.id, quantity: 1 },
          { productId: colourPencils!.id, quantity: 1 },
          { productId: croxleyA4_72!.id, quantity: 1 },
          { productId: uhuGlue!.id, quantity: 1 },
          { productId: safetyScissors!.id, quantity: 1 },
          { productId: eraser!.id, quantity: 1 },
        ],
      },
    },
  })
  console.log("✓ Created Grade R Pack (R199.99)")

  // Create Grade 1 Pack (R299.99)
  await prisma.stationeryPack.create({
    data: {
      supplierId: supplier.id,
      gradeId: grade1!.id,
      name: "Grade 1 Complete Stationery Pack",
      slug: "grade-1-complete-pack",
      description: "Start primary school prepared! All the essentials for your Grade 1 superstar.",
      price: 299.99,
      comparePrice: 399.99,
      isFeatured: true,
      items: {
        create: [
          { productId: staedtlerPencils!.id, quantity: 2 },
          { productId: croxleyCrayons!.id, quantity: 1 },
          { productId: colourPencils!.id, quantity: 1 },
          { productId: croxleyA4_72!.id, quantity: 2 },
          { productId: uhuGlue!.id, quantity: 1 },
          { productId: safetyScissors!.id, quantity: 1 },
          { productId: eraser!.id, quantity: 1 },
          { productId: sharpener!.id, quantity: 1 },
          { productId: ruler!.id, quantity: 1 },
        ],
      },
    },
  })
  console.log("✓ Created Grade 1 Pack (R299.99)")

  // Create Grade 4 Pack (R449.99)
  await prisma.stationeryPack.create({
    data: {
      supplierId: supplier.id,
      gradeId: grade4!.id,
      name: "Grade 4 Intermediate Pack",
      slug: "grade-4-intermediate-pack",
      description: "Ready for Intermediate Phase! More subjects, more supplies, better organisation.",
      price: 449.99,
      comparePrice: 579.99,
      isFeatured: true,
      items: {
        create: [
          { productId: staedtlerPencils!.id, quantity: 2 },
          { productId: bicPens!.id, quantity: 1 },
          { productId: colourPencils!.id, quantity: 1 },
          { productId: croxleyA4_72!.id, quantity: 2 },
          { productId: croxleyHardcover!.id, quantity: 3 },
          { productId: ringBinder!.id, quantity: 2 },
          { productId: eraser!.id, quantity: 1 },
          { productId: sharpener!.id, quantity: 1 },
          { productId: ruler!.id, quantity: 1 },
          { productId: mathsSet!.id, quantity: 1 },
        ],
      },
    },
  })
  console.log("✓ Created Grade 4 Pack (R449.99)")

  // Create Grade 8 Pack (R699.99)
  await prisma.stationeryPack.create({
    data: {
      supplierId: supplier.id,
      gradeId: grade8!.id,
      name: "Grade 8 High School Starter Pack",
      slug: "grade-8-high-school-pack",
      description: "High school ready! Everything needed for Senior Phase success including scientific calculator.",
      price: 699.99,
      comparePrice: 899.99,
      isFeatured: true,
      items: {
        create: [
          { productId: staedtlerPencils!.id, quantity: 2 },
          { productId: bicPens!.id, quantity: 2 },
          { productId: highlighters!.id, quantity: 1 },
          { productId: croxleyHardcover!.id, quantity: 5 },
          { productId: ringBinder!.id, quantity: 3 },
          { productId: eraser!.id, quantity: 1 },
          { productId: sharpener!.id, quantity: 1 },
          { productId: ruler!.id, quantity: 1 },
          { productId: mathsSet!.id, quantity: 1 },
          { productId: casioCalc!.id, quantity: 1 },
        ],
      },
    },
  })
  console.log("✓ Created Grade 8 Pack (R699.99)")

  // Create Matric Pack (R849.99)
  await prisma.stationeryPack.create({
    data: {
      supplierId: supplier.id,
      gradeId: grade12!.id,
      name: "Matric Success Pack",
      slug: "matric-success-pack",
      description: "Final year, final push! Premium stationery for your Matric year including CAPS-approved calculator.",
      price: 849.99,
      comparePrice: 1099.99,
      isFeatured: true,
      items: {
        create: [
          { productId: staedtlerPencils!.id, quantity: 2 },
          { productId: bicPens!.id, quantity: 2 },
          { productId: highlighters!.id, quantity: 1 },
          { productId: croxleyHardcover!.id, quantity: 6 },
          { productId: ringBinder!.id, quantity: 4 },
          { productId: eraser!.id, quantity: 2 },
          { productId: sharpener!.id, quantity: 1 },
          { productId: ruler!.id, quantity: 2 },
          { productId: mathsSet!.id, quantity: 1 },
          { productId: casioCalc!.id, quantity: 1 },
        ],
      },
    },
  })
  console.log("✓ Created Matric Pack (R849.99)")

  // Create delivery zones
  const zones = [
    {
      name: "Warrenton",
      suburbs: JSON.stringify(["Warrenton Central", "Warrenton West", "Warrenton East", "Ikhutseng"]),
      towns: JSON.stringify(["Warrenton"]),
      deliveryType: "LOCAL_OWN_VEHICLE" as const,
      baseFee: 0,
      freeAbove: 200,
      codAvailable: true,
      estimatedDays: "Same day",
      sameDayCutoff: "14:00",
    },
    {
      name: "Jan Kempdorp",
      suburbs: JSON.stringify(["Jan Kempdorp Central", "Valspan"]),
      towns: JSON.stringify(["Jan Kempdorp"]),
      deliveryType: "LOCAL_OWN_VEHICLE" as const,
      baseFee: 0,
      freeAbove: 200,
      codAvailable: true,
      estimatedDays: "Same day",
      sameDayCutoff: "12:00",
    },
    {
      name: "Hartswater",
      suburbs: JSON.stringify(["Hartswater"]),
      towns: JSON.stringify(["Hartswater"]),
      deliveryType: "COURIER" as const,
      baseFee: 50,
      freeAbove: 500,
      codAvailable: false,
      estimatedDays: "1-2 days",
    },
    {
      name: "Christiana",
      suburbs: JSON.stringify(["Christiana"]),
      towns: JSON.stringify(["Christiana"]),
      deliveryType: "COURIER" as const,
      baseFee: 50,
      freeAbove: 500,
      codAvailable: false,
      estimatedDays: "1-2 days",
    },
    {
      name: "Kimberley",
      suburbs: JSON.stringify(["Kimberley CBD", "Galeshewe", "Beaconsfield", "Hadison Park", "Cassandra"]),
      towns: JSON.stringify(["Kimberley"]),
      deliveryType: "COURIER" as const,
      baseFee: 80,
      freeAbove: 600,
      codAvailable: false,
      estimatedDays: "2-3 days",
    },
  ]

  for (const zone of zones) {
    await prisma.deliveryZone.upsert({
      where: { id: zone.name.toLowerCase().replace(/\s/g, "-") },
      update: {},
      create: {
        id: zone.name.toLowerCase().replace(/\s/g, "-"),
        ...zone,
      },
    })
  }
  console.log("✓ Created delivery zones with COD support")

  // Create schools
  const schools = [
    { name: "Warrenton Primary School", slug: "warrenton-primary", town: "Warrenton", isPartner: true },
    { name: "Warrenton High School", slug: "warrenton-high", town: "Warrenton", isPartner: true },
    { name: "Jan Kempdorp Primary School", slug: "jan-kempdorp-primary", town: "Jan Kempdorp", isPartner: true },
    { name: "Hartswater Primary School", slug: "hartswater-primary", town: "Hartswater", isPartner: false },
    { name: "Christiana Primary School", slug: "christiana-primary", town: "Christiana", isPartner: false },
    { name: "Floors Combined School", slug: "floors-combined", town: "Warrenton", isPartner: false },
  ]

  for (const school of schools) {
    await prisma.school.upsert({
      where: { slug: school.slug },
      update: {},
      create: school,
    })
  }
  console.log("✓ Created schools")

  // Create store settings
  await prisma.storeSetting.upsert({
    where: { key: "store_info" },
    update: {
      value: {
        name: "Blaqmart Stationery",
        tagline: "Quality School Stationery at Unbeatable Prices",
        email: "orders@blaqmart.co.za",
        phone: "+27 53 497 0000",
        whatsapp: "+27 72 123 4567",
        address: "Warrenton, Northern Cape, South Africa",
      },
    },
    create: {
      key: "store_info",
      value: {
        name: "Blaqmart Stationery",
        tagline: "Quality School Stationery at Unbeatable Prices",
        email: "orders@blaqmart.co.za",
        phone: "+27 53 497 0000",
        whatsapp: "+27 72 123 4567",
        address: "Warrenton, Northern Cape, South Africa",
      },
    },
  })

  await prisma.storeSetting.upsert({
    where: { key: "delivery_settings" },
    update: {
      value: {
        operatingHours: { start: "08:00", end: "18:00" },
        deliverySlots: ["08:00-12:00", "12:00-15:00", "15:00-18:00"],
        sameDayCutoff: "14:00",
        codAvailableTowns: ["Warrenton", "Jan Kempdorp"],
        freeDeliveryMinimum: 500,
      },
    },
    create: {
      key: "delivery_settings",
      value: {
        operatingHours: { start: "08:00", end: "18:00" },
        deliverySlots: ["08:00-12:00", "12:00-15:00", "15:00-18:00"],
        sameDayCutoff: "14:00",
        codAvailableTowns: ["Warrenton", "Jan Kempdorp"],
        freeDeliveryMinimum: 500,
      },
    },
  })
  console.log("✓ Created store settings")

  console.log("\n🎉 Seeding complete! Blaqmart is ready for business.")
  console.log("   - 40+ SA stationery products")
  console.log("   - 5 grade-specific stationery packs")
  console.log("   - 5 delivery zones (2 with COD)")
  console.log("   - 6 partner schools")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
