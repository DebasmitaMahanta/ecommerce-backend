import express from "express";
import {
  placeOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder
} from "../controllers/orderController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, admin, getAllOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id/payment", protect, updateOrderPayment);
router.put("/:id/deliver", protect, admin, updateOrderStatus);
router.delete("/:id", protect, admin, deleteOrder);

export default router;