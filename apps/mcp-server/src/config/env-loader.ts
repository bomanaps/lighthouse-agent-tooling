/**
 * Environment Variable Loader
 * Loads and validates environment variables for server configuration
 */

import { config as loadDotenv } from "dotenv";

/**
 * Environment variable schema
 */
export interface EnvConfig {
  // Server
  SERVER_NAME?: string;
  SERVER_VERSION?: string;

  // Logging
  LOG_LEVEL?: "debug" | "info" | "warn" | "error";
  LOG_TO_FILE?: string;
  LOG_FILE_PATH?: string;

  // Storage
  MAX_STORAGE_SIZE?: string;

  // Performance
  ENABLE_METRICS?: string;
  METRICS_INTERVAL?: string;

  // Optional
  DEBUG_MODE?: string;
  MAX_CONCURRENT_OPS?: string;
  OPERATION_TIMEOUT?: string;

  // Future SDK integration
  LIGHTHOUSE_API_KEY?: string;
  KAVACH_ENDPOINT?: string;
  USE_REAL_SDK?: string;
}

/**
 * Server configuration interface (subset for env loading)
 */
export interface ServerConfig {
  name?: string;
  version?: string;
  logLevel?: "debug" | "info" | "warn" | "error";
  maxStorageSize?: number;
  enableMetrics?: boolean;
  metricsInterval?: number;
}

export class EnvLoader {
  /**
   * Load environment variables from .env file
   */
  static load(envPath?: string): void {
    const result = loadDotenv({ path: envPath });

    if (result.error) {
      // .env file not found is OK, we'll use defaults
      if (result.error.message.includes("ENOENT")) {
        return;
      }
      throw result.error;
    }
  }

  /**
   * Parse environment variables into ServerConfig
   */
  static parseConfig(): Partial<ServerConfig> {
    const env = process.env as EnvConfig;
    const config: Partial<ServerConfig> = {};

    // Server configuration
    if (env.SERVER_NAME) {
      config.name = env.SERVER_NAME;
    }

    if (env.SERVER_VERSION) {
      config.version = env.SERVER_VERSION;
    }

    // Logging configuration
    if (env.LOG_LEVEL) {
      const validLevels = ["debug", "info", "warn", "error"];
      if (validLevels.includes(env.LOG_LEVEL)) {
        config.logLevel = env.LOG_LEVEL as any;
      } else {
        process.stderr.write(
          `Warning: Invalid LOG_LEVEL: ${env.LOG_LEVEL}. Using default 'info'.\n`,
        );
      }
    }

    // Storage configuration
    if (env.MAX_STORAGE_SIZE) {
      const size = parseInt(env.MAX_STORAGE_SIZE, 10);
      if (!isNaN(size) && size > 0) {
        config.maxStorageSize = size;
      } else {
        process.stderr.write(
          `Warning: Invalid MAX_STORAGE_SIZE: ${env.MAX_STORAGE_SIZE}. Using default.\n`,
        );
      }
    }

    // Performance configuration
    if (env.ENABLE_METRICS !== undefined) {
      config.enableMetrics = env.ENABLE_METRICS.toLowerCase() === "true";
    }

    if (env.METRICS_INTERVAL) {
      const interval = parseInt(env.METRICS_INTERVAL, 10);
      if (!isNaN(interval) && interval > 0) {
        config.metricsInterval = interval;
      } else {
        process.stderr.write(
          `Warning: Invalid METRICS_INTERVAL: ${env.METRICS_INTERVAL}. Using default.\n`,
        );
      }
    }

    return config;
  }

  /**
   * Load and parse configuration from environment
   */
  static loadConfig(envPath?: string): Partial<ServerConfig> {
    this.load(envPath);
    return this.parseConfig();
  }

  /**
   * Get environment variable with fallback
   */
  static get(key: string, defaultValue?: string): string | undefined {
    return process.env[key] || defaultValue;
  }

  /**
   * Get boolean environment variable
   */
  static getBoolean(key: string, defaultValue = false): boolean {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === "true";
  }

  /**
   * Get number environment variable
   */
  static getNumber(key: string, defaultValue?: number): number | undefined {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  /**
   * Validate required environment variables
   */
  static validateRequired(requiredVars: string[]): void {
    const missing = requiredVars.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}\n` +
          `Please check your .env file or set these variables.`,
      );
    }
  }

  /**
   * Display current configuration (for debugging)
   * Uses stderr to avoid corrupting MCP stdio protocol on stdout
   */
  static displayConfig(config: Partial<ServerConfig>): void {
    const lines = [
      "\nServer Configuration:",
      `  Name: ${config.name || "default"}`,
      `  Version: ${config.version || "default"}`,
      `  Log Level: ${config.logLevel || "default"}`,
      `  Max Storage: ${config.maxStorageSize ? `${(config.maxStorageSize / 1024 / 1024).toFixed(2)} MB` : "default"}`,
      `  Metrics: ${config.enableMetrics !== undefined ? config.enableMetrics : "default"}`,
      `  Metrics Interval: ${config.metricsInterval ? `${config.metricsInterval / 1000}s` : "default"}`,
      "",
    ];
    process.stderr.write(lines.join("\n") + "\n");
  }
}
