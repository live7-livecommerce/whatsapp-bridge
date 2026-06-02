import { mysqlTable, int, varchar, text, boolean, timestamp, bigint } from 'drizzle-orm/mysql-core';

// ============================================================
// TABELA: whatsapp_messages_log
// Registro de TODAS as mensagens recebidas (auditoria + reprocessamento)
// NÃO é fonte de verdade — o Core CRM é.
// ============================================================
export const whatsappMessagesLog = mysqlTable('whatsapp_messages_log', {
  id: int('id').primaryKey().autoincrement(),
  // Identificação da mensagem
  waMessageId: varchar('wa_message_id', { length: 200 }).notNull().unique(), // ID único da Meta (idempotência)
  // Dados do remetente
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),  // telefone do cliente
  contactName: varchar('contact_name', { length: 200 }),            // nome do perfil WhatsApp
  // Conteúdo
  messageType: varchar('message_type', { length: 20 }).notNull(),   // text, image, audio, video, document, location
  messageBody: text('message_body'),                                 // texto da mensagem (ou caption de mídia)
  mediaUrl: varchar('media_url', { length: 500 }),                   // URL da mídia (se aplicável)
  // Vinculação com Core
  coreLeadId: int('core_lead_id'),                                   // ID do lead no Core (preenchido após criar/encontrar)
  leadCreated: boolean('lead_created').default(false),               // true se o lead foi CRIADO (não existia)
  leadUpdated: boolean('lead_updated').default(false),               // true se o lead foi ATUALIZADO (já existia)
  // Metadata da Meta
  waTimestamp: bigint('wa_timestamp', { mode: 'number' }),           // timestamp da mensagem (Unix)
  phoneNumberId: varchar('phone_number_id', { length: 50 }),         // ID do número business que recebeu
  // Controle
  processed: boolean('processed').default(false),                    // true após processar com sucesso
  errorMessage: text('error_message'),                               // erro se falhou
  createdAt: timestamp('created_at').defaultNow(),
});
