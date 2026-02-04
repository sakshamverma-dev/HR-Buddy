const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4, // Force IPv4
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('Stack:', error.stack);
    // process.exit(1);
  }
};

module.exports = connectDB;
