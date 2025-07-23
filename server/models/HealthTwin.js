// Mock HealthTwin model for tests
// Note: This is a placeholder since the actual app uses PostgreSQL directly

const HealthTwin = {
  // Mock methods that tests expect
  deleteMany: async (query) => {
    // Mock implementation - in real tests this should clean test database
    return Promise.resolve();
  },
  
  create: async (twinData) => {
    // Mock implementation - in real tests this should create health twin in test database
    return Promise.resolve({
      id: 1,
      ...twinData
    });
  },
  
  findOne: async (query) => {
    // Mock implementation - in real tests this should query test database
    return Promise.resolve(null);
  },
  
  updateOne: async () => {
    // Mock implementation - in real tests this should update health twin in test database
    return Promise.resolve();
  }
};

module.exports = HealthTwin;
