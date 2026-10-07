import mongoose from 'mongoose';
import crypto from 'crypto';

export const RETURN_STATUSES = [
  'REQUESTED',
  'APPROVED',
  'REJECTED',
  'PICKUP_SCHEDULED',
  'RECEIVED_AT_WAREHOUSE',
  'INSPECTED_PASSED',
  'INSPECTED_REJECTED',
  'REFUNDED'
];

const returnRequestSchema = new mongoose.Schema(
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
    reason: {
      type: String,
      required: true
    },
    comments: {
      type: String,
      default: null
    },
    images: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    status: {
      type: String,
      enum: RETURN_STATUSES,
      default: 'REQUESTED',
      index: true
    },
    refundAmount: {
      type: Number,
      required: true
    },
    adminNote: {
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

returnRequestSchema.virtual('id').get(function () {
  return this._id;
});

returnRequestSchema.virtual('creditNote', {
  ref: 'CreditNote',
  localField: '_id',
  foreignField: 'returnRequestId',
  justOne: true
});

export const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
export default ReturnRequest;
