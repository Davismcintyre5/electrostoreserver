require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const User = require('../models/User');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (query) => new Promise(resolve => readline.question(query, resolve));

const createAdmin = async () => {
  await connectDB();

  const name = await prompt('Enter admin name: ');
  const email = await prompt('Enter admin email: ');
  const password = await prompt('Enter admin password: ');

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('User with that email already exists.');
    process.exit(1);
  }

  await User.create({
    name,
    email,
    password,
    role: 'admin',
    mustChangePassword: false
  });

  console.log('Admin created successfully!');
  process.exit();
};

createAdmin().catch(err => {
  console.error(err);
  process.exit(1);
});