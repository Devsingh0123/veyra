import mongoose from 'mongoose';
import crypto from 'crypto';

export const PAYMENT_STATUSES = [
  'CREATED',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'REFUNDED'
];

const paymentIntentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    orderId: {
      type: String,
      required: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      index: true
    },
    amountPaise: {
      type: String, // String to handle large BigInt amounts safely
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'CREATED',
      index: true
    },
    method: {
      type: String,
      default: null
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

paymentIntentSchema.virtual('id').get(function () {
  return this._id;
});

paymentIntentSchema.virtual('refunds', {
  ref: 'Refund',
  localField: '_id',
  foreignField: 'paymentIntentId'
});

export const PaymentIntent = mongoose.model('PaymentIntent', paymentIntentSchema);
export default PaymentIntent;
