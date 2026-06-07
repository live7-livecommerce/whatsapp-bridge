/**
 * Processa mensagens recebidas do WhatsApp
 * 
 * MODO TESTE: Apenas recebe mensagem e envia resposta automática
 * Integração com Core CRM será adicionada depois
 */

import { sendWhatsAppMessage } from '../whatsapp';

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
  console.log(`[Processor] Recebida mensagem de ${msg.phoneNumber}: ${msg.messageBody || `[${msg.messageType}]`}`);

  try {
    // MODO TESTE: Enviar resposta automática
    const resposta = `✅ Mensagem recebida! Obrigado por entrar em contato.\n\nSua mensagem: "${msg.messageBody || `[${msg.messageType}]`}"\n\nEstaremos respondendo em breve.`;
    
    console.log(`[Processor] Enviando resposta automática para ${msg.phoneNumber}`);
    
    await sendWhatsAppMessage(msg.phoneNumber, resposta, msg.phoneNumberId);
    
    console.log(`[Processor] ✅ Resposta enviada com sucesso para ${msg.phoneNumber}`);

  } catch (error: any) {
    console.error(`[Processor] ❌ Erro ao processar mensagem:`, error.message);
  }
}
