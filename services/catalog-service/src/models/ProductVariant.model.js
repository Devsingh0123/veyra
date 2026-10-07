import mongoose from 'mongoose';
import crypto from 'crypto';

const productVariantSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    productId: {
      type: String,
      ref: 'Product',
      required: true,
      index: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    mrp: {
      type: Number,
      required: true
    },
    sellingPrice: {
      type: Number,
      required: true
    },
    weightGrams: {
      type: Number,
      default: 100
    },
    lengthCm: {
      type: Number,
      default: null
    },
    widthCm: {
      type: Number,
      default: null
    },
    heightCm: {
      type: Number,
      default: null
    },
    variantOptions: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    images: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

productVariantSchema.virtual('id').get(function () {
  return this._id;
});

productVariantSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

productVariantSchema.virtual('inventory', {
  ref: 'Inventory',
  localField: '_id',
  foreignField: 'variantId',
  justOne: true
});

export const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
export default ProductVariant;
