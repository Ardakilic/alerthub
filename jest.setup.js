// Jest setup file for ES modules compatibility
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
global.require = require;
