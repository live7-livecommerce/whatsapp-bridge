/**
 * Conexão com banco de dados local (MySQL)
 * Usa Drizzle ORM para queries type-safe
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL não está configurada!');
}

let db: any;

export async function initializeDb() {
  try {
    console.log('[DB] Conectando ao banco de dados...');
    
    const pool = mysql.createPool({
      uri: DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    
    db = drizzle(pool, { schema, mode: 'default' });
    console.log('[DB] Conexão inicializada com sucesso');
    return db;
  } catch (error: any) {
    console.error('[DB] Erro ao conectar:', error.message);
    throw error;
  }
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDb() first.');
  }
  return db;
}

export { db };
