import mongoose from 'mongoose';
import argon2 from 'argon2';

const MONGO_BASE_URI = process.env.MONGODB_BASE_URI || 'mongodb://localhost:27017';

async function seed() {
  console.log('[Seed] Starting MongoDB database seeding...');

  // 1. Seed Auth Database (veyra_auth)
  console.log('\n--- Seeding Auth Service (veyra_auth) ---');
  const authConn = await mongoose.createConnection(`${MONGO_BASE_URI}/veyra_auth`).asPromise();
  const User = authConn.model(
    'User',
    new mongoose.Schema({
      _id: String,
      email: { type: String, unique: true },
      fullName: String,
      phone: String,
      passwordHash: String,
      role: String,
      isActive: Boolean,
      isVerified: Boolean
    }, { timestamps: true })
  );

  await User.deleteMany({});
  const hashedPw = await argon2.hash('password123');

  await User.create([
    {
      _id: 'usr-demo-001',
      email: 'demo@veyra.in',
      fullName: 'Aarav Sharma',
      phone: '+919876543210',
      passwordHash: hashedPw,
      role: 'CUSTOMER',
      isActive: true,
      isVerified: true
    },
    {
      _id: 'usr-admin-001',
      email: 'admin@veyra.in',
      fullName: 'Admin Operations',
      phone: '+919876543211',
      passwordHash: hashedPw,
      role: 'SUPER_ADMIN',
      isActive: true,
      isVerified: true
    }
  ]);
  console.log('✓ Seeded Demo Users (demo@veyra.in, admin@veyra.in)');
  await authConn.close();

  // 2. Seed Catalog Database (veyra_catalog)
  console.log('\n--- Seeding Catalog Service (veyra_catalog) ---');
  const catalogConn = await mongoose.createConnection(`${MONGO_BASE_URI}/veyra_catalog`).asPromise();

  const Category = catalogConn.model(
    'Category',
    new mongoose.Schema({
      _id: String,
      name: String,
      slug: { type: String, unique: true },
      description: String,
      parentId: String,
      isActive: Boolean
    }, { timestamps: true })
  );

  const Product = catalogConn.model(
    'Product',
    new mongoose.Schema({
      _id: String,
      categoryId: String,
      brandId: String,
      name: String,
      slug: { type: String, unique: true },
      description: String,
      hsnCode: String,
      gstRate: Number,
      isActive: Boolean,
      attributes: mongoose.Schema.Types.Mixed
    }, { timestamps: true })
  );

  const ProductVariant = catalogConn.model(
    'ProductVariant',
    new mongoose.Schema({
      _id: String,
      productId: String,
      sku: { type: String, unique: true },
      title: String,
      mrp: Number,
      sellingPrice: Number,
      weightGrams: Number,
      lengthCm: Number,
      widthCm: Number,
      heightCm: Number,
      variantOptions: mongoose.Schema.Types.Mixed,
      images: [mongoose.Schema.Types.Mixed]
    }, { timestamps: true })
  );

  const Inventory = catalogConn.model(
    'Inventory',
    new mongoose.Schema({
      _id: String,
      variantId: { type: String, unique: true },
      stockQuantity: Number,
      reservedQuantity: Number,
      version: Number
    }, { timestamps: true })
  );

  await Category.deleteMany({});
  await Product.deleteMany({});
  await ProductVariant.deleteMany({});
  await Inventory.deleteMany({});

  const categories = await Category.create([
    { _id: 'cat-001', name: 'Watches', slug: 'watches', description: 'Luxury and smart precision timepieces', isActive: true },
    { _id: 'cat-002', name: 'Apparel', slug: 'apparel', description: 'Contemporary Indian and western wear', isActive: true },
    { _id: 'cat-003', name: 'Audio & Acoustics', slug: 'audio', description: 'Studio-grade headphones and earphones', isActive: true },
    { _id: 'cat-004', name: 'Leather Goods', slug: 'leather-goods', description: 'Handcrafted genuine leather accessories', isActive: true },
  ]);

  const productsData = [
    {
      _id: 'prd-001',
      categoryId: 'cat-001',
      name: 'Veyra Chronograph Stealth Ceramic',
      slug: 'veyra-chronograph-stealth-ceramic',
      description: 'Matte black high-tech ceramic case with sapphire crystal and Japanese meca-quartz movement.',
      hsnCode: '91021200',
      gstRate: 18,
      isActive: true,
      attributes: { Movement: 'Meca-Quartz', WaterResistance: '10 ATM', CaseMaterial: 'Ceramic' },
      variants: [
        {
          _id: 'var-001-a',
          sku: 'VYR-CHR-BLK-42',
          title: '42mm Matte Obsidian',
          mrp: 14999,
          sellingPrice: 11999,
          stock: 45,
          images: [
            { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', isPrimary: true }
          ]
        },
        {
          _id: 'var-001-b',
          sku: 'VYR-CHR-SLV-42',
          title: '42mm Brushed Platinum',
          mrp: 15999,
          sellingPrice: 12999,
          stock: 30,
          images: [
            { url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80', isPrimary: true }
          ]
        }
      ]
    },
    {
      _id: 'prd-002',
      categoryId: 'cat-003',
      name: 'Veyra Horizon ANC Wireless Headphones',
      slug: 'veyra-horizon-anc-wireless-headphones',
      description: 'Flagship 40mm beryllium drivers, active hybrid noise cancellation with 45 hours battery life.',
      hsnCode: '85183000',
      gstRate: 18,
      isActive: true,
      attributes: { Drivers: '40mm Beryllium', Battery: '45h ANC on', Codec: 'LDAC, AAC' },
      variants: [
        {
          _id: 'var-002-a',
          sku: 'VYR-ANC-MID-01',
          title: 'Midnight Slate',
          mrp: 18999,
          sellingPrice: 14499,
          stock: 60,
          images: [
            { url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', isPrimary: true }
          ]
        }
      ]
    },
    {
      _id: 'prd-003',
      categoryId: 'cat-004',
      name: 'Veyra Artisan Italian Leather Bifold',
      slug: 'veyra-artisan-italian-leather-bifold',
      description: 'Vegetable-tanned full-grain Tuscan leather with RFID blocking brass mesh lining.',
      hsnCode: '42023120',
      gstRate: 18,
      isActive: true,
      attributes: { Material: 'Full Grain Tuscan Leather', Protection: 'RFID Shielding' },
      variants: [
        {
          _id: 'var-003-a',
          sku: 'VYR-WLT-COGNAC',
          title: 'Cognac Brown',
          mrp: 3999,
          sellingPrice: 2799,
          stock: 120,
          images: [
            { url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80', isPrimary: true }
          ]
        }
      ]
    }
  ];

  for (const p of productsData) {
    const { variants, ...prodFields } = p;
    await Product.create(prodFields);
    for (const v of variants) {
      const { stock, ...varFields } = v;
      await ProductVariant.create({ ...varFields, productId: p._id });
      await Inventory.create({
        _id: `inv-${v._id}`,
        variantId: v._id,
        stockQuantity: stock,
        reservedQuantity: 0,
        version: 1
      });
    }
  }
  console.log(`✓ Seeded ${categories.length} Categories, ${productsData.length} Products with Variants & Stock`);
  await catalogConn.close();

  // 3. Seed Order Database (veyra_order)
  console.log('\n--- Seeding Order Service (veyra_order) ---');
  const orderConn = await mongoose.createConnection(`${MONGO_BASE_URI}/veyra_order`).asPromise();
  const Coupon = orderConn.model(
    'Coupon',
    new mongoose.Schema({
      _id: String,
      code: { type: String, unique: true },
      discountType: String,
      discountValue: Number,
      minOrderAmount: Number,
      maxDiscountAmount: Number,
      usageLimit: Number,
      usedCount: Number,
      expiresAt: Date,
      isActive: Boolean
    }, { timestamps: true })
  );

  await Coupon.deleteMany({});
  await Coupon.create([
    {
      _id: 'cpn-001',
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 999,
      maxDiscountAmount: 1000,
      usageLimit: 1000,
      usedCount: 0,
      isActive: true
    },
    {
      _id: 'cpn-002',
      code: 'FESTIVE500',
      discountType: 'FLAT',
      discountValue: 500,
      minOrderAmount: 2999,
      maxDiscountAmount: 500,
      usageLimit: 500,
      usedCount: 0,
      isActive: true
    }
  ]);
  console.log('✓ Seeded Statutory Promo Coupons (WELCOME10, FESTIVE500)');
  await orderConn.close();

  console.log('\n🎉 MongoDB database seeding successfully completed!');
}

seed().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
