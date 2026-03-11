require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const dropDB = async () => {
  await connectDB();
  const answer = await new Promise(resolve => {
    readline.question('Are you sure you want to drop the entire database? (yes/no) ', resolve);
  });
  if (answer.toLowerCase() !== 'yes') {
    console.log('Aborted.');
    process.exit();
  }

  await mongoose.connection.dropDatabase();
  console.log('Database dropped.');
  process.exit();
};

dropDB().catch(err => {
  console.error(err);
  process.exit(1);
});