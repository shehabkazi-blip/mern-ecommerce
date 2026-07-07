const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getCategories,
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/categories', getCategories);
router.route('/').get(getProducts).post(protect, authorizeRoles('admin'), createProduct);
router
  .route('/:id')
  .get(getProductById)
  .put(protect, authorizeRoles('admin'), updateProduct)
  .delete(protect, authorizeRoles('admin'), deleteProduct);
router.post('/:id/reviews', protect, createProductReview);

module.exports = router;
