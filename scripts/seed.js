require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Product = require('../models/Product');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');

const seed = async () => {
  await connectDB();

  // Clear existing data (optional)
  await Product.deleteMany({});
  await User.deleteMany({ role: 'customer' }); // don't delete admins

  // Create sample products
  const products = [
    { name: 'Smartphone', price: 25000, stock: 10, category: 'Phones', description: 'Latest model' },
    { name: 'Laptop', price: 75000, stock: 5, category: 'Computers' },
    { name: 'Headphones', price: 3000, stock: 20, category: 'Accessories' }
  ];
  await Product.insertMany(products);

  // Create sample customer
  await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer'
  });

  // Ensure settings exist
  await SystemSettings.getSettings();

  console.log('Database seeded!');
  process.exit();
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});