import mongoose from 'mongoose';
import crypto from 'crypto';

const inventorySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    variantId: {
      type: String,
      ref: 'ProductVariant',
      required: true,
      unique: true,
      index: true
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0
    },
    reservedQuantity: {
      type: Number,
      required: true,
      default: 0
    },
    version: {
      type: Number,
      required: true,
      default: 1
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

inventorySchema.virtual('id').get(function () {
  return this._id;
});

inventorySchema.virtual('availableQuantity').get(function () {
  return Math.max(0, (this.stockQuantity || 0) - (this.reservedQuantity || 0));
});

export const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;
