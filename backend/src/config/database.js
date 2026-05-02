const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.USE_MOCK_DATA === 'true') {
    console.log('Mock data mode enabled for local development. Skipping MongoDB connection.');
    return null;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.env.USE_MOCK_DATA = 'true';
    console.log('Mock data mode enabled for local development.');
    return null;
  }
};

module.exports = connectDB;
