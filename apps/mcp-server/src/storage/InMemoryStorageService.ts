/**
 * In-Memory Storage Service
 * @fileoverview Fallback storage when SQLite (better-sqlite3) is unavailable
 * This provides the same interface as DatabaseService but stores data in memory
 */

import { Logger } from "@lighthouse-tooling/shared";
import type { StoredFile } from "../services/ILighthouseService.js";
import type { Dataset } from "@lighthouse-tooling/types";

/**
 * Storage service interface that both DatabaseService and InMemoryStorageService implement
 */
export interface IStorageService {
  saveFile(file: StoredFile): void;
  getFile(cid: string): StoredFile | undefined;
  listFiles(limit?: number, offset?: number): StoredFile[];
  getFileCount(): number;
  getTotalSize(): number;
  deleteFile(cid: string): void;
  saveDataset(dataset: Dataset): void;
  getDataset(datasetId: string): Dataset | undefined;
  listDatasets(limit?: number, offset?: number): { datasets: Dataset[]; total: number };
  deleteDataset(datasetId: string, deleteFiles?: boolean): void;
  updateFilePinned(cid: string, pinned: boolean): void;
  close(): void;
  clear(): void;
}

/**
 * In-memory storage service for files and datasets
 * Used as a fallback when better-sqlite3 native module is unavailable
 */
export class InMemoryStorageService implements IStorageService {
  private files: Map<string, StoredFile> = new Map();
  private datasets: Map<string, Dataset> = new Map();
  private logger: Logger;

  constructor() {
    this.logger = Logger.getInstance({
      level: "info",
      component: "InMemoryStorageService",
    });

    this.logger.info("In-memory storage service initialized (SQLite unavailable)");
  }

  /**
   * Save or update a file record
   */
  saveFile(file: StoredFile): void {
    this.files.set(file.cid, { ...file });
  }

  /**
   * Get a file by CID
   */
  getFile(cid: string): StoredFile | undefined {
    const file = this.files.get(cid);
    return file ? { ...file } : undefined;
  }

  /**
   * List all files with optional pagination
   */
  listFiles(limit?: number, offset?: number): StoredFile[] {
    const allFiles = Array.from(this.files.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime(),
    );

    const start = offset || 0;
    const end = limit ? start + limit : undefined;

    return allFiles.slice(start, end).map((f) => ({ ...f }));
  }

  /**
   * Get total file count
   */
  getFileCount(): number {
    return this.files.size;
  }

  /**
   * Get total storage size
   */
  getTotalSize(): number {
    let total = 0;
    for (const file of this.files.values()) {
      total += file.size;
    }
    return total;
  }

  /**
   * Delete a file record
   */
  deleteFile(cid: string): void {
    this.files.delete(cid);
  }

  /**
   * Save or update a dataset
   */
  saveDataset(dataset: Dataset): void {
    this.datasets.set(dataset.id, { ...dataset });
  }

  /**
   * Get a dataset by ID
   */
  getDataset(datasetId: string): Dataset | undefined {
    const dataset = this.datasets.get(datasetId);
    return dataset ? { ...dataset } : undefined;
  }

  /**
   * List datasets with pagination
   */
  listDatasets(
    limit?: number,
    offset?: number,
  ): {
    datasets: Dataset[];
    total: number;
  } {
    const allDatasets = Array.from(this.datasets.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );

    const start = offset || 0;
    const end = limit ? start + limit : undefined;

    return {
      datasets: allDatasets.slice(start, end).map((d) => ({ ...d })),
      total: allDatasets.length,
    };
  }

  /**
   * Delete a dataset
   */
  deleteDataset(datasetId: string, deleteFiles: boolean = false): void {
    if (deleteFiles) {
      const dataset = this.datasets.get(datasetId);
      if (dataset) {
        for (const file of dataset.files) {
          this.files.delete(file.cid);
        }
      }
    }
    this.datasets.delete(datasetId);
  }

  /**
   * Update file pinned status
   */
  updateFilePinned(cid: string, pinned: boolean): void {
    const file = this.files.get(cid);
    if (file) {
      file.pinned = pinned;
    }
  }

  /**
   * Close (no-op for in-memory storage)
   */
  close(): void {
    this.logger.info("In-memory storage closed");
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.files.clear();
    this.datasets.clear();
    this.logger.info("In-memory storage cleared");
  }
}
