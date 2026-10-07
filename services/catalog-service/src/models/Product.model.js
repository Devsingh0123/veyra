import mongoose from 'mongoose';
import crypto from 'crypto';

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    categoryId: {
      type: String,
      ref: 'Category',
      required: true,
      index: true
    },
    brandId: {
      type: String,
      ref: 'Brand',
      default: null,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      default: null
    },
    hsnCode: {
      type: String,
      required: true,
      trim: true
    },
    gstRate: {
      type: Number,
      required: true,
      default: 18.0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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

productSchema.virtual('id').get(function () {
  return this._id;
});

productSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

productSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'productId'
});

export const Product = mongoose.model('Product', productSchema);
export default Product;
