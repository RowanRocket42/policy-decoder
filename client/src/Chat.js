const mongoose = require('mongoose');

// Alternative connection string with URL-encoded special characters
const uri = "mongodb+srv://rowan-fonda:u%23cT65h*i%40j5_8b@policy-decoder.g2j77.mongodb.net/?retryWrites=true&w=majority";

console.log('Attempting to connect to MongoDB with alternative string...');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB');
    console.error('Error:', err.message);
    process.exit(1);
  });