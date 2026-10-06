import prisma from '../prisma.js';

function toSlug(text) {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
}

export const productService = {
  async getProducts({ page = 1, limit = 20, categoryId, search, sortBy = 'newest' }) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const orderBy = sortBy === 'name' ? { name: 'asc' } : { createdAt: 'desc' };

    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { include: { inventory: true } }
        }
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
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        variants: { include: { inventory: true } }
      }
    });

    if (!product) throw new Error('Product not found');
    return product;
  },

  async createProduct({ name, categoryId, brandId, description, hsnCode, gstRate, attributes = {}, variants = [] }) {
    let slug = toSlug(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: name.trim(),
          slug,
          categoryId,
          brandId: brandId || null,
          description: description || null,
          hsnCode: hsnCode.toString(),
          gstRate: parseFloat(gstRate) || 18,
          attributes
        }
      });

      const createdVariants = [];
      for (const v of variants) {
        const variant = await tx.productVariant.create({
          data: {
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
            images: v.images || [],
            inventory: {
              create: {
                stockQuantity: parseInt(v.initialStock, 10) || 0,
                reservedQuantity: 0
              }
            }
          },
          include: { inventory: true }
        });
        createdVariants.push(variant);
      }

      return { ...product, variants: createdVariants };
    });
  }
};
