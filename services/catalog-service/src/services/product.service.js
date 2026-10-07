import Product from '../models/Product.model.js';
import ProductVariant from '../models/ProductVariant.model.js';
import Inventory from '../models/Inventory.model.js';

function toSlug(text) {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
}

export const productService = {
  async getProducts({ page = 1, limit = 20, categoryId, search, sortBy = 'newest' }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = { isActive: true };
    if (categoryId) query.categoryId = categoryId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = sortBy === 'name' ? { name: 1 } : { createdAt: -1 };

    const [total, items] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort(sortOrder)
        .populate('category', 'id name slug')
        .populate({
          path: 'variants',
          populate: { path: 'inventory' }
        })
    ]);

    return {
      products: items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  },

  async getProductBySlug(slug) {
    const product = await Product.findOne({ slug })
      .populate('category')
      .populate({
        path: 'variants',
        populate: { path: 'inventory' }
      });

    if (!product) throw new Error('Product not found');
    return product;
  },

  async createProduct({ name, categoryId, brandId, description, hsnCode, gstRate, attributes = {}, variants = [] }) {
    let slug = toSlug(name);
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const product = await Product.create({
      name: name.trim(),
      slug,
      categoryId,
      brandId: brandId || null,
      description: description || null,
      hsnCode: hsnCode.toString(),
      gstRate: parseFloat(gstRate) || 18,
      attributes
    });

    const createdVariants = [];
    for (const v of variants) {
      const variant = await ProductVariant.create({
        productId: product.id,
        sku: v.sku.trim(),
        title: v.title.trim(),
        mrp: parseFloat(v.mrp),
        sellingPrice: parseFloat(v.sellingPrice),
        weightGrams: parseInt(v.weightGrams, 10) || 100,
        lengthCm: v.lengthCm ? parseFloat(v.lengthCm) : null,
        widthCm: v.widthCm ? parseFloat(v.widthCm) : null,
        heightCm: v.heightCm ? parseFloat(v.heightCm) : null,
        variantOptions: v.variantOptions || {},
        images: v.images || []
      });

      const inv = await Inventory.create({
        variantId: variant.id,
        stockQuantity: parseInt(v.initialStock, 10) || 0,
        reservedQuantity: 0,
        version: 1
      });

      const variantJson = variant.toJSON();
      variantJson.inventory = inv.toJSON();
      createdVariants.push(variantJson);
    }

    const productJson = product.toJSON();
    productJson.variants = createdVariants;
    return productJson;
  }
};

export default productService;
