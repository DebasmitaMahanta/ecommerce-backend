import express from "express";
import multer from "multer";
import path from "path";
import {
  addProduct,
  getProducts,
  getCategories,
  getProductById,
  deleteProduct,
  updateProduct
} from "../controllers/productController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(path.resolve(), "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const validExtensions = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mimeOk = validExtensions.test(file.mimetype);
    const extOk = validExtensions.test(ext);
    if (mimeOk && extOk) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif)."));
    }
  }
});

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);
router.post("/", protect, admin, upload.single("image"), addProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.put("/:id", protect, admin, upload.single("image"), updateProduct);

export default router;