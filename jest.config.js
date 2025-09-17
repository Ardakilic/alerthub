export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transform: {},
  testTimeout: 15000, // Increase timeout to 15 seconds
  maxWorkers: 1, // Run tests sequentially to avoid conflicts
  forceExit: true, // Force exit after tests complete
  detectOpenHandles: true, // Help identify hanging async operations
  testPathIgnorePatterns: ["/node_modules/"],
  collectCoverageFrom: ["src/**/*.js", "!src/index.js", "!**/node_modules/**"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  testMatch: ["**/__tests__/**/*.js", "**/?(*.)+(spec|test).js"],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
};
