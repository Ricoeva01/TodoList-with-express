import { open } from "sqlite";
import sqlite3 from "sqlite3";

let dbInstance = null;

export async function initDB() {
  dbInstance = await open({
    filename: "db/database.db",
    driver: sqlite3.Database,
  });
  // 1. Creer une Table (s'il existe on ne fait rien)
  await dbInstance.exec(`
CREATE TABLE IF NOT EXISTS todos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    text        TEXT NOT NULL,
    completed   BOOLEAN NOT NULL DEFAULT 0,
    createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);`);
}

export async function getDB() {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initDB() first.");
  }
  return dbInstance;
}
