// Jest setup file for ES modules compatibility
import { createRequire } from "node:module";
import { jest } from "@jest/globals";

const require = createRequire(import.meta.url);
global.require = require;

// Global mocking for network requests to prevent CI issues
global.fetch = jest.fn(() =>
  Promise.reject(new Error('Network requests are disabled in tests'))
);

// Prevent any real HTTP requests in tests
const originalSetInterval = global.setInterval;
global.setInterval = jest.fn((callback, delay) => {
  // Only allow very short intervals (likely for immediate mocking)
  if (delay < 100) {
    return originalSetInterval(callback, delay);
  }
  // For longer intervals (RSS monitoring), return a fake timer ID
  return 'mocked-interval-id';
});

// Mock clearInterval to handle our fake timer IDs
const originalClearInterval = global.clearInterval;
global.clearInterval = jest.fn((id) => {
  if (id === 'mocked-interval-id') {
    return; // Do nothing for our mocked intervals
  }
  return originalClearInterval(id);
});

// Add process exit handler to clean up any hanging operations
process.on('beforeExit', () => {
  // Force cleanup of any remaining timers
  jest.clearAllTimers();
});
