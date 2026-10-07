import Category from '../models/Category.model.js';

function toSlug(text) {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
}

export const categoryService = {
  async getCategories() {
    const categories = await Category.find({ isActive: true })
      .populate('children')
      .sort({ name: 1 });
    // Return root categories with nested children
    return categories.filter(c => !c.parentId);
  },

  async getCategoryBySlug(slug) {
    const category = await Category.findOne({ slug })
      .populate('children')
      .populate('products');

    if (!category) throw new Error('Category not found');
    return category;
  },

  async createCategory({ name, description, parentId }) {
    let slug = toSlug(name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    return await Category.create({
      name: name.trim(),
      slug,
      description: description || null,
      parentId: parentId || null
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

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    if (!updated) throw new Error('Category not found');
    return updated;
  }
};

export default categoryService;
