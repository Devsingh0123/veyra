import mongoose from 'mongoose';
import crypto from 'crypto';

const invoiceSequenceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    financialYear: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    currentNumber: {
      type: Number,
      default: 0
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

invoiceSequenceSchema.virtual('id').get(function () {
  return this._id;
});

export const InvoiceSequence = mongoose.model('InvoiceSequence', invoiceSequenceSchema);
export default InvoiceSequence;
