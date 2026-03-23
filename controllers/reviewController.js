import Review from "../models/Review.js";
import Product from "../models/Product.js";

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const existingReview = await Review.findOne({
      product: productId,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      name: req.user.name,
      rating,
      comment,
    });

    const product = await Product.findById(productId);
    const allReviews = await Review.find({ product: productId });
    
    product.numReviews = allReviews.length;
    product.rating =
      allReviews.reduce((sum, review) => sum + review.rating, 0) /
      allReviews.length;
    product.reviews.push(review._id);

    await product.save();

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    const product = await Product.findById(review.product);
    product.reviews = product.reviews.filter(
      (id) => id.toString() !== review._id.toString()
    );

    const remainingReviews = await Review.find({ product: review.product });
    product.numReviews = remainingReviews.length;
    product.rating =
      remainingReviews.length > 0
        ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / remainingReviews.length
        : 0;

    await product.save();
    await Review.findByIdAndDelete(req.params.id);

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
