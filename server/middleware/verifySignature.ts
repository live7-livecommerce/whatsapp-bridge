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
  const signature = req.headers['x-hub-signature-256'] as string;

  if (!signature) {
    console.warn('[Webhook] Request sem assinatura — rejeitado');
    return res.status(401).json({ error: 'Assinatura ausente' });
  }

  const appSecret = process.env.META_APP_SECRET!;
  const payload = JSON.stringify(req.body);
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    console.warn('[Webhook] Assinatura inválida — rejeitado');
    return res.status(401).json({ error: 'Assinatura inválida' });
  }

  next();
}
