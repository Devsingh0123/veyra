import mongoose from 'mongoose';
import crypto from 'crypto';

const creditNoteSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    returnRequestId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    creditNoteNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    originalInvoiceNo: {
      type: String,
      required: true
    },
    totalRefundGst: {
      type: Number,
      required: true
    },
    totalRefundValue: {
      type: Number,
      required: true
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

creditNoteSchema.virtual('id').get(function () {
  return this._id;
});

export const CreditNote = mongoose.model('CreditNote', creditNoteSchema);
export default CreditNote;
