import { productService } from '../services/product.service.js';

export const productController = {
  async getProducts(req, res) {
    try {
      const result = await productService.getProducts(req.query);
      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getProductBySlug(req, res) {
    try {
      const product = await productService.getProductBySlug(req.params.slug);
      return res.status(200).json({ success: true, data: product });
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message });
    }
  },

  async createProduct(req, res) {
    try {
      const { name, categoryId, brandId, description, hsnCode, gstRate, attributes, variants } = req.body;

      if (!name || !categoryId || !hsnCode) {
        return res.status(400).json({ success: false, error: 'Product name, categoryId, and hsnCode are required' });
      }

      if (!Array.isArray(variants) || variants.length === 0) {
        return res.status(400).json({ success: false, error: 'Product must have at least one variant SKU' });
      }

      for (const v of variants) {
        if (!v.sku || !v.title || v.mrp === undefined || v.sellingPrice === undefined) {
          return res.status(400).json({ success: false, error: 'Each variant must specify sku, title, mrp, and sellingPrice' });
        }
      }

      const product = await productService.createProduct({
        name,
        categoryId,
        brandId,
        description,
        hsnCode,
        gstRate,
        attributes,
        variants
      });

      return res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
};
