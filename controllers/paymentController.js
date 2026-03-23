import Razorpay from "razorpay";
import Order from "../models/Order.js";
import crypto from "crypto";

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const razorpay = getRazorpayInstance();
    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay configuration is missing" });
    }

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    res.json({ message: "Payment verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
