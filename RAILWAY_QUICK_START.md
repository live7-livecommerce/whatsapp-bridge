# 🚀 Deploy Rápido no Railway (3 minutos)

## Passo 1: Acessar Railway

1. Acesse: https://railway.app
2. Clique em **"Login"** (ou crie conta com GitHub)
3. Faça login com sua conta GitHub (live7@live7.com.br)

## Passo 2: Criar Novo Projeto

1. Clique em **"Create New Project"** ou **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Procure por **"whatsapp-bridge"** na lista de repositórios
4. Clique em **"Import"**

## Passo 3: Configurar Variáveis de Ambiente

Após importar, Railway pedirá para configurar as variáveis. Preencha com:

```
DATABASE_URL=mysql://whatsapp:whatsapp123@mysql-prod:3306/whatsapp_bridge
META_APP_SECRET=781720edeb0ae55572a37576e933b8dd
META_ACCESS_TOKEN=EAAUZC3XPN3VcBRtFHgvHgjqTZAff0ZCqOSEcdIWFRK4TGLHbA4Gay3uMJVHncGxXB4XURIyc1ZB1MUjqOQROw0ywxZCkdQ3ZAiGWUhh7DGoEE7OAsr7Nk4cZA3AegQDFPoAsCykHg4HMI4FlwPLo2TZAhC7dyYUkjzZBM83ZC0EpaRQI8UuavVMqGQnZBwTZBeY2N6WH4fGx5ZBN2oL0oDZBS0NV2idN2NTTmPaMYBkjy0QOkjpvP1ljNCdn6gwpaQVyll8H7BvG62BCQaqzQvYRkDGv17HyOP
META_PHONE_NUMBER_ID=1151395758059878
META_VERIFY_TOKEN=catarinos_whatsapp_2026
CORE_API_URL=https://catacoreapp.manus.space
CORE_API_KEY=seu_service_api_key_aqui
NODE_ENV=production
```

## Passo 4: Adicionar Banco de Dados MySQL

1. No painel do Railway, clique em **"Add"** ou **"Add Service"**
2. Selecione **"MySQL"**
3. Configure:
   - **Username:** whatsapp
   - **Password:** whatsapp123
   - **Database:** whatsapp_bridge

Railway gerará automaticamente a `DATABASE_URL`

## Passo 5: Deploy

1. Railway fará o deploy automaticamente
2. Aguarde 2-3 minutos
3. Você verá um link como: `https://whatsapp-bridge-prod.railway.app`

## Passo 6: Obter URL Pública

1. No painel do Railway, clique no seu projeto
2. Vá para **"Deployments"**
3. Copie a URL pública (ex: `https://whatsapp-bridge-prod.railway.app`)

## Passo 7: Configurar Webhook na Meta

1. Acesse: https://developers.facebook.com/apps/1477595246746967/dashboard
2. Vá para **"Configuração"** → **"Webhook"**
3. Preencha:
   - **URL de callback:** `https://seu-url-railway.railway.app/webhook`
   - **Verificar token:** `catarinos_whatsapp_2026`
4. Clique em **"Verificar e salvar"**

## Passo 8: Testar

```bash
curl -X GET "https://seu-url-railway.railway.app/webhook?hub.mode=subscribe&hub.verify_token=catarinos_whatsapp_2026&hub.challenge=test123"
```

Resposta esperada: `test123`

## 🎉 Pronto!

Seu microserviço está em produção e recebendo webhooks da Meta!

---

## ⚠️ Troubleshooting

**Erro: "Database connection failed"**
- Verifique se a DATABASE_URL está correta
- Aguarde 30 segundos para o MySQL iniciar

**Erro: "Invalid signature"**
- Verifique se `META_APP_SECRET` está correto
- Verifique se `META_VERIFY_TOKEN` está correto

**Webhook não funciona**
- Verifique se a URL de callback está correta
- Verifique se o certificado SSL é válido
- Teste com: `curl -v https://seu-url/webhook`

---

**Precisa de ajuda?** Consulte `DEPLOYMENT.md` para instruções detalhadas.
