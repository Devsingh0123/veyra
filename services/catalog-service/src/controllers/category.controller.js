import { categoryService } from '../services/category.service.js';

export const categoryController = {
  async getCategories(req, res) {
    try {
      const categories = await categoryService.getCategories();
      return res.status(200).json({ success: true, data: categories });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getCategoryBySlug(req, res) {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      return res.status(200).json({ success: true, data: category });
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message });
    }
  },

  async createCategory(req, res) {
    try {
      const { name, description, parentId } = req.body;
      if (!name || name.trim().length < 2) {
        return res.status(400).json({ success: false, error: 'Category name must be at least 2 characters' });
      }

      const category = await categoryService.createCategory({ name, description, parentId });
      return res.status(201).json({ success: true, message: 'Category created', data: category });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  async updateCategory(req, res) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      return res.status(200).json({ success: true, message: 'Category updated', data: category });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
};
