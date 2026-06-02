/**
 * Script para testar o webhook do WhatsApp Bridge
 * Simula uma mensagem real enviada pela Meta
 */

const crypto = require('crypto');
const http = require('http');

// Configurações
const APP_SECRET = '781720edeb0ae55572a37576e933b8dd';
const VERIFY_TOKEN = 'catarinos_whatsapp_2026';
const WEBHOOK_URL = 'http://localhost:3000/webhook';

// Payload de teste - Mensagem de texto
const testPayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: '963906806623440',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '5511999999999',
              phone_number_id: '1151395758059878',
            },
            contacts: [
              {
                profile: {
                  name: 'João Silva',
                },
                wa_id: '5511987654321',
              },
            ],
            messages: [
              {
                from: '5511987654321',
                id: 'wamid.HBEUGVlhd0dCBAgkMjAxOTAyMTAxNzQ1MzIVNTAyMjAxOTAyMTAxNzQ1MzI=',
                timestamp: '1613049857',
                type: 'text',
                text: {
                  body: 'Olá, gostaria de mais informações sobre seus serviços',
                },
              },
            ],
          },
          field: 'messages',
        },
      ],
      timestamp: '1613049857',
    },
  ],
};

// Função para gerar assinatura HMAC
function generateSignature(payload, appSecret) {
  const hash = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');
  return hash;
}

// Função para enviar webhook
function sendWebhook() {
  const payloadString = JSON.stringify(testPayload);
  const signature = generateSignature(payloadString, APP_SECRET);

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/webhook',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payloadString),
      'X-Hub-Signature-256': `sha256=${signature}`,
    },
  };

  console.log('\n📤 Enviando webhook para o servidor...');
  console.log(`URL: ${WEBHOOK_URL}`);
  console.log(`Signature: sha256=${signature}`);
  console.log(`Payload: ${payloadString.substring(0, 100)}...`);

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n✅ Resposta do servidor:');
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      console.log(`Body: ${data}`);

      if (res.statusCode === 200) {
        console.log('\n🎉 Webhook processado com sucesso!');
      } else {
        console.log('\n❌ Erro ao processar webhook');
      }
    });
  });

  req.on('error', (error) => {
    console.error('\n❌ Erro ao enviar webhook:', error);
  });

  req.write(payloadString);
  req.end();
}

// Executar teste
console.log('🧪 Teste de Webhook do WhatsApp Bridge');
console.log('=====================================');
sendWebhook();
