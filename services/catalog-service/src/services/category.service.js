import prisma from '../prisma.js';

function toSlug(text) {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
}

export const categoryService = {
  async getCategories() {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { children: true },
      orderBy: { name: 'asc' }
    });
    // Return root categories with nested children
    return categories.filter(c => !c.parentId);
  },

  async getCategoryBySlug(slug) {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { children: true, products: true }
    });
    if (!category) throw new Error('Category not found');
    return category;
  },

  async createCategory({ name, description, parentId }) {
    let slug = toSlug(name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    return await prisma.category.create({
      data: {
        name: name.trim(),
        slug,
        description: description || null,
        parentId: parentId || null
      }
    });
  },

  async updateCategory(id, { name, description, isActive }) {
    const data = {};
    if (name) {
      data.name = name.trim();
      data.slug = toSlug(name);
    }
    if (description !== undefined) data.description = description;
    if (isActive !== undefined) data.isActive = isActive;

    return await prisma.category.update({
      where: { id },
      data
    });
  }
};
