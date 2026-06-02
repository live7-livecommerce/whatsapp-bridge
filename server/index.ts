/**
 * WhatsApp Bridge — Microserviço de integração WhatsApp → Core CRM
 * 
 * Recebe webhooks da Meta WhatsApp Cloud API
 * Registra leads automaticamente no Core CRM
 * 
 * Código 100% portável — sem dependências do Manus
 */

import 'dotenv/config';
import express from 'express';
import webhookRouter from './routes/webhook';
import { initializeDb } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

// IMPORTANTE: express.json() ANTES das rotas (necessário para validação de assinatura)
app.use(express.json());

// Rotas
app.use('/', webhookRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'whatsapp-bridge',
    timestamp: new Date().toISOString(),
  });
});

// Iniciar servidor
async function start() {
  try {
    // Inicializar banco de dados
    await initializeDb();
    
    app.listen(PORT, () => {
      console.log(`[WhatsApp Bridge] Servidor rodando na porta ${PORT}`);
      console.log(`[WhatsApp Bridge] Webhook URL: https://whatsapp.catarinosfull.com/webhook`);
    });
  } catch (error: any) {
    console.error('[WhatsApp Bridge] Erro ao iniciar:', error.message);
    process.exit(1);
  }
}

start();
