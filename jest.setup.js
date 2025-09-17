// Jest setup file for ES modules compatibility
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.require = require;
