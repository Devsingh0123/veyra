import mongoose from 'mongoose';
import crypto from 'crypto';

const refundSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    paymentIntentId: {
      type: String,
      ref: 'PaymentIntent',
      required: true,
      index: true
    },
    razorpayRefundId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    amountPaise: {
      type: String,
      required: true
    },
    reason: {
      type: String,
      default: null
    },
    status: {
      type: String,
      default: 'REFUNDED'
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

refundSchema.virtual('id').get(function () {
  return this._id;
});

export const Refund = mongoose.model('Refund', refundSchema);
export default Refund;
