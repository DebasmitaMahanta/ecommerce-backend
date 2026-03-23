import express from "express";
import { registerUser, loginUser, registerAdmin } from "../controllers/authController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/register-admin", protect, admin, registerAdmin);
router.post("/login", loginUser);

// Development route to make user admin (remove in production)
router.put("/make-admin/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.role = "admin";
      user.isAdmin = true;
      await user.save();
      res.json({ message: "User made admin" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;