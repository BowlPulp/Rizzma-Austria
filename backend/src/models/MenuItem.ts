import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  slug: string;
  category: 'pizza' | 'burgers' | 'salads';
  price: number;
  image: string;
  popular: boolean;
  spicy: boolean;
  vegetarian: boolean;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['pizza', 'burgers', 'salads'],
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    spicy: {
      type: Boolean,
      default: false,
    },
    vegetarian: {
      type: Boolean,
      default: false,
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const MenuItem = mongoose.model<IMenuItem>('MenuItem', menuItemSchema);

export default MenuItem;
