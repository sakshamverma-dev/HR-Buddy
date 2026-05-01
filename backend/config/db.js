const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4, // Force IPv4
      serverSelectionTimeoutMS: 15000, // 15 seconds
    });
    
    isConnected = conn.connections[0].readyState === 1;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('Stack:', error.stack);
    // Don't exit process in serverless
    if (process.env.NODE_ENV !== 'production') {
        process.exit(1);
    }
  }
};

module.exports = connectDB;
