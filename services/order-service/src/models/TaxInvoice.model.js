import mongoose from 'mongoose';
import crypto from 'crypto';

const taxInvoiceSchema = new mongoose.Schema(
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
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    financialYear: {
      type: String,
      required: true,
      index: true
    },
    invoiceDate: {
      type: Date,
      default: Date.now
    },
    taxableAmount: {
      type: Number,
      required: true
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
      required: true
    },
    pdfUrl: {
      type: String,
      default: null
    },
    sellerGstin: {
      type: String,
      default: '07AABCV1234F1Z5'
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

taxInvoiceSchema.virtual('id').get(function () {
  return this._id;
});

export const TaxInvoice = mongoose.model('TaxInvoice', taxInvoiceSchema);
export default TaxInvoice;
