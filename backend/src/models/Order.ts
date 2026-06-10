import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem {
  menuItemId: Types.ObjectId;
  slug: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IDeliveryAddress {
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface IStatusHistoryEntry {
  status: string;
  timestamp: Date;
  note?: string;
}

export interface IPayment {
  method: 'stripe';
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: number;
  paidAt?: Date;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'picked_up'
  | 'cancelled';

export interface IOrder extends Document {
  orderNumber: string;
  userId: Types.ObjectId;
  supabaseUserId: string;
  items: IOrderItem[];
  type: 'delivery' | 'pickup';
  deliveryAddress?: IDeliveryAddress;
  status: OrderStatus;
  statusHistory: IStatusHistoryEntry[];
  payment: IPayment;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string;
  estimatedReadyTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const deliveryAddressSchema = new Schema<IDeliveryAddress>(
  {
    address: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    note: { type: String },
  },
  { _id: false }
);

const paymentSchema = new Schema<IPayment>(
  {
    method: { type: String, enum: ['stripe'], required: true },
    stripeSessionId: { type: String, required: true },
    stripePaymentIntentId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    amount: { type: Number, required: true },
    paidAt: { type: Date },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    supabaseUserId: {
      type: String,
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    type: {
      type: String,
      enum: ['delivery', 'pickup'],
      required: true,
    },
    deliveryAddress: {
      type: deliveryAddressSchema,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'delivered',
        'picked_up',
        'cancelled',
      ],
      default: 'pending',
      index: true,
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: [],
    },
    payment: {
      type: paymentSchema,
      required: true,
    },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },
    notes: { type: String, trim: true },
    estimatedReadyTime: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user order lookups
orderSchema.index({ supabaseUserId: 1, createdAt: -1 });
// Index for admin order filtering
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
