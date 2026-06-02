# Troubleshooting - WhatsApp Bridge no Railway

## Problema: Servidor não responde (502 Bad Gateway)

### Causa 1: Variável PORT não configurada

O servidor Express precisa saber em qual porta ouvir.

**Solução:**
1. Acesse Railway → Variables
2. Adicione a variável `PORT` com valor `3000`
3. Faça restart do deployment

### Causa 2: Banco de dados não conecta

O `DATABASE_URL` pode estar incorreto ou o MySQL pode não estar pronto.

**Verificar:**
1. Acesse Railway → MySQL → Database
2. Copie a URL de conexão completa
3. Verifique se o formato é: `mysql://user:password@host:port/database`

**Solução:**
1. Vá para Variables
2. Atualize `DATABASE_URL` com: `${{MySQL.DATABASE_URL}}`
3. Faça restart

### Causa 3: Erro na compilação TypeScript

O código pode não estar compilando corretamente.

**Verificar:**
1. Acesse Railway → Logs
2. Procure por erros de compilação (error, failed, etc.)
3. Se houver erro, corrija o arquivo e faça novo push para GitHub

### Causa 4: Porta bloqueada ou conflito

O servidor pode estar tentando usar uma porta que já está em uso.

**Solução:**
1. Verifique se há múltiplas instâncias rodando
2. Reduza para 1 Replica em Railway → Settings
3. Faça restart

## Passos para Diagnosticar

### 1. Verificar Status do Deployment
```
Railway Dashboard → Deployments
Procure por: "Crashed", "Failed", "Building"
```

### 2. Verificar Logs
```
Railway Dashboard → Logs
Procure por: "error", "Error", "ERROR", "failed"
```

### 3. Verificar Variáveis de Ambiente
```
Railway Dashboard → Variables
Confirme que todas as 12 variáveis estão preenchidas
```

### 4. Verificar Banco de Dados
```
Railway Dashboard → MySQL → Database
Confirme que o MySQL está "Online"
```

### 5. Testar Webhook Manualmente
```bash
curl -v "https://whatsapp-bridge-production-0b3e.up.railway.app/webhook?hub.mode=subscribe&hub.verify_token=catarinos_whatsapp_2026&hub.challenge=test123"
```

## Solução Rápida

Se nada funcionar:

1. **Adicionar variável PORT:**
   - Nome: `PORT`
   - Valor: `3000`
   - Salvar e fazer restart

2. **Verificar DATABASE_URL:**
   - Deve ser: `${{MySQL.DATABASE_URL}}`
   - Não: `mysql://localhost:3306/...`

3. **Fazer restart do deployment:**
   - Railway → Deployments
   - Clicar em "Restart"

4. **Aguardar 30 segundos e testar novamente:**
   ```bash
   curl "https://whatsapp-bridge-production-0b3e.up.railway.app/webhook?hub.mode=subscribe&hub.verify_token=catarinos_whatsapp_2026&hub.challenge=test123"
   ```

## Se Ainda Não Funcionar

1. Verifique o arquivo `server/index.ts` - porta deve ser `process.env.PORT || 3000`
2. Verifique o arquivo `package.json` - script `start` deve ser `node dist/server/index.js`
3. Verifique se o build está gerando os arquivos em `dist/`

## Contato para Suporte

Se o problema persistir:
1. Compartilhe os logs do Railway
2. Verifique se todas as variáveis estão corretas
3. Tente fazer um novo push para GitHub para forçar um novo deploy
