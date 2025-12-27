// Server logging utility
export const logger = {
  info: (message, data = null) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || "");
  },
  error: (message, error = null) => {
    console.error(
      `[ERROR] ${new Date().toISOString()} - ${message}`,
      error || ""
    );
  },
  warn: (message, data = null) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || "");
  },
  debug: (message, data = null) => {
    if (process.env.DEBUG) {
      console.log(
        `[DEBUG] ${new Date().toISOString()} - ${message}`,
        data || ""
      );
    }
  },
};
