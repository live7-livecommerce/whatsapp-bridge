/**
 * Funções para enviar mensagens via WhatsApp Business API
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const WHATSAPP_API_URL = 'https://graph.instagram.com/v25.0';

// Carregar token do arquivo config.json ou variável de ambiente
let cachedToken: string | null = null;

/**
 * Obter o token de acesso (lê a cada requisição)
 * Prioridade: config.json > variáveis de ambiente
 */
function getAccessToken(): string {
  // Se já temos em cache, retorna
  if (cachedToken) {
    return cachedToken;
  }
  
  let token = '';
  
  // Tentar ler do arquivo config.json
  try {
    const configPath = path.join(__dirname, '..', 'config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      token = config.whatsapp?.accessToken || '';
      if (token) {
        console.log('[WhatsApp] Token carregado do arquivo config.json');
        cachedToken = token;
        return token;
      }
    }
  } catch (error) {
    console.warn('[WhatsApp] Erro ao ler config.json:', error);
  }
  
  // Fallback: tentar variáveis de ambiente
  token = process.env.WHATSAPP_ACCESS_TOKEN || '';
  const part2 = process.env.WHATSAPP_ACCESS_TOKEN_PART2 || '';
  
  if (part2) {
    token = token + part2;
  }
  
  if (!token) {
    console.warn('[WhatsApp] AVISO: WHATSAPP_ACCESS_TOKEN não configurado');
    return '';
  }
  
  cachedToken = token;
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
