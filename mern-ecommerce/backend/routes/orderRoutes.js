const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderToPaid,
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(protect, createOrder).get(protect, authorizeRoles('admin'), getAllOrders);
router.get('/mine', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);
router.put('/:id/status', protect, authorizeRoles('admin'), updateOrderStatus);

module.exports = router;
