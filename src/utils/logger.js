import pino from "pino";

// Get log level from environment or default to 'info'
const logLevel = process.env.LOG_LEVEL || "info";

// Create the logger instance
const logger = pino({
  level: logLevel,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l",
      ignore: "pid,hostname",
    },
  },
});

export default logger;
