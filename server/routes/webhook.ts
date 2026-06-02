/**
 * Rotas do webhook WhatsApp
 * 
 * GET  /webhook — verificação do webhook pela Meta (handshake)
 * POST /webhook — recebe mensagens e status
 */

import { Router, Request, Response } from 'express';
import { verifyWebhookSignature } from '../middleware/verifySignature';
import { processMessage } from '../services/messageProcessor';

const router = Router();

/**
 * GET /webhook — Verificação do webhook (Meta Handshake)
 * A Meta envia um GET com hub.mode, hub.verify_token e hub.challenge
 * Devemos retornar hub.challenge se o verify_token bater
 */
router.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('[Webhook] Verificação OK — respondendo challenge');
    return res.status(200).send(challenge);
  }

  console.warn('[Webhook] Verificação falhou — token inválido');
  return res.status(403).json({ error: 'Token inválido' });
});

/**
 * POST /webhook — Recebe mensagens do WhatsApp
 * 
 * REGRA CRÍTICA: Sempre retornar 200 OK rapidamente.
 * Se retornar erro, a Meta faz retry e pode desabilitar o webhook.
 * O processamento pesado é feito de forma assíncrona.
 */
router.post('/webhook', verifyWebhookSignature, async (req: Request, res: Response) => {
  // Retornar 200 imediatamente (a Meta exige resposta rápida)
  res.status(200).json({ status: 'received' });

  try {
    const body = req.body;

    // Verificar se é um evento de mensagem
    if (body.object !== 'whatsapp_business_account') return;

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field !== 'messages') continue;

        const value = change.value;
        const metadata = value.metadata || {};
        const contacts = value.contacts || [];
        const messages = value.messages || [];

        // Ignorar webhooks de status (sent, delivered, read) — só processar mensagens recebidas
        if (!messages.length) continue;

        for (const message of messages) {
          const contact = contacts.find((c: any) => c.wa_id === message.from) || {};

          // Extrair dados da mensagem
          const incomingMessage = {
            waMessageId: message.id,
            phoneNumber: message.from,
            contactName: contact.profile?.name || '',
            messageType: message.type || 'unknown',
            messageBody: extractMessageBody(message),
            mediaUrl: extractMediaUrl(message),
            waTimestamp: parseInt(message.timestamp) || Math.floor(Date.now() / 1000),
            phoneNumberId: metadata.phone_number_id || '',
          };

          // Processar assincronamente (não bloqueia o response)
          processMessage(incomingMessage).catch(err => {
            console.error('[Webhook] Erro no processamento assíncrono:', err.message);
          });
        }
      }
    }
  } catch (error: any) {
    console.error('[Webhook] Erro ao parsear payload:', error.message);
  }
});

/**
 * Extrai o texto da mensagem baseado no tipo
 */
function extractMessageBody(message: any): string | null {
  switch (message.type) {
    case 'text':
      return message.text?.body || null;
    case 'image':
      return message.image?.caption || '[Imagem]';
    case 'video':
      return message.video?.caption || '[Vídeo]';
    case 'audio':
      return '[Áudio]';
    case 'document':
      return message.document?.caption || `[Documento: ${message.document?.filename || 'arquivo'}]`;
    case 'location':
      return `[Localização: ${message.location?.latitude}, ${message.location?.longitude}]`;
    case 'contacts':
      return '[Contato compartilhado]';
    case 'sticker':
      return '[Sticker]';
    case 'reaction':
      return `[Reação: ${message.reaction?.emoji || ''}]`;
    case 'interactive':
      return message.interactive?.button_reply?.title 
        || message.interactive?.list_reply?.title 
        || '[Resposta interativa]';
    case 'button':
      return message.button?.text || '[Botão]';
    default:
      return `[${message.type || 'desconhecido'}]`;
  }
}

/**
 * Extrai URL de mídia (se aplicável)
 */
function extractMediaUrl(message: any): string | null {
  const mediaTypes = ['image', 'video', 'audio', 'document', 'sticker'];
  for (const type of mediaTypes) {
    if (message[type]?.id) {
      return message[type].id; // ID da mídia na Meta (precisa de GET para baixar)
    }
  }
  return null;
}

export default router;
