# 🔧 Guia Prático: Configurar Webhook na Meta (Manual)

## ✅ Dados que Você Já Tem

```
App ID: 1477595246746967
App Secret: 781720edeb0ae55572a37576e933b8dd
Access Token: EAAUZC3XPN3VcBRtFHgvHgjqTZAff0ZCqOSEcdIWFRK4TGLHbA4Gay3uMJVHncGxXB4XURIyc1ZB1MUjqOQROw0ywxZCkdQ3ZAiGWUhh7DGoEE7OAsr7Nk4cZA3AegQDFPoAsCykHg4HMI4FlwPLo2TZAhC7dyYUkjzZBM83ZC0EpaRQI8UuavVMqGQnZBwTZBeY2N6WH4fGx5ZBN2oL0oDZBS0NV2idN2NTTmPaMYBkjy0QOkjpvP1ljNCdn6gwpaQVyll8H7BvG62BCQaqzQvYRkDGv17HyOP
Phone Number ID: 1151395758059878
Business Account ID: 963906806623440
Verify Token: catarinos_whatsapp_2026
```

## 🚀 Passo a Passo para Configurar Webhook

### Passo 1: Acessar Configurações do Webhook

1. Vá para: https://developers.facebook.com/apps/1477595246746967/whatsapp-business/wa-settings/
2. Ou navegue manualmente:
   - Meta Developers → Seu App (Catarinos Mensagens)
   - Casos de uso → Conectar no WhatsApp
   - Configuração → Configuração

### Passo 2: Adicionar Webhook

Você verá uma seção chamada **"Webhooks"** ou **"Callback URL"**

Preencha os seguintes campos:

#### Campo 1: Callback URL
```
https://seu-dominio.com/webhook
```

**Opções para o domínio:**
- Se estiver em produção: `https://whatsapp.catarinosfull.com/webhook`
- Se estiver testando: `https://seu-servidor-railway.up.railway.app/webhook`
- Se estiver em localhost (testes): `http://localhost:3000/webhook`

#### Campo 2: Verify Token
```
catarinos_whatsapp_2026
```

### Passo 3: Salvar Webhook

Clique em **"Salvar"** ou **"Confirmar"**

A Meta vai fazer um GET request para validar:
```
GET https://seu-dominio.com/webhook?
  hub.mode=subscribe&
  hub.verify_token=catarinos_whatsapp_2026&
  hub.challenge=test123
```

Seu servidor deve responder com o `hub.challenge` para validar.

### Passo 4: Inscrever-se em Eventos

Após salvar o webhook, você precisa inscrever-se nos eventos:

1. Procure por **"Inscrever-se em eventos"** ou **"Subscribe to events"**
2. Marque os seguintes eventos:
   - ✅ `messages` (receber mensagens)
   - ✅ `message_status` (status de entrega)
   - ✅ `message_template_status_update` (status de templates)

### Passo 5: Testar Webhook

Após configurar, teste enviando uma mensagem:

1. Vá para a seção **"Enviar e receber mensagens"**
2. Clique em **"Enviar mensagem"**
3. Seu servidor deve receber um POST request com a mensagem

## 🔍 Validação

Após configurar, você deve ver:

- ✅ Webhook URL: `https://seu-dominio.com/webhook`
- ✅ Verify Token: `catarinos_whatsapp_2026`
- ✅ Status: **"Ativo"** ou **"Conectado"**
- ✅ Eventos inscritos: `messages`, `message_status`

## 🛠️ Troubleshooting

### Problema: "Webhook não pode ser validado"

**Solução:**
1. Verifique se seu servidor está rodando
2. Verifique se a URL é acessível publicamente
3. Verifique se o Verify Token está correto
4. Verifique os logs do seu servidor

### Problema: "Não estou recebendo mensagens"

**Solução:**
1. Verifique se está inscrito nos eventos corretos
2. Verifique se o número de telefone está configurado
3. Verifique se o Access Token é válido
4. Verifique os logs do servidor

### Problema: "Erro 401 Unauthorized"

**Solução:**
1. Verifique o App Secret
2. Verifique se o Verify Token está correto
3. Verifique a assinatura HMAC

## 📝 Exemplo de Teste via cURL

Após configurar, você pode testar com:

```bash
# Teste de verificação (GET)
curl -i 'https://seu-dominio.com/webhook?hub.mode=subscribe&hub.verify_token=catarinos_whatsapp_2026&hub.challenge=test123'

# Resposta esperada:
# HTTP/1.1 200 OK
# test123
```

## 🎯 Próximas Etapas

1. ✅ Configurar webhook na Meta
2. ⏳ Fazer deploy do servidor em produção
3. ⏳ Testar com mensagens reais
4. ⏳ Integrar com Core CRM

---

**Precisa de ajuda?** Verifique os logs do servidor ou a documentação da Meta em:
https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/
