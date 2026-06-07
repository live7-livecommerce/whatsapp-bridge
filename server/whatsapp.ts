/**
 * Funções para enviar mensagens via WhatsApp Business API
 */

import axios from 'axios';

const WHATSAPP_API_URL = 'https://graph.instagram.com/v25.0';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

/**
 * Envia mensagem de texto via WhatsApp
 */
export async function sendWhatsAppMessage(
  toPhoneNumber: string,
  messageText: string,
  phoneNumberId: string
): Promise<any> {
  if (!WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WHATSAPP_ACCESS_TOKEN não configurado');
  }

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: toPhoneNumber,
        type: 'text',
        text: {
          body: messageText,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`[WhatsApp] Mensagem enviada com sucesso para ${toPhoneNumber}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[WhatsApp] Erro ao enviar mensagem para ${toPhoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Envia mensagem com template
 */
export async function sendWhatsAppTemplate(
  toPhoneNumber: string,
  templateName: string,
  phoneNumberId: string,
  parameters?: any[]
): Promise<any> {
  if (!WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WHATSAPP_ACCESS_TOKEN não configurado');
  }

  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: toPhoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'pt_BR',
          },
          ...(parameters && { parameters: { body: { parameters } } }),
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`[WhatsApp] Template enviado com sucesso para ${toPhoneNumber}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[WhatsApp] Erro ao enviar template para ${toPhoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
}
