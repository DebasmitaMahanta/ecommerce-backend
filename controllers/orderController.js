import Order from "../models/Order.js";
import Cart from "../models/Cart.js";

// Place Order (Checkout)
export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.quantity * 100, // demo price
      0
    );

    const order = await Order.create({
      user: req.user._id,
      orderItems: cart.items,
      shippingAddress,
      paymentMethod,
      totalPrice
    });

    // Clear Cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get My Orders
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

// Get All Orders (Admin)
export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "name email");
  res.json(orders);
};

// Update Order Status
export const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      await order.save();
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};