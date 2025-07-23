// Mock HealthRecord model for tests
// Note: This is a placeholder since the actual app uses PostgreSQL directly

const HealthRecord = {
  // Mock methods that tests expect
  deleteMany: async (query) => {
    // Mock implementation - in real tests this should clean test database
    return Promise.resolve();
  },
  
  insertMany: async (records) => {
    // Mock implementation - in real tests this should query test database
    return Promise.resolve([]);
  }
};

module.exports = HealthRecord;
