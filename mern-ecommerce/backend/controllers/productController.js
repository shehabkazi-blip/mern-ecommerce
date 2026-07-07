const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products (supports search, category filter, price range, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  const filter = { isActive: true };

  if (req.query.keyword) {
    filter.$text = { $search: req.query.keyword };
  }
  if (req.query.category) {
    filter.category = req.query.category;
  }
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  let sort = { createdAt: -1 };
  if (req.query.sort === 'price_asc') sort = { price: 1 };
  if (req.query.sort === 'price_desc') sort = { price: -1 };
  if (req.query.sort === 'rating') sort = { rating: -1 };

  const count = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sort)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get single product by id or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
  const product = await Product.findOne(query).populate('reviews.user', 'name');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json({ success: true, product });
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, brand, category, images, price, discountPrice, countInStock, sku, isFeatured } = req.body;

  if (!name || !description || !category || !images || !images.length || price == null) {
    res.status(400);
    throw new Error('Please provide name, description, category, at least one image, and price');
  }

  const product = await Product.create({
    name,
    description,
    brand,
    category,
    images,
    price,
    discountPrice,
    countInStock,
    sku,
    isFeatured,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const fields = ['name', 'description', 'brand', 'category', 'images', 'price', 'discountPrice', 'countInStock', 'sku', 'isFeatured', 'isActive'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  const updated = await product.save();
  res.json({ success: true, product: updated });
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product removed' });
});

// @desc    Add a review to a product
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: Number(rating), comment });
  product.recalculateRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added' });
});

// @desc    Get distinct categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ success: true, categories });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getCategories,
};
