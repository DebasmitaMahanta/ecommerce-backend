import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  orderItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      name: String,
      price: Number,
      image: String,
      quantity: {
        type: Number,
        required: true
      }
    }
  ],
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    default: "COD",
    enum: ["COD", "Card", "UPI", "Razorpay"]
  },
  paymentInfo: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  },
  subtotal: Number,
  taxPrice: Number,
  shippingPrice: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: Date,
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);