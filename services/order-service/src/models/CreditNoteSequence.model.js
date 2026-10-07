import mongoose from 'mongoose';
import crypto from 'crypto';

const creditNoteSequenceSchema = new mongoose.Schema(
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

creditNoteSequenceSchema.virtual('id').get(function () {
  return this._id;
});

export const CreditNoteSequence = mongoose.model('CreditNoteSequence', creditNoteSequenceSchema);
export default CreditNoteSequence;
