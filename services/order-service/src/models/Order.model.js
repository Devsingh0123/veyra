import mongoose from 'mongoose';
import crypto from 'crypto';

export const ORDER_STATUSES = [
  'PENDING',
  'PAYMENT_PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RTO_INITIATED',
  'RTO_DELIVERED',
  'RETURN_REQUESTED',
  'RETURN_RECEIVED',
  'REFUNDED'
];

export const PAYMENT_METHODS = ['PREPAID', 'COD'];
export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const orderItemSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    orderId: {
      type: String
    },
    productId: {
      type: String,
      default: null
    },
    variantId: {
      type: String,
      required: true
    },
    productTitle: {
      type: String,
      required: true
    },
    variantTitle: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    hsnCode: {
      type: String,
      default: '00000000'
    },
    unitPrice: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    taxRate: {
      type: Number,
      required: true,
      default: 18.0
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true
    },
    itemAttributes: {
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

orderItemSchema.virtual('id').get(function () {
  return this._id;
});

const orderHistorySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    orderId: {
      type: String
    },
    fromState: {
      type: String,
      enum: ORDER_STATUSES,
      required: true
    },
    toState: {
      type: String,
      enum: ORDER_STATUSES,
      required: true
    },
    note: {
      type: String,
      default: null
    },
    actorRole: {
      type: String,
      default: 'SYSTEM'
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

orderHistorySchema.virtual('id').get(function () {
  return this._id;
});

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'PENDING',
      index: true
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHODS,
      default: 'PREPAID'
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: 'PENDING',
      index: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    codFee: {
      type: Number,
      default: 0
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0
    },
    cgstAmount: {
      type: Number,
      default: 0
    },
    sgstAmount: {
      type: Number,
      default: 0
    },
    igstAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    },
    couponCode: {
      type: String,
      default: null
    },
    shippingAddress: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    billingAddress: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    cancellationReason: {
      type: String,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    items: [orderItemSchema],
    history: [orderHistorySchema]
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

orderSchema.virtual('id').get(function () {
  return this._id;
});

orderSchema.virtual('invoice', {
  ref: 'TaxInvoice',
  localField: '_id',
  foreignField: 'orderId',
  justOne: true
});

orderSchema.virtual('shipment', {
  ref: 'Shipment',
  localField: '_id',
  foreignField: 'orderId',
  justOne: true
});

orderSchema.virtual('returns', {
  ref: 'ReturnRequest',
  localField: '_id',
  foreignField: 'orderId'
});

export const Order = mongoose.model('Order', orderSchema);
export default Order;
