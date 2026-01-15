/**
 * Storage Factory
 * @fileoverview Creates the appropriate storage service based on availability
 * Tries SQLite (DatabaseService) first, falls back to InMemoryStorageService
 */

import { Logger } from "@lighthouse-tooling/shared";
import { IStorageService, InMemoryStorageService } from "./InMemoryStorageService.js";

const logger = Logger.getInstance({
  level: "info",
  component: "StorageFactory",
});

/**
 * Create a storage service instance
 * Tries to use SQLite (DatabaseService) first, falls back to in-memory storage
 * if the native better-sqlite3 module is unavailable
 */
export async function createStorageService(dbPath?: string): Promise<IStorageService> {
  try {
    // Dynamically import DatabaseService to handle the case where better-sqlite3 fails to load
    const { DatabaseService } = await import("./DatabaseService.js");
    const service = new DatabaseService({ dbPath });
    logger.info("Using SQLite database storage");
    return service;
  } catch (error) {
    // Log the error but don't crash - fall back to in-memory storage
    logger.warn("SQLite (better-sqlite3) unavailable, using in-memory storage", {
      error: error instanceof Error ? error.message : String(error),
    });
    return new InMemoryStorageService();
  }
}

/**
 * Synchronous version that only uses in-memory storage
 * Use this when you need immediate storage without async initialization
 */
export function createInMemoryStorageService(): IStorageService {
  return new InMemoryStorageService();
}
