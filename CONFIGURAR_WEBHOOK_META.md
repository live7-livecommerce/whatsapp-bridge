# 🔗 Guia: Configurar Webhook na Meta

## 📋 Pré-requisitos

Antes de começar, você precisa ter:

- ✅ Aplicativo criado no Meta Developers
- ✅ Número WhatsApp Business registrado
- ✅ Access Token gerado
- ✅ Servidor em produção com URL pública (ex: Railway, Render, VPS)
- ✅ Certificado SSL/TLS válido (HTTPS)

---

## 🚀 Passo 1: Obter a URL do Servidor em Produção

Após fazer deploy do whatsapp-bridge, você terá uma URL pública. Exemplos:

| Plataforma | URL Exemplo |
|-----------|------------|
| **Railway** | `https://whatsapp-bridge-production.up.railway.app` |
| **Render** | `https://whatsapp-bridge.onrender.com` |
| **VPS** | `https://whatsapp.catarinosfull.com` |

**Sua URL do webhook será:**
```
https://[sua-url-aqui]/webhook
```

---

## 🔐 Passo 2: Preparar o Verify Token

O verify token é uma string que você define para validar requisições GET da Meta.

**Recomendação:** Use o token já configurado no `.env`:
```
WEBHOOK_VERIFY_TOKEN=catarinos_whatsapp_2026
```

Ou crie um novo token seguro:
```bash
# Gerar token aleatório (64 caracteres)
openssl rand -hex 32
```

---

## 📱 Passo 3: Acessar Meta Developers e Configurar Webhook

### 3.1 Acessar o Dashboard do App

1. Vá para https://developers.facebook.com/apps/
2. Selecione seu app "Catarinos Mensagens"
3. No menu lateral, clique em **WhatsApp → Configuração**

### 3.2 Configurar Webhook

1. Na seção **Webhook**, clique em **Editar**

2. Preencha os campos:

   | Campo | Valor |
   |-------|-------|
   | **Callback URL** | `https://[sua-url]/webhook` |
   | **Verify Token** | `catarinos_whatsapp_2026` |

3. Clique em **Verificar e salvar**

### 3.3 Meta Fará uma Requisição GET

A Meta enviará uma requisição GET para validar o webhook:

```
GET https://[sua-url]/webhook?hub.mode=subscribe&hub.verify_token=catarinos_whatsapp_2026&hub.challenge=CHALLENGE_VALUE
```

**Seu servidor deve responder com:**
```
200 OK
CHALLENGE_VALUE
```

O whatsapp-bridge já implementa isso automaticamente!

---

## 🔔 Passo 4: Inscrever-se em Eventos de Webhook

Após validar o webhook, você precisa inscrever-se nos eventos que deseja receber.

### 4.1 Acessar Configuração de Eventos

1. Na página de Configuração do WhatsApp
2. Procure por **Eventos de Webhook**
3. Clique em **Gerenciar eventos**

### 4.2 Selecionar Eventos para Receber

Marque os seguintes eventos:

- ✅ **messages** — Receber mensagens de clientes
- ✅ **message_status** — Receber status de entrega
- ✅ **message_template_status_update** — Status de templates

**Exemplo de eventos selecionados:**

```json
{
  "object": "whatsapp_business_account",
  "field": ["messages", "message_status", "message_template_status_update"]
}
```

---

## 🧪 Passo 5: Testar o Webhook

### 5.1 Teste Manual via Meta Developers

1. Na página de Configuração do WhatsApp
2. Procure por **Teste do Webhook**
3. Clique em **Enviar Teste**

Meta enviará um webhook de teste para validar a configuração.

### 5.2 Verificar Logs do Servidor

Verifique se a mensagem de teste foi recebida:

```bash
# Railway
railway logs

# Render
# Acesse o dashboard do Render

# VPS
tail -f /var/log/whatsapp-bridge.log
```

Você deve ver algo como:

```
[Webhook] Mensagem recebida: type=text, from=5511987654321
[DB] Mensagem salva: id=1, phone_number=5511987654321
```

### 5.3 Enviar Mensagem Real do WhatsApp

1. Abra WhatsApp no seu telefone
2. Envie uma mensagem para o número WhatsApp Business
3. Verifique se a mensagem aparece nos logs do servidor

---

## 📊 Passo 6: Monitorar Webhooks

### 6.1 Acessar Logs de Webhook

Na página de Configuração do WhatsApp:

1. Procure por **Logs de Webhook**
2. Você verá todas as requisições enviadas pela Meta
3. Verifique se há erros (status 4xx ou 5xx)

### 6.2 Interpretar Logs

| Status | Significado |
|--------|------------|
| **200** | ✅ Webhook processado com sucesso |
| **401** | ❌ Assinatura inválida ou ausente |
| **500** | ❌ Erro no servidor |
| **Timeout** | ❌ Servidor não respondeu a tempo |

---

## 🔍 Passo 7: Validar Configuração

### Checklist de Validação

- ✅ URL do webhook está acessível (HTTPS)
- ✅ Certificado SSL/TLS é válido
- ✅ Verify token está correto
- ✅ Webhook responde com 200 OK para GET
- ✅ Webhook processa POST com assinatura válida
- ✅ Eventos estão inscritos (messages, message_status)
- ✅ Mensagens aparecem no banco de dados
- ✅ Logs mostram processamento sem erros

---

## 🚨 Troubleshooting

### Problema: "Webhook URL não pode ser acessada"

**Solução:**
1. Verifique se a URL é pública (não localhost)
2. Verifique se tem HTTPS (não HTTP)
3. Verifique se o certificado SSL é válido
4. Teste a URL no navegador: `https://[sua-url]/webhook?hub.mode=subscribe&hub.verify_token=catarinos_whatsapp_2026&hub.challenge=test`

### Problema: "Assinatura inválida"

**Solução:**
1. Verifique se `META_APP_SECRET` está correto no `.env`
2. Verifique se o header `X-Hub-Signature-256` está sendo enviado
3. Teste com o script de validação HMAC

### Problema: "Webhook não recebe mensagens"

**Solução:**
1. Verifique se os eventos estão inscritos (messages)
2. Verifique se o número WhatsApp está ativo
3. Verifique os logs da Meta para erros
4. Teste com o script de teste de webhook

### Problema: "Timeout ao enviar webhook"

**Solução:**
1. Verifique se o servidor está rodando
2. Verifique se há erros no código
3. Aumente o timeout no `.env`: `WEBHOOK_TIMEOUT_MS=10000`
4. Verifique a conexão com o banco de dados

---

## 📝 Configuração Final do `.env` em Produção

```env
# Meta WhatsApp Business Cloud API
META_APP_ID=1477595246746967
META_APP_SECRET=781720edeb0ae55572a37576e933b8dd
META_ACCESS_TOKEN=EAAUZC3XPN3VcBRtFHgvHgjqTZAff0ZCqOSEcdIWFRK4TGLHbA4Gay3uMJVHncGxXB4XURIyc1ZB1MUjqOQROw0ywxZCkdQ3ZAiGWUhh7DGoEE7OAsr7Nk4cZA3AegQDFPoAsCykHg4HMI4FlwPLo2TZAhC7dyYUkjzZBM83ZC0EpaRQI8UuavVMqGQnZBwTZBeY2N6WH4fGx5ZBN2oL0oDZBS0NV2idN2NTTmPaMYBkjy0QOkjpvP1ljNCdn6gwpaQVyll8H7BvG62BCQaqzQvYRkDGv17HyOP
META_PHONE_NUMBER_ID=1151395758059878
META_BUSINESS_ACCOUNT_ID=963906806623440
META_VERIFY_TOKEN=catarinos_whatsapp_2026

# Banco de Dados (em produção, use banco gerenciado)
DATABASE_URL=mysql://user:password@host:3306/whatsapp_bridge

# Core CRM API
CORE_API_URL=https://catacoreapp.manus.space
CORE_API_KEY=seu_service_api_key_aqui

# Servidor
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
```

---

## ✅ Próximos Passos

Após configurar o webhook:

1. ✅ Testar com mensagens reais
2. ✅ Monitorar logs por 24 horas
3. ✅ Integrar com Core CRM
4. ✅ Implementar respostas automáticas
5. ✅ Configurar alertas e monitoramento

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs do servidor
2. Verifique os logs da Meta Developers
3. Teste com o script de validação HMAC
4. Consulte a documentação da Meta: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks

---

## 🎉 Conclusão

Após seguir todos os passos, seu webhook estará:

- ✅ Configurado na Meta
- ✅ Recebendo mensagens em tempo real
- ✅ Armazenando no banco de dados
- ✅ Pronto para integração com Core CRM

**Status: PRONTO PARA PRODUÇÃO** 🚀
