// Run with: npm run seed        -> seeds an admin user + sample products
//           npm run seed:destroy -> wipes Users, Products, Orders collections
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const sampleProducts = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description: 'Over-ear headphones with active noise cancellation and 30-hour battery life.',
    brand: 'AudioMax',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
    price: 129.99,
    countInStock: 25,
    isFeatured: true,
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Double-wall insulated bottle that keeps drinks cold for 24 hours or hot for 12.',
    brand: 'HydroFlow',
    category: 'Home & Kitchen',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8'],
    price: 24.5,
    countInStock: 60,
    isFeatured: true,
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight breathable running shoes with responsive cushioning.',
    brand: 'StrideX',
    category: 'Footwear',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'],
    price: 79.99,
    countInStock: 40,
  },
  {
    name: 'Mechanical Keyboard',
    description: 'Hot-swappable mechanical keyboard with RGB backlighting.',
    brand: 'KeyForge',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef'],
    price: 89.0,
    countInStock: 15,
    isFeatured: true,
  },
  {
    name: 'Ceramic Coffee Mug Set (4-pack)',
    description: 'Set of four 12oz ceramic mugs, microwave and dishwasher safe.',
    brand: 'HomeCraft',
    category: 'Home & Kitchen',
    images: ['https://images.unsplash.com/photo-1571945153237-4929e783af4a'],
    price: 32.0,
    countInStock: 50,
  },
];

const importData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const admin = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'admin',
    });

    await Product.insertMany(sampleProducts);

    console.log('Data imported successfully!');
    console.log(`Admin login -> email: ${admin.email} / password: ${process.env.ADMIN_PASSWORD || 'ChangeMe123!'}`);
    process.exit();
  } catch (error) {
    console.error(`Error importing data: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    console.log('Data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
