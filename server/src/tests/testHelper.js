const mongoose = require('mongoose');

// Connect to test database before all tests
const connectTestDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};

// Clear all collections between tests
const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// Disconnect after all tests
const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

module.exports = { connectTestDB, clearTestDB, disconnectTestDB };