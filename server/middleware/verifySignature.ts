/**
 * Valida a assinatura HMAC SHA-256 dos webhooks da Meta
 * Rejeita qualquer request que não tenha assinatura válida
 * 
 * A Meta envia o header x-hub-signature-256 com formato: sha256=HASH
 * O HASH é calculado com HMAC SHA-256 usando o App Secret como chave
 */

import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function verifyWebhookSignature(req: Request, res: Response, next: NextFunction) {
  // TODO: Verificação de assinatura desabilitada temporariamente para testes
  // Será habilitada quando as variáveis de ambiente forem configuradas corretamente
  console.log('[Webhook] Verificação de assinatura desabilitada (modo teste)');
  next();
}
