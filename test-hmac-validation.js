/**
 * Teste Completo de Validação HMAC SHA-256
 * Valida assinatura de webhooks da Meta
 */

const crypto = require('crypto');
const http = require('http');

// Configurações
const APP_SECRET = '781720edeb0ae55572a37576e933b8dd';
const WEBHOOK_URL = 'http://localhost:3000/webhook';

// Payload de teste
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
                id: 'wamid.test123',
                timestamp: '1613049857',
                type: 'text',
                text: {
                  body: 'Teste de validação HMAC',
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
function sendWebhook(testName, signature, shouldSucceed = true) {
  return new Promise((resolve) => {
    const payloadString = JSON.stringify(testPayload);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadString),
      },
    };

    // Adicionar header de assinatura se fornecido
    if (signature !== null) {
      options.headers['X-Hub-Signature-256'] = signature;
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const success = shouldSucceed ? res.statusCode === 200 : res.statusCode !== 200;
        const status = success ? '✅ PASSOU' : '❌ FALHOU';

        console.log(`\n${status} - ${testName}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Signature: ${signature || 'Nenhuma'}`);
        console.log(`   Response: ${data.substring(0, 50)}`);

        resolve({
          testName,
          passed: success,
          statusCode: res.statusCode,
          shouldSucceed,
        });
      });
    });

    req.on('error', (error) => {
      console.error(`\n❌ ERRO - ${testName}`);
      console.error(`   Erro: ${error.message}`);
      resolve({
        testName,
        passed: false,
        error: error.message,
        shouldSucceed,
      });
    });

    req.write(payloadString);
    req.end();
  });
}

// Função para executar todos os testes
async function runAllTests() {
  console.log('🧪 Testes de Validação HMAC SHA-256');
  console.log('====================================\n');

  const payloadString = JSON.stringify(testPayload);
  const validSignature = generateSignature(payloadString, APP_SECRET);
  const invalidSignature = 'sha256=0000000000000000000000000000000000000000000000000000000000000000';
  const malformedSignature = 'invalid_signature';

  const results = [];

  // Teste 1: Assinatura válida
  console.log('📋 Teste 1: Assinatura Válida');
  console.log(`   Payload: ${payloadString.substring(0, 50)}...`);
  console.log(`   App Secret: ${APP_SECRET}`);
  console.log(`   Signature: sha256=${validSignature}`);
  results.push(await sendWebhook('Assinatura válida', `sha256=${validSignature}`, true));

  // Teste 2: Assinatura inválida
  console.log('\n📋 Teste 2: Assinatura Inválida');
  console.log(`   Signature: ${invalidSignature}`);
  results.push(await sendWebhook('Assinatura inválida', invalidSignature, false));

  // Teste 3: Sem assinatura
  console.log('\n📋 Teste 3: Sem Assinatura');
  console.log(`   Header X-Hub-Signature-256: Não fornecido`);
  results.push(await sendWebhook('Sem assinatura', null, false));

  // Teste 4: Assinatura malformada
  console.log('\n📋 Teste 4: Assinatura Malformada');
  console.log(`   Signature: ${malformedSignature}`);
  results.push(await sendWebhook('Assinatura malformada', malformedSignature, false));

  // Resumo
  console.log('\n\n📊 Resumo dos Testes');
  console.log('====================');

  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.testName}`);
  });

  console.log(`\n📈 Resultado: ${passed}/${total} testes passaram`);

  if (passed === total) {
    console.log('\n🎉 Todos os testes de validação HMAC passaram!');
  } else {
    console.log(`\n⚠️  ${total - passed} teste(s) falharam`);
  }

  // Informações técnicas
  console.log('\n\n🔐 Informações Técnicas');
  console.log('=======================');
  console.log(`App Secret: ${APP_SECRET}`);
  console.log(`Algoritmo: HMAC-SHA256`);
  console.log(`Payload Size: ${Buffer.byteLength(payloadString)} bytes`);
  console.log(`Valid Signature: sha256=${validSignature}`);
  console.log(`Signature Format: sha256=<hex_hash>`);
}

// Executar testes
runAllTests().catch(console.error);
