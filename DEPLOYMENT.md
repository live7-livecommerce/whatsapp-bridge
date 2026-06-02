# Guia de Deploy — WhatsApp Bridge

Instruções para fazer deploy do microserviço em diferentes plataformas.

---

## Deploy em Railway

### 1. Conectar repositório

1. Acessar [railway.app](https://railway.app)
2. Criar novo projeto → "Deploy from GitHub"
3. Conectar repositório do whatsapp-bridge

### 2. Configurar variáveis de ambiente

No dashboard do Railway:

1. Ir para **Variables**
2. Adicionar todas as variáveis do `.env`:
   - `DATABASE_URL`
   - `CORE_API_URL`
   - `CORE_SERVICE_EMAIL`
   - `CORE_SERVICE_PASSWORD`
   - `WHATSAPP_VERIFY_TOKEN`
   - `WHATSAPP_APP_SECRET`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `PORT=3001`
   - `NODE_ENV=production`

### 3. Configurar banco de dados

1. No Railway, adicionar um plugin MySQL
2. Copiar a `DATABASE_URL` gerada e adicionar às variáveis

### 4. Deploy

O deploy é automático quando você faz push para a branch principal.

---

## Deploy em Render

### 1. Criar novo Web Service

1. Acessar [render.com](https://render.com)
2. Criar novo Web Service
3. Conectar repositório do GitHub

### 2. Configurar build e start

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 3. Adicionar variáveis de ambiente

No dashboard do Render, adicionar todas as variáveis do `.env`.

### 4. Configurar banco de dados

1. Criar um MySQL database no Render
2. Copiar a `DATABASE_URL` e adicionar às variáveis

---

## Deploy em Cloud Run (Google Cloud)

### 1. Criar arquivo Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### 2. Build e push da imagem

```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/whatsapp-bridge
```

### 3. Deploy

```bash
gcloud run deploy whatsapp-bridge \
  --image gcr.io/PROJECT_ID/whatsapp-bridge \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=mysql://...,CORE_API_URL=...,etc
```

---

## Deploy em VPS (Manual)

### 1. Conectar ao servidor

```bash
ssh user@seu-vps.com
```

### 2. Instalar Node.js e MySQL

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL
sudo apt-get install -y mysql-server
```

### 3. Clonar repositório

```bash
git clone https://github.com/catarinosfull/whatsapp-bridge.git
cd whatsapp-bridge
```

### 4. Instalar dependências

```bash
npm install
npm run build
```

### 5. Configurar variáveis de ambiente

```bash
cp .env.example .env
nano .env  # editar com seus valores
```

### 6. Criar banco de dados

```bash
mysql -u root -p -e "CREATE DATABASE whatsapp_bridge;"
npm run db:push
```

### 7. Configurar PM2 (process manager)

```bash
sudo npm install -g pm2

# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'whatsapp-bridge',
    script: './dist/server/index.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 8. Configurar Nginx (reverse proxy)

```bash
sudo apt-get install -y nginx

# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/whatsapp-bridge
```

Adicionar:

```nginx
server {
    listen 80;
    server_name whatsapp.catarinosfull.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar:

```bash
sudo ln -s /etc/nginx/sites-available/whatsapp-bridge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Configurar SSL (Let's Encrypt)

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d whatsapp.catarinosfull.com
```

---

## Monitoramento

### Logs

```bash
# Railway/Render
# Acessar no dashboard

# VPS com PM2
pm2 logs whatsapp-bridge

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Health Check

```bash
curl https://whatsapp.catarinosfull.com/health
```

### Métricas

Considere usar ferramentas como:
- **New Relic** — APM e monitoramento
- **Sentry** — error tracking
- **DataDog** — observabilidade

---

## Troubleshooting

### Erro: "Cannot find module 'express'"

```bash
npm install
```

### Erro: "Database connection failed"

- Verifique se o MySQL está rodando
- Verifique se `DATABASE_URL` está correto
- Verifique se o banco foi criado

### Erro: "Port 3001 already in use"

```bash
# Encontrar processo usando a porta
lsof -i :3001

# Matar o processo
kill -9 <PID>
```

### Webhook não está recebendo mensagens

- Verifique se a URL está acessível: `curl https://whatsapp.catarinosfull.com/health`
- Verifique se o SSL está configurado corretamente
- Verifique se o webhook foi registrado na Meta

---

## Rollback

Se algo der errado:

```bash
# Railway/Render — revert para deploy anterior no dashboard

# VPS com PM2
pm2 restart whatsapp-bridge
```

---

## Atualizações

Para atualizar o código:

```bash
git pull origin main
npm install
npm run build
pm2 restart whatsapp-bridge  # ou redeploy no Railway/Render
```

---

Desenvolvido por **Catarino's** — Maio/2026
