/**
 * Processa mensagens recebidas do WhatsApp
 * 
 * Fluxo:
 * 1. Verifica idempotência (mensagem já processada?)
 * 2. Busca lead no Core por telefone
 * 3. Se não existe → cria lead novo
 * 4. Se existe → atualiza notes com a mensagem
 * 5. Grava metadata com origem "WhatsApp"
 * 6. Registra log no banco local
 */

import { getDb } from '../db';
import { whatsappMessagesLog } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { buscarLeadPorTelefone, criarLead, atualizarNotesLead, gravarMetadata } from './coreApi';

interface IncomingMessage {
  waMessageId: string;
  phoneNumber: string;
  contactName: string;
  messageType: string;
  messageBody: string | null;
  mediaUrl: string | null;
  waTimestamp: number;
  phoneNumberId: string;
}

export async function processMessage(msg: IncomingMessage): Promise<void> {
  console.log(`[Processor] Processando mensagem ${msg.waMessageId} de ${msg.phoneNumber}`);

  const db = getDb();

  // 1. Verificar idempotência — já processou essa mensagem?
  const existing = await db.select()
    .from(whatsappMessagesLog)
    .where(eq(whatsappMessagesLog.waMessageId, msg.waMessageId))
    .limit(1);

  if (existing.length > 0 && existing[0].processed) {
    console.log(`[Processor] Mensagem ${msg.waMessageId} já processada — ignorando`);
    return;
  }

  // 2. Inserir log (ou atualizar se já existe mas não foi processado)
  let logId: number;
  if (existing.length > 0) {
    logId = existing[0].id;
  } else {
    const result = await db.insert(whatsappMessagesLog).values({
      waMessageId: msg.waMessageId,
      phoneNumber: msg.phoneNumber,
      contactName: msg.contactName,
      messageType: msg.messageType,
      messageBody: msg.messageBody,
      mediaUrl: msg.mediaUrl,
      waTimestamp: msg.waTimestamp,
      phoneNumberId: msg.phoneNumberId,
    });
    logId = (result as any).insertId;
  }

  try {
    // 3. Formatar telefone para busca (remover prefixo 55 se necessário, ou manter padrão do Core)
    const telefoneFormatado = formatarTelefone(msg.phoneNumber);

    // 4. Buscar lead no Core por telefone
    let lead = await buscarLeadPorTelefone(telefoneFormatado);
    let leadCreated = false;
    let leadUpdated = false;

    if (!lead) {
      // 5a. Lead não existe → criar novo
      console.log(`[Processor] Lead não encontrado para ${telefoneFormatado} — criando novo`);
      lead = await criarLead({
        name: msg.contactName || 'WhatsApp ' + telefoneFormatado,
        phone: telefoneFormatado,
        source: 'WhatsApp',
        notes: `[WhatsApp ${formatTimestamp(msg.waTimestamp)}] ${msg.messageBody || `[${msg.messageType}]`}`,
      });
      leadCreated = true;

      // Gravar metadata de origem
      if (lead.id) {
        await gravarMetadata(lead.id, 'origem_canal', 'WhatsApp');
        await gravarMetadata(lead.id, 'primeiro_contato', formatTimestamp(msg.waTimestamp));
      }
    } else {
      // 5b. Lead existe → atualizar notes com a mensagem
      console.log(`[Processor] Lead encontrado (ID: ${lead.id}) — atualizando notes`);
      const noteText = `[WhatsApp ${formatTimestamp(msg.waTimestamp)}] ${msg.messageBody || `[${msg.messageType}]`}`;
      await atualizarNotesLead(lead.id, noteText);
      leadUpdated = true;
    }

    // 6. Atualizar log com sucesso
    await db.update(whatsappMessagesLog)
      .set({
        coreLeadId: lead.id,
        leadCreated,
        leadUpdated,
        processed: true,
      })
      .where(eq(whatsappMessagesLog.id, logId));

    console.log(`[Processor] Mensagem ${msg.waMessageId} processada com sucesso — Lead ID: ${lead.id}`);

  } catch (error: any) {
    // Registrar erro no log
    console.error(`[Processor] Erro ao processar mensagem ${msg.waMessageId}:`, error.message);
    await db.update(whatsappMessagesLog)
      .set({
        errorMessage: error.message || 'Erro desconhecido',
        processed: false,
      })
      .where(eq(whatsappMessagesLog.id, logId));
  }
}

/**
 * Formata telefone para o padrão do Core
 * WhatsApp envia: "5511999887766" (com código do país)
 * Core pode esperar: "(11) 99988-7766" ou "11999887766"
 * 
 * AJUSTAR conforme o padrão que o Core aceita na busca
 */
function formatarTelefone(phone: string): string {
  // Remove o código do país (55 para Brasil)
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    cleaned = cleaned.substring(2);
  }
  return cleaned;
}

/**
 * Formata timestamp Unix para data legível
 */
function formatTimestamp(ts: number): string {
  const date = new Date(ts * 1000);
  return date.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}
