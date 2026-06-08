/**
 * Funções para enviar mensagens via WhatsApp Business API
 */

import axios from 'axios';

const WHATSAPP_API_URL = 'https://graph.instagram.com/v25.0';

/**
 * Obter o token de acesso (lê a cada requisição)
 */
function getAccessToken(): string {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    console.warn('[WhatsApp] AVISO: WHATSAPP_ACCESS_TOKEN não configurado');
    return '';
  }
  return token;
}

/**
 * Envia mensagem de texto via WhatsApp
 */
export async function sendWhatsAppMessage(
  toPhoneNumber: string,
  messageText: string,
  phoneNumberId: string
): Promise<any> {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('WHATSAPP_ACCESS_TOKEN não configurado');
  }

  try {
    console.log(`[WhatsApp] Enviando mensagem para ${toPhoneNumber} com token: ${token.substring(0, 20)}...`);
    
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`[WhatsApp] ✅ Mensagem enviada com sucesso para ${toPhoneNumber}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[WhatsApp] ❌ Erro ao enviar mensagem para ${toPhoneNumber}:`, error.response?.data || error.message);
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
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('WHATSAPP_ACCESS_TOKEN não configurado');
  }

  try {
    console.log(`[WhatsApp] Enviando template para ${toPhoneNumber} com token: ${token.substring(0, 20)}...`);
    
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`[WhatsApp] ✅ Template enviado com sucesso para ${toPhoneNumber}:`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`[WhatsApp] ❌ Erro ao enviar template para ${toPhoneNumber}:`, error.response?.data || error.message);
    throw error;
  }
}
