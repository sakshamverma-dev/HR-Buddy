const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB.');
    });
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err.message);
    });
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from DB. Trying to reconnect...');
    });

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
  }
};

module.exports = connectDB;
