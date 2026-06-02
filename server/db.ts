/**
 * Conexão com banco de dados local (MySQL)
 * Usa Drizzle ORM para queries type-safe
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

const DATABASE_URL = process.env.DATABASE_URL!;

let db: any;

export async function initializeDb() {
  const pool = mysql.createPool(DATABASE_URL);
  db = drizzle(pool, { schema, mode: 'default' });
  console.log('[DB] Conexão inicializada');
  return db;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDb() first.');
  }
  return db;
}

export { db };
