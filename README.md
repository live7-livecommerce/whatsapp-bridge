# WhatsApp Bridge — Microserviço de Integração WhatsApp → Core CRM

Microserviço Node.js + Express que recebe mensagens do WhatsApp Business Cloud API e registra automaticamente leads no Core CRM.

**Desenvolvido por Catarino's**

---

## Características

- ✅ **100% Portável** — roda em qualquer VPS, Railway, Render ou Cloud Run
- ✅ **Validação de Assinatura** — HMAC SHA-256 da Meta em todas as requisições
- ✅ **Idempotente** — não duplica leads nem logs em caso de retry da Meta
- ✅ **Service Account** — integração segura com Core CRM via token com cache de 23h
- ✅ **Logging Local** — registro de todas as mensagens para auditoria e reprocessamento
- ✅ **Sem Dependências Manus** — Express puro, axios, Drizzle ORM, MySQL

---

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| HTTP client | axios |
| Banco local | MySQL via Drizzle ORM |
| Variáveis de ambiente | dotenv |
| Validação | crypto (nativo Node.js, para HMAC) |
| Domínio | whatsapp.catarinosfull.com |

---

## Estrutura de Arquivos

```
whatsapp-bridge/
├── package.json
├── .env.example
├── tsconfig.json
├── drizzle.config.ts
├── drizzle/
│   └── schema.ts              ← tabelas do banco local
├── server/
│   ├── index.ts               ← entry point (Express server)
│   ├── db.ts                  ← conexão Drizzle
│   ├── routes/
│   │   └── webhook.ts         ← recebe webhooks da Meta
│   ├── services/
│   │   ├── coreApi.ts         ← chamadas ao Core CRM (Service Account)
│   │   └── messageProcessor.ts ← lógica de processamento de mensagens
│   └── middleware/
│       └── verifySignature.ts ← validação HMAC da Meta
└── README.md
```

---

## Instalação

### 1. Clonar o repositório

```bash
git clone https://github.com/catarinosfull/whatsapp-bridge.git
cd whatsapp-bridge
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie `.env.example` para `.env` e preencha com seus dados:

```bash
cp .env.example .env
```

Edite `.env` com:

```env
# Banco local (logs e auditoria)
DATABASE_URL=mysql://user:pass@host:3306/whatsapp_bridge

# Core CRM
CORE_API_URL=https://core.catarinosfull.com
CORE_SERVICE_EMAIL=carlos@verificacao.com
CORE_SERVICE_PASSWORD=Verifica@2026

# Meta WhatsApp
WHATSAPP_VERIFY_TOKEN=seu_token_secreto
WHATSAPP_APP_SECRET=seu_app_secret_meta
WHATSAPP_ACCESS_TOKEN=seu_token_permanente
WHATSAPP_PHONE_NUMBER_ID=seu_numero_id

# Servidor
PORT=3001
NODE_ENV=production
```

### 4. Criar banco de dados

```bash
# Criar banco MySQL
mysql -u root -p -e "CREATE DATABASE whatsapp_bridge;"

# Rodar migrações Drizzle
npm run db:push
```

---

## Desenvolvimento

### Modo desenvolvimento (com hot reload)

```bash
npm run dev
```

O servidor estará em `http://localhost:3001`

### Build para produção

```bash
npm run build
```

### Iniciar em produção

```bash
npm start
```

---

## Fluxo de Processamento

```
┌──────────────────────────────────────────────────────────┐
│  WhatsApp Business Cloud API (Meta)                      │
│  Webhook: POST https://whatsapp.catarinosfull.com/webhook│
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP POST (JSON)
┌────────────────────────▼─────────────────────────────────┐
│  MICROSERVIÇO: whatsapp-bridge                           │
│  Node.js + Express                                       │
│                                                          │
│  1. Valida assinatura da Meta (x-hub-signature-256)      │
│  2. Extrai: telefone, nome, texto, tipo, timestamp       │
│  3. Busca lead no Core por telefone                      │
│     → Existe? Atualiza notes com nova mensagem           │
│     → Não existe? Cria lead novo                         │
│  4. Grava log no banco local (auditoria)                 │
│  5. Retorna 200 OK para a Meta (obrigatório)             │
└────────────────────────┬─────────────────────────────────┘
                         │ axios
┌────────────────────────▼─────────────────────────────────┐
│  CORE CRM (https://core.catarinosfull.com)               │
│  POST /api/leads — criar lead                            │
│  GET /api/leads?search=X — buscar por telefone           │
│  PUT /api/leads/:id — atualizar notes                    │
│  POST /api/leads/:id/metadata — gravar metadata          │
└──────────────────────────────────────────────────────────┘
```

---

## Endpoints

### GET /health

Health check do serviço.

**Resposta:**
```json
{
  "status": "ok",
  "service": "whatsapp-bridge",
  "timestamp": "2026-05-17T10:30:00.000Z"
}
```

### GET /webhook

Verificação do webhook pela Meta (handshake).

**Parâmetros:**
- `hub.mode=subscribe`
- `hub.verify_token=SEU_TOKEN`
- `hub.challenge=valor_aleatorio`

**Resposta:** Retorna `hub.challenge` se o token for válido.

### POST /webhook

Recebe mensagens do WhatsApp.

**Headers obrigatórios:**
- `x-hub-signature-256`: Assinatura HMAC SHA-256 da Meta

**Body:** Payload JSON da Meta (estrutura de webhook)

**Resposta:** `200 OK { "status": "received" }`

---

## Configuração na Meta

### 1. No Meta Developers (developers.facebook.com):

1. Acessar o App → WhatsApp → Configuration
2. Em **Webhook URL**: `https://whatsapp.catarinosfull.com/webhook`
3. Em **Verify Token**: o mesmo valor de `WHATSAPP_VERIFY_TOKEN` do .env
4. Clicar **Verify and Save**
5. Em **Webhook Fields**: marcar `messages` (obrigatório)

### 2. Gerar Token Permanente:

1. No Meta Developers → App → WhatsApp → API Setup
2. Gerar **System User Token** com permissão `whatsapp_business_messaging`
3. Copiar o token e colocar em `WHATSAPP_ACCESS_TOKEN` no .env

### 3. Obter App Secret:

1. No Meta Developers → App → Settings → Basic
2. Copiar **App Secret** e colocar em `WHATSAPP_APP_SECRET` no .env

---

## Testes

### Teste 1 — Health Check

```bash
curl https://whatsapp.catarinosfull.com/health
# Esperado: {"status":"ok","service":"whatsapp-bridge","timestamp":"..."}
```

### Teste 2 — Webhook Verification

```bash
curl "https://whatsapp.catarinosfull.com/webhook?hub.mode=subscribe&hub.verify_token=SEU_TOKEN&hub.challenge=teste123"
# Esperado: teste123
```

### Teste 3 — Enviar mensagem real

1. Enviar uma mensagem do celular para o número WhatsApp Business
2. Verificar no banco local:
   ```sql
   SELECT * FROM whatsapp_messages_log ORDER BY id DESC LIMIT 1;
   ```
3. Verificar no Core CRM: lead deve ter sido criado/atualizado com a mensagem

### Teste 4 — Idempotência

1. Reenviar o mesmo payload do webhook
2. Verificar que NÃO criou lead duplicado nem log duplicado

---

## Banco de Dados

### Tabela: whatsapp_messages_log

Registro de todas as mensagens recebidas (auditoria + reprocessamento).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT | ID único (auto-increment) |
| `wa_message_id` | VARCHAR(200) | ID único da Meta (idempotência) |
| `phone_number` | VARCHAR(20) | Telefone do cliente |
| `contact_name` | VARCHAR(200) | Nome do perfil WhatsApp |
| `message_type` | VARCHAR(20) | Tipo: text, image, audio, video, document, location |
| `message_body` | TEXT | Texto da mensagem ou caption de mídia |
| `media_url` | VARCHAR(500) | URL/ID da mídia (se aplicável) |
| `core_lead_id` | INT | ID do lead no Core (após criar/encontrar) |
| `lead_created` | BOOLEAN | true se o lead foi CRIADO |
| `lead_updated` | BOOLEAN | true se o lead foi ATUALIZADO |
| `wa_timestamp` | BIGINT | Timestamp Unix da mensagem |
| `phone_number_id` | VARCHAR(50) | ID do número business que recebeu |
| `processed` | BOOLEAN | true após processar com sucesso |
| `error_message` | TEXT | Erro se falhou |
| `created_at` | TIMESTAMP | Data/hora de criação do registro |

---

## Observações Importantes

### 1. Validação de Assinatura

O middleware `verifyWebhookSignature` precisa do body raw para funcionar. O Express já parseia o JSON com `express.json()` antes das rotas, então a validação usa o JSON stringificado.

### 2. Timeout da Meta

A Meta faz retry se não receber 200 em 20 segundos. Por isso o POST /webhook retorna 200 imediatamente e processa a mensagem de forma assíncrona.

### 3. Formato do Telefone

- WhatsApp envia: `5541991851976` (com código do país 55)
- Core armazena: `41991851976` (DDD + número, sem código do país)
- A função `formatarTelefone` remove o prefixo `55` automaticamente

### 4. Busca por Telefone no Core

O Core aceita `GET /api/leads?search={telefone}`. O parâmetro `search` faz busca textual e pode retornar matches parciais, por isso o código filtra por telefone exato no resultado.

### 5. Cache de Token

O Service Account token é cacheado por 23 horas para reduzir chamadas ao Core. O cache é renovado automaticamente quando expira.

---

## Troubleshooting

### Erro: "Assinatura inválida"

- Verifique se `WHATSAPP_APP_SECRET` está correto
- Verifique se o header `x-hub-signature-256` está sendo enviado pela Meta

### Erro: "Token inválido" (na verificação do webhook)

- Verifique se `WHATSAPP_VERIFY_TOKEN` está correto
- Verifique se o parâmetro `hub.verify_token` na URL bate com o token configurado

### Leads não estão sendo criados

- Verifique se `CORE_API_URL`, `CORE_SERVICE_EMAIL` e `CORE_SERVICE_PASSWORD` estão corretos
- Verifique os logs do serviço para mensagens de erro
- Verifique se o banco local está conectado

### Banco de dados não conecta

- Verifique se `DATABASE_URL` está correto
- Verifique se o MySQL está rodando
- Verifique se o banco `whatsapp_bridge` foi criado

---

## Etapas Futuras

| Não faz | Fica para qual etapa |
|---------|---------------------|
| Exibir mensagens no CRM Frontend | Etapa 2 |
| Responder pelo CRM | Etapa 3 |
| Inbox com lista de conversas | Etapa 4 |
| Multi-atendente, filas, SLA | Etapa 5 |
| Enviar templates fora da janela 24h | Etapa 3 |
| Baixar e armazenar mídias (imagens, áudios) | Etapa futura |

---

## Licença

Desenvolvido por **Catarino's** — Maio/2026

---

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
