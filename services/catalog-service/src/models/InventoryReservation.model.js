import mongoose from 'mongoose';
import crypto from 'crypto';

export const RESERVATION_STATUS = ['ACTIVE', 'FULFILLED', 'RELEASED', 'EXPIRED'];

const inventoryReservationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    reservationToken: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    variantId: {
      type: String,
      ref: 'ProductVariant',
      required: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: RESERVATION_STATUS,
      default: 'ACTIVE',
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
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

inventoryReservationSchema.virtual('id').get(function () {
  return this._id;
});

export const InventoryReservation = mongoose.model('InventoryReservation', inventoryReservationSchema);
export default InventoryReservation;
