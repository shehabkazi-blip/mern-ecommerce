const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

const SHIPPING_FLAT_RATE = 5.99;
const FREE_SHIPPING_THRESHOLD = 75;
const TAX_RATE = 0.08;

// @desc    Create a new order (validates stock, decrements it)
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }

  // Re-fetch products server-side so prices/stock can't be spoofed by the client
  const detailedItems = [];
  let itemsPrice = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.countInStock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}. Only ${product.countInStock} left.`);
    }

    const price = product.discountPrice || product.price;
    itemsPrice += price * item.quantity;

    detailedItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price,
      quantity: item.quantity,
    });
  }

  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const taxPrice = Math.round(itemsPrice * TAX_RATE * 100) / 100;
  const totalPrice = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

  const order = await Order.create({
    user: req.user._id,
    orderItems: detailedItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'cash_on_delivery',
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  // Decrement stock
  for (const item of detailedItems) {
    await Product.updateOne({ _id: item.product }, { $inc: { countInStock: -item.quantity } });
  }

  res.status(201).json({ success: true, order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/mine
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, orders });
});

// @desc    Get single order by id (owner or admin only)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.limit) || 20;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const count = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ success: true, orders, page, pages: Math.ceil(count / pageSize), total: count });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (status === 'delivered') order.deliveredAt = Date.now();

  const updated = await order.save();
  res.json({ success: true, order: updated });
});

// @desc    Mark order as paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  order.paymentResult = {
    id: req.body.id,
    status: req.body.status,
    updateTime: req.body.updateTime,
    email: req.body.email,
  };

  const updated = await order.save();
  res.json({ success: true, order: updated });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderToPaid,
};
