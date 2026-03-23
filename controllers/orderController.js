import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const taxPrice = subtotal * 0.18;
    const shippingPrice = subtotal > 500 ? 0 : 50;
    const totalPrice = subtotal + taxPrice + shippingPrice;

    const orderItems = cartItems.map((item) => ({
      product: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
    }));

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: paymentMethod === "COD" ? false : false,
    });

    // Update product stock
    for (const item of cartItems) {
      const product = await Product.findById(item._id);
      if (product) {
        product.countInStock -= item.quantity;
        await product.save();
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user", "name email");
  res.json(orders);
};


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

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product");
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify user owns this order (or is admin)
    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify user owns this order (or is admin)
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentInfo = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    };

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};