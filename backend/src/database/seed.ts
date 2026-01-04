import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { User, AccessCode, Category, Product, Comment } from './entities';
import * as bcrypt from 'bcrypt';

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Data Source initialized');

    const userRepository = AppDataSource.getRepository(User);
    const accessCodeRepository = AppDataSource.getRepository(AccessCode);
    const categoryRepository = AppDataSource.getRepository(Category);
    const productRepository = AppDataSource.getRepository(Product);
    const commentRepository = AppDataSource.getRepository(Comment);

    const existingSuperAdmin = await userRepository.findOne({
      where: { phone: '+966500000001' }
    });

    if (!existingSuperAdmin) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      const superAdmin = userRepository.create({
        name: 'Super Admin',
        phone: '+966500000001',
        passwordHash,
        role: 'super_admin',
        active: true,
      });
      await userRepository.save(superAdmin);
      console.log('✓ Super admin created');
    } else {
      console.log('✓ Super admin already exists');
    }

    const existingCodesCount = await accessCodeRepository.count();
    if (existingCodesCount === 0) {
      const codes: AccessCode[] = [];
      const now = new Date();

      for (let i = 0; i < 5; i++) {
        const code = generateCode();
        const validUntil = new Date(now);
        validUntil.setDate(validUntil.getDate() + 30);

        codes.push(accessCodeRepository.create({
          code,
          role: 'user',
          validFrom: now,
          validUntil,
          usesAllowed: 1,
          usesCount: 0,
          isUsed: false,
          note: `30-day user access code ${i + 1}`,
        }));
      }

      for (let i = 0; i < 3; i++) {
        const code = generateCode();
        const validUntil = new Date(now);
        validUntil.setDate(validUntil.getDate() + 365);

        codes.push(accessCodeRepository.create({
          code,
          role: 'admin',
          validFrom: now,
          validUntil,
          usesAllowed: 1,
          usesCount: 0,
          isUsed: false,
          note: `365-day admin access code ${i + 1}`,
        }));
      }

      for (let i = 0; i < 2; i++) {
        const code = generateCode();
        const validUntil = new Date(now);
        validUntil.setDate(validUntil.getDate() + 30);

        codes.push(accessCodeRepository.create({
          code,
          role: 'user',
          validFrom: now,
          validUntil,
          usesAllowed: 5,
          usesCount: 0,
          isUsed: false,
          note: `30-day multi-use user code ${i + 1}`,
        }));
      }

      await accessCodeRepository.save(codes);
      console.log(`✓ Created ${codes.length} access codes`);
      console.log('\nSample Access Codes:');
      codes.forEach((code) => {
        console.log(`  ${code.code} - ${code.role} (${code.usesAllowed} uses, valid until ${code.validUntil.toISOString().split('T')[0]})`);
      });
    } else {
      console.log('✓ Access codes already exist');
    }

    // Seed categories
    const existingCategoriesCount = await categoryRepository.count();
    if (existingCategoriesCount === 0) {
      const categories = [
        { nameEn: 'Electronics', nameAr: 'إلكترونيات' },
        { nameEn: 'Clothing', nameAr: 'ملابس' },
        { nameEn: 'Home & Garden', nameAr: 'المنزل والحديقة' },
        { nameEn: 'Sports & Outdoors', nameAr: 'الرياضة والهواء الطلق' },
        { nameEn: 'Food & Beverages', nameAr: 'الطعام والمشروبات' },
      ];

      const createdCategories = categories.map(cat => categoryRepository.create(cat));
      await categoryRepository.save(createdCategories);
      console.log(`✓ Created ${createdCategories.length} categories`);
    } else {
      console.log('✓ Categories already exist');
    }

    // Seed products
    const existingProductsCount = await productRepository.count();
    if (existingProductsCount === 0) {
      const categories = await categoryRepository.find();
      const products: Product[] = [];

      // Electronics
      products.push(productRepository.create({
        title: 'Smart Phone Pro Max',
        shortDescription: 'Latest flagship smartphone with advanced features',
        fullDescription: 'Experience the future with our latest smartphone featuring a stunning display, powerful processor, and professional-grade camera system.',
        price: 4500,
        cost: 3800,
        currency: 'SAR',
        categoryId: categories[0].id,
        tags: ['new'],
        images: ['https://placehold.co/400x400?text=Smart+Phone'],
        stockCount: 50,
        available: true,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      products.push(productRepository.create({
        title: 'Wireless Earbuds',
        shortDescription: 'Premium noise-cancelling earbuds',
        fullDescription: 'Crystal clear audio with active noise cancellation. Perfect for music lovers and professionals.',
        price: 350,
        cost: 250,
        currency: 'SAR',
        categoryId: categories[0].id,
        tags: ['new'],
        images: ['https://placehold.co/400x400?text=Earbuds'],
        stockCount: 100,
        available: true,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      products.push(productRepository.create({
        title: 'Laptop Gaming Edition',
        shortDescription: 'High-performance gaming laptop',
        fullDescription: 'Dominate every game with this powerful gaming laptop. Features the latest graphics card and cooling system.',
        price: 5200,
        cost: 4200,
        currency: 'SAR',
        categoryId: categories[0].id,
        tags: ['coming_soon'],
        images: ['https://placehold.co/400x400?text=Laptop'],
        stockCount: 0,
        available: false,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      // Clothing
      products.push(productRepository.create({
        title: 'Premium Cotton T-Shirt',
        shortDescription: 'Comfortable and stylish t-shirt',
        fullDescription: 'Made from 100% premium cotton, this t-shirt offers ultimate comfort and style for everyday wear.',
        price: 120,
        cost: 60,
        currency: 'SAR',
        categoryId: categories[1].id,
        tags: ['new', 'order_to_buy'],
        images: ['https://placehold.co/400x400?text=T-Shirt'],
        stockCount: 200,
        available: true,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      products.push(productRepository.create({
        title: 'Designer Jeans',
        shortDescription: 'Modern fit designer jeans',
        fullDescription: 'Premium quality jeans with a modern fit. Perfect for any casual or semi-formal occasion.',
        price: 280,
        cost: 150,
        currency: 'SAR',
        categoryId: categories[1].id,
        tags: ['new'],
        images: ['https://placehold.co/400x400?text=Jeans'],
        stockCount: 8,
        available: true,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      products.push(productRepository.create({
        title: 'Winter Jacket',
        shortDescription: 'Warm and stylish winter jacket',
        fullDescription: 'Stay warm this winter with our premium winter jacket. Features waterproof material and thermal lining.',
        price: 450,
        cost: 280,
        currency: 'SAR',
        categoryId: categories[1].id,
        tags: ['coming_soon'],
        images: ['https://placehold.co/400x400?text=Jacket'],
        stockCount: 0,
        available: false,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      // Home & Garden
      products.push(productRepository.create({
        title: 'Smart Home Speaker',
        shortDescription: 'Voice-controlled smart speaker',
        fullDescription: 'Control your entire home with your voice using our smart speaker. Compatible with all major smart home devices.',
        price: 450,
        cost: 300,
        currency: 'SAR',
        categoryId: categories[2].id,
        tags: ['new', 'order_to_buy'],
        images: ['https://placehold.co/400x400?text=Smart+Speaker'],
        stockCount: 75,
        available: true,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      products.push(productRepository.create({
        title: 'Garden Tool Set',
        shortDescription: 'Complete garden tool kit',
        fullDescription: 'Everything you need for your garden in one premium tool set. Includes shovel, rake, pruning shears, and more.',
        price: 220,
        cost: 140,
        currency: 'SAR',
        categoryId: categories[2].id,
        tags: ['order_to_buy'],
        images: ['https://placehold.co/400x400?text=Garden+Tools'],
        stockCount: 40,
        available: true,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      // Sports & Outdoors
      products.push(productRepository.create({
        title: 'Running Shoes Pro',
        shortDescription: 'Professional running shoes',
        fullDescription: 'Designed for professional athletes and serious runners. Features advanced cushioning and breathable materials.',
        price: 550,
        cost: 350,
        currency: 'SAR',
        categoryId: categories[3].id,
        tags: ['new'],
        images: ['https://placehold.co/400x400?text=Running+Shoes'],
        stockCount: 60,
        available: true,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      products.push(productRepository.create({
        title: 'Yoga Mat Premium',
        shortDescription: 'Extra thick yoga mat',
        fullDescription: 'Premium quality yoga mat with extra thickness for maximum comfort during workouts. Non-slip surface.',
        price: 180,
        cost: 90,
        currency: 'SAR',
        categoryId: categories[3].id,
        tags: ['order_to_buy'],
        images: ['https://placehold.co/400x400?text=Yoga+Mat'],
        stockCount: 5,
        available: true,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      // Food & Beverages
      products.push(productRepository.create({
        title: 'Organic Coffee Blend',
        shortDescription: 'Premium organic coffee beans',
        fullDescription: '100% organic coffee beans sourced from sustainable farms. Rich flavor with notes of chocolate and caramel.',
        price: 85,
        cost: 50,
        currency: 'SAR',
        categoryId: categories[4].id,
        tags: ['new', 'order_to_buy'],
        images: ['https://placehold.co/400x400?text=Coffee'],
        stockCount: 150,
        available: true,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      products.push(productRepository.create({
        title: 'Premium Tea Collection',
        shortDescription: 'Assorted premium teas',
        fullDescription: 'A curated collection of premium teas from around the world. Includes black, green, and herbal teas.',
        price: 120,
        cost: 70,
        currency: 'SAR',
        categoryId: categories[4].id,
        tags: ['coming_soon'],
        images: ['https://placehold.co/400x400?text=Tea+Collection'],
        stockCount: 0,
        available: false,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      products.push(productRepository.create({
        title: 'Protein Powder',
        shortDescription: 'Whey protein supplement',
        fullDescription: 'High-quality whey protein powder for muscle building and recovery. Chocolate flavor.',
        price: 200,
        cost: 120,
        currency: 'SAR',
        categoryId: categories[4].id,
        tags: ['new'],
        images: ['https://placehold.co/400x400?text=Protein+Powder'],
        stockCount: 80,
        available: true,
        viewsCount: 0,
        likes: 0,
        dislikes: 0,
      }));

      await productRepository.save(products);
      console.log(`✓ Created ${products.length} products`);

      // Seed comments
      const allProducts = await productRepository.find();
      const comments: Comment[] = [];
      const sampleUsers = [
        { id: 'user-1', name: 'Ahmed' },
        { id: 'user-2', name: 'Sarah' },
        { id: 'user-3', name: 'Mohammed' },
      ];

      for (const product of allProducts.slice(0, 5)) {
        for (let i = 0; i < 3; i++) {
          const sampleUser = sampleUsers[i % sampleUsers.length];
          comments.push(commentRepository.create({
            productId: product.id,
            userId: existingSuperAdmin?.id || 'user-1',
            text: getSampleComment(),
            rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
            flagged: false,
          }));
        }
      }

      await commentRepository.save(comments);
      console.log(`✓ Created ${comments.length} comments`);
    } else {
      console.log('✓ Products already exist');
    }

    console.log('\n✅ Database seeding completed successfully');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

function getSampleComment(): string {
  const comments = [
    'Great product! Highly recommended.',
    'Excellent quality and fast delivery.',
    'Best purchase I have made this year.',
    'Very satisfied with this product.',
    'Good value for money.',
    'Amazing product, will buy again!',
  ];
  return comments[Math.floor(Math.random() * comments.length)];
}

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

seed();
