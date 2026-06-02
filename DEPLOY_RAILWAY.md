# 🚀 Guia: Deploy no Railway

## 📋 Pré-requisitos

- ✅ Conta no Railway (https://railway.app)
- ✅ Git instalado
- ✅ Repositório GitHub com o código
- ✅ Credenciais da Meta

---

## 🔧 Passo 1: Preparar o Repositório Git

### 1.1 Inicializar Git (se não tiver)

```bash
cd /home/ubuntu/whatsapp-bridge
git init
git add .
git commit -m "Initial commit: WhatsApp Bridge microservice"
```

### 1.2 Criar Repositório no GitHub

1. Vá para https://github.com/new
2. Crie um repositório chamado `whatsapp-bridge`
3. Não inicialize com README (já temos)

### 1.3 Fazer Push para GitHub

```bash
git remote add origin https://github.com/seu-usuario/whatsapp-bridge.git
git branch -M main
git push -u origin main
```

---

## 🚂 Passo 2: Conectar Railway ao GitHub

### 2.1 Acessar Railway

1. Vá para https://railway.app
2. Faça login com sua conta
3. Clique em **New Project**

### 2.2 Conectar GitHub

1. Clique em **Deploy from GitHub**
2. Autorize Railway a acessar seu GitHub
3. Selecione o repositório `whatsapp-bridge`
4. Clique em **Deploy**

Railway começará a fazer build automaticamente!

---

## 🗄️ Passo 3: Configurar Banco de Dados

### 3.1 Adicionar MySQL no Railway

1. No dashboard do Railway
2. Clique em **+ New**
3. Selecione **MySQL**
4. Railway criará um banco de dados automaticamente

### 3.2 Obter Credenciais do Banco

1. Clique em **MySQL** no dashboard
2. Vá para a aba **Variables**
3. Copie as variáveis:
   - `MYSQL_HOST`
   - `MYSQL_PORT`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DB`

---

## 🔐 Passo 4: Configurar Variáveis de Ambiente

### 4.1 Acessar Configurações do App

1. No dashboard, clique em seu app `whatsapp-bridge`
2. Vá para a aba **Variables**

### 4.2 Adicionar Variáveis de Ambiente

Clique em **+ New Variable** e adicione:

```env
# Meta WhatsApp
META_APP_ID=1477595246746967
META_APP_SECRET=781720edeb0ae55572a37576e933b8dd
META_ACCESS_TOKEN=EAAUZC3XPN3VcBRtFHgvHgjqTZAff0ZCqOSEcdIWFRK4TGLHbA4Gay3uMJVHncGxXB4XURIyc1ZB1MUjqOQROw0ywxZCkdQ3ZAiGWUhh7DGoEE7OAsr7Nk4cZA3AegQDFPoAsCykHg4HMI4FlwPLo2TZAhC7dyYUkjzZBM83ZC0EpaRQI8UuavVMqGQnZBwTZBeY2N6WH4fGx5ZBN2oL0oDZBS0NV2idN2NTTmPaMYBkjy0QOkjpvP1ljNCdn6gwpaQVyll8H7BvG62BCQaqzQvYRkDGv17HyOP
META_PHONE_NUMBER_ID=1151395758059878
META_BUSINESS_ACCOUNT_ID=963906806623440
META_VERIFY_TOKEN=catarinos_whatsapp_2026

# Core CRM
CORE_API_URL=https://catacoreapp.manus.space
CORE_API_KEY=seu_service_api_key_aqui
CORE_API_TIMEOUT_MS=30000

# Servidor
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Banco de Dados (Railway fornecerá automaticamente)
# DATABASE_URL será gerado automaticamente pelo Railway
```

### 4.3 Conectar Banco de Dados Automaticamente

Railway conecta o MySQL automaticamente! Você verá:

```
DATABASE_URL=mysql://user:password@host:port/database
```

---

## 🌐 Passo 5: Obter URL Pública

### 5.1 Acessar Domínio do Railway

1. No dashboard, clique em seu app
2. Vá para a aba **Deployments**
3. Procure por **Railway Provided Domain**
4. Copie a URL (ex: `https://whatsapp-bridge-production.up.railway.app`)

### 5.2 Usar Domínio Customizado (Opcional)

Se tiver um domínio próprio (ex: `whatsapp.catarinosfull.com`):

1. Vá para **Settings** do app
2. Procure por **Domains**
3. Clique em **+ Add Domain**
4. Digite seu domínio
5. Configure DNS no seu provedor:
   ```
   CNAME: seu-dominio.com → railway.app
   ```

---

## 🗄️ Passo 6: Executar Migrações do Banco

### 6.1 Conectar via SSH do Railway

1. No dashboard, clique em seu app
2. Vá para **Shell**
3. Execute:

```bash
npm run db:push
```

Isso criará as tabelas no banco de dados!

---

## ✅ Passo 7: Validar Deploy

### 7.1 Verificar Status do Deploy

1. Vá para a aba **Deployments**
2. Verifique se o status é **Success** (verde)

### 7.2 Testar Webhook

Acesse a URL pública:

```bash
curl -i 'https://[sua-url]/webhook?hub.mode=subscribe&hub.verify_token=catarinos_whatsapp_2026&hub.challenge=test123'
```

Você deve receber:
```
HTTP/1.1 200 OK
test123
```

### 7.3 Verificar Logs

1. No dashboard, clique em seu app
2. Vá para **Logs**
3. Procure por `[WhatsApp Bridge] Servidor rodando na porta 3000`

---

## 🔗 Passo 8: Configurar Webhook na Meta

Agora que tem uma URL pública, configure o webhook na Meta:

1. Vá para Meta Developers
2. Selecione seu app
3. Vá para **WhatsApp → Configuração**
4. Em **Webhook**, clique em **Editar**
5. Preencha:
   - **Callback URL:** `https://[sua-url]/webhook`
   - **Verify Token:** `catarinos_whatsapp_2026`
6. Clique em **Verificar e salvar**

Veja o guia completo em `CONFIGURAR_WEBHOOK_META.md`

---

## 📊 Passo 9: Monitorar em Produção

### 9.1 Acessar Logs em Tempo Real

```bash
# Via Railway CLI
railway logs -f

# Ou via dashboard
# Clique em Logs no dashboard
```

### 9.2 Configurar Alertas

1. No dashboard, vá para **Settings**
2. Procure por **Alerts**
3. Configure alertas para:
   - Deployment failed
   - High memory usage
   - High CPU usage

---

## 🔄 Passo 10: Atualizar Código

Quando quiser fazer deploy de novas versões:

```bash
# Fazer mudanças no código
git add .
git commit -m "Update: [descrição das mudanças]"
git push origin main
```

Railway fará deploy automaticamente!

---

## 🚨 Troubleshooting

### Problema: "Build Failed"

**Solução:**
1. Verifique os logs de build
2. Verifique se `package.json` está correto
3. Verifique se há erros de TypeScript

### Problema: "Application crashed"

**Solução:**
1. Verifique os logs em tempo real
2. Verifique se `DATABASE_URL` está configurado
3. Verifique se todas as variáveis de ambiente estão definidas

### Problema: "Cannot connect to database"

**Solução:**
1. Verifique se MySQL está rodando no Railway
2. Verifique se `DATABASE_URL` está correto
3. Execute migrações: `npm run db:push`

### Problema: "Webhook não recebe mensagens"

**Solução:**
1. Verifique se a URL é acessível
2. Verifique se o certificado SSL é válido
3. Verifique os logs da Meta

---

## 📈 Monitoramento em Produção

### Métricas Importantes

- **Uptime:** Deve estar acima de 99%
- **Response Time:** Deve estar abaixo de 500ms
- **Error Rate:** Deve estar abaixo de 0.1%
- **Memory Usage:** Deve estar abaixo de 512MB

### Logs para Monitorar

```
[Webhook] Mensagem recebida: type=text
[DB] Mensagem salva: id=1
[Core API] Lead criado: id=123
[Error] Falha ao processar: [erro]
```

---

## 🎉 Conclusão

Seu whatsapp-bridge está agora em produção no Railway!

**Checklist Final:**
- ✅ Código em GitHub
- ✅ Deploy no Railway
- ✅ Banco de dados MySQL
- ✅ Variáveis de ambiente configuradas
- ✅ Webhook na Meta configurado
- ✅ Logs monitorados
- ✅ Pronto para receber mensagens!

**Status: PRONTO PARA PRODUÇÃO** 🚀

---

## 📞 Próximos Passos

1. Testar com mensagens reais do WhatsApp
2. Integrar com Core CRM
3. Implementar respostas automáticas
4. Configurar alertas e monitoramento
5. Documentar SLAs e runbooks
