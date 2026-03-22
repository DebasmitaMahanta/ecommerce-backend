import express from "express";
import {
  addProduct,
  getProducts,
  getProductById,
  deleteProduct
} from "../controllers/productController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, admin, addProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;