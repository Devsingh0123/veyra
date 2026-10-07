import mongoose from 'mongoose';
import crypto from 'crypto';

export const USER_ROLES = [
  'CUSTOMER',
  'WAREHOUSE_STAFF',
  'CATALOG_MANAGER',
  'ADMIN',
  'SUPER_ADMIN'
];

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => crypto.randomUUID()
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null
    },
    passwordHash: {
      type: String,
      default: null
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'CUSTOMER'
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
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

userSchema.virtual('id').get(function () {
  return this._id;
});

export const User = mongoose.model('User', userSchema);
export default User;
