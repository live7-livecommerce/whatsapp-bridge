/**
 * Conexão com banco de dados local (MySQL)
 * Usa Drizzle ORM para queries type-safe
 */

import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema';

let db: any;
let initialized = false;

export async function initializeDb() {
  if (initialized) {
    return db;
  }

  try {
    console.log('[DB] Variáveis de ambiente disponíveis:');
    console.log('[DB] DATABASE_URL:', process.env.DATABASE_URL ? 'CONFIGURADA' : 'NÃO CONFIGURADA');
    console.log('[DB] NODE_ENV:', process.env.NODE_ENV);
    
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
      throw new Error(
        'DATABASE_URL não está configurada! ' +
        'Verifique as variáveis de ambiente no Railway.'
      );
    }

    console.log('[DB] Conectando ao banco de dados...');
    console.log('[DB] URL:', DATABASE_URL.substring(0, 50) + '...');
    
    const pool = mysql.createPool({
      uri: DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    
    db = drizzle(pool, { schema, mode: 'default' });
    initialized = true;
    
    console.log('[DB] Conexão inicializada com sucesso');
    return db;
  } catch (error: any) {
    console.error('[DB] Erro ao conectar:', error.message);
    console.error('[DB] Stack:', error.stack);
    throw error;
  }
}

export function getDb() {
  if (!db || !initialized) {
    throw new Error('Database not initialized. Call initializeDb() first.');
  }
  return db;
}

export { db };
