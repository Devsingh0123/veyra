import mongoose from 'mongoose';
import crypto from 'crypto';

const shipmentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    carrier: {
      type: String,
      default: 'MOCK'
    },
    awbNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    labelUrl: {
      type: String,
      default: null
    },
    manifestUrl: {
      type: String,
      default: null
    },
    billableWeightG: {
      type: Number,
      required: true
    },
    ewayBillNumber: {
      type: String,
      default: null
    },
    currentStatus: {
      type: String,
      default: 'MANIFESTED',
      index: true
    },
    trackingHistory: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    dispatchedAt: {
      type: Date,
      default: null
    },
    deliveredAt: {
      type: Date,
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

shipmentSchema.virtual('id').get(function () {
  return this._id;
});

export const Shipment = mongoose.model('Shipment', shipmentSchema);
export default Shipment;
