# ⚡ Deploy Railway em 2 Minutos

## 1️⃣ Acessar Railway (30 segundos)
1. Acesse: https://railway.app/dashboard
2. Clique em **"New Project"** ou **"+"**
3. Selecione **"Deploy from GitHub repo"**

## 2️⃣ Importar Repositório (30 segundos)
1. Procure por **"whatsapp-bridge"** na lista
2. Clique em **"Import"**
3. Autorize se necessário

## 3️⃣ Configurar Variáveis (30 segundos)
Railway pedirá para configurar variáveis. Copie e cole:

```
DATABASE_URL=mysql://whatsapp:whatsapp123@mysql:3306/whatsapp_bridge
META_APP_SECRET=781720edeb0ae55572a37576e933b8dd
META_ACCESS_TOKEN=EAAUZC3XPN3VcBRtFHgvHgjqTZAff0ZCqOSEcdIWFRK4TGLHbA4Gay3uMJVHncGxXB4XURIyc1ZB1MUjqOQROw0ywxZCkdQ3ZAiGWUhh7DGoEE7OAsr7Nk4cZA3AegQDFPoAsCykHg4HMI4FlwPLo2TZAhC7dyYUkjzZBM83ZC0EpaRQI8UuavVMqGQnZBwTZBeY2N6WH4fGx5ZBN2oL0oDZBS0NV2idN2NTTmPaMYBkjy0QOkjpvP1ljNCdn6gwpaQVyll8H7BvG62BCQaqzQvYRkDGv17HyOP
META_PHONE_NUMBER_ID=1151395758059878
META_VERIFY_TOKEN=catarinos_whatsapp_2026
NODE_ENV=production
```

## 4️⃣ Adicionar MySQL (30 segundos)
1. Clique em **"Add"** ou **"+"**
2. Selecione **"MySQL"**
3. Pronto! Railway cria automaticamente

## ✅ Pronto!
Railway fará deploy em ~2 minutos. Você terá uma URL como:
```
https://whatsapp-bridge-prod.railway.app
```

## 🔗 Configurar Webhook na Meta
1. Acesse: https://developers.facebook.com/apps/1477595246746967/dashboard
2. Vá para **"Configuração"** → **"Webhook"**
3. Preencha:
   - **URL de callback:** `https://seu-url-railway.railway.app/webhook`
   - **Verificar token:** `catarinos_whatsapp_2026`
4. Clique em **"Verificar e salvar"**

🎉 **Pronto! Sistema em produção!**
