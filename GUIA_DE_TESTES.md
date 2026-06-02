# Guia de Testes e Validação — WhatsApp Bridge

Este documento detalha todos os testes necessários para validar o funcionamento completo do microserviço `whatsapp-bridge` em produção.

---

## Estrutura de Testes

Os testes estão organizados em 5 níveis de complexidade, permitindo validação progressiva do sistema.

---

## Nível 1: Verificação de Conectividade

### Teste 1.1: Health Check

Valida se o serviço está online e respondendo.

**Comando:**
```bash
curl -v https://whatsapp.catarinosfull.com/health
```

**Esperado:**
- Status HTTP: `200 OK`
- Resposta JSON:
  ```json
  {
    "status": "ok",
    "service": "whatsapp-bridge",
    "timestamp": "2026-05-17T10:30:00.000Z"
  }
  ```

**Se falhar:**
- Verifique se o serviço está rodando
- Confirme se o domínio está acessível
- Verifique se há erro de certificado HTTPS

### Teste 1.2: Verificação de DNS

Valida se o domínio está resolvendo corretamente.

**Comando:**
```bash
nslookup whatsapp.catarinosfull.com
```

**Esperado:**
- O comando deve retornar um endereço IP válido

**Se falhar:**
- Verifique a configuração do DNS no seu provedor
- Aguarde a propagação do DNS (pode levar até 24h)

---

## Nível 2: Validação do Webhook

### Teste 2.1: Verificação de Handshake

Simula a verificação inicial que a Meta realiza.

**Comando:**
```bash
curl -v "https://whatsapp.catarinosfull.com/webhook?hub.mode=subscribe&hub.verify_token=catarinos_whatsapp_2026&hub.challenge=teste123"
```

**Esperado:**
- Status HTTP: `200 OK`
- Resposta: `teste123` (exatamente o valor do parâmetro `hub.challenge`)

**Se falhar:**
- Verifique se o `WHATSAPP_VERIFY_TOKEN` no `.env` é `catarinos_whatsapp_2026`
- Confirme se o serviço está respondendo corretamente

### Teste 2.2: Validação de Assinatura HMAC

Testa se o middleware de validação está funcionando corretamente.

**Comando:**
```bash
# Gerar uma assinatura HMAC válida
APP_SECRET="seu_app_secret"
PAYLOAD='{"object":"whatsapp_business_account","entry":[]}'
SIGNATURE="sha256=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$APP_SECRET" -hex | cut -d' ' -f2)"

# Enviar requisição com assinatura válida
curl -X POST https://whatsapp.catarinosfull.com/webhook \
  -H "Content-Type: application/json" \
  -H "x-hub-signature-256: $SIGNATURE" \
  -d "$PAYLOAD"
```

**Esperado:**
- Status HTTP: `200 OK`
- Resposta: `{"status":"received"}`

**Se receber erro 401:**
- Verifique se o `WHATSAPP_APP_SECRET` está correto
- Confirme se a assinatura foi calculada corretamente

---

## Nível 3: Testes de Banco de Dados

### Teste 3.1: Conexão com MySQL

Valida se o banco de dados local está acessível.

**Comando:**
```bash
mysql -h <host> -u <user> -p<password> -e "SELECT 1;"
```

**Esperado:**
- Retorno: `1`

**Se falhar:**
- Verifique se o MySQL está rodando
- Confirme se as credenciais estão corretas
- Verifique se o banco `whatsapp_bridge` foi criado

### Teste 3.2: Verificação de Tabelas

Valida se a tabela de logs foi criada corretamente.

**Comando:**
```bash
mysql -h <host> -u <user> -p<password> whatsapp_bridge -e "DESCRIBE whatsapp_messages_log;"
```

**Esperado:**
- Listagem de 15 colunas:
  - `id`, `wa_message_id`, `phone_number`, `contact_name`, `message_type`, `message_body`, `media_url`, `core_lead_id`, `lead_created`, `lead_updated`, `wa_timestamp`, `phone_number_id`, `processed`, `error_message`, `created_at`

**Se falhar:**
- Execute a migração: `npm run db:push`

### Teste 3.3: Verificação de Registros

Valida se há registros no banco (após enviar mensagens).

**Comando:**
```bash
mysql -h <host> -u <user> -p<password> whatsapp_bridge -e "SELECT COUNT(*) FROM whatsapp_messages_log;"
```

**Esperado:**
- Número de registros > 0 (após enviar mensagens)

---

## Nível 4: Testes de Integração com Core CRM

### Teste 4.1: Autenticação no Core

Valida se as credenciais do Service Account estão corretas.

**Comando:**
```bash
curl -X POST https://core.catarinosfull.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos@verificacao.com",
    "password": "Verifica@2026"
  }' | python3 -m json.tool
```

**Esperado:**
- Status HTTP: `200 OK`
- Resposta contém um campo `token`

**Se falhar:**
- Verifique se o email e senha estão corretos
- Confirme se o Core CRM está acessível

### Teste 4.2: Busca de Lead

Valida se a API de busca do Core está funcionando.

**Comando:**
```bash
TOKEN="<seu_token_do_core>"
curl -s "https://core.catarinosfull.com/api/leads?search=11999887766" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

**Esperado:**
- Status HTTP: `200 OK`
- Resposta contém lista de leads (pode estar vazia se não houver match)

**Se falhar:**
- Verifique se o token está válido
- Confirme se o Core CRM está acessível

### Teste 4.3: Criação de Lead

Valida se é possível criar um novo lead no Core.

**Comando:**
```bash
TOKEN="<seu_token_do_core>"
curl -X POST https://core.catarinosfull.com/api/leads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Teste WhatsApp",
    "phone": "11999887766",
    "source": "WhatsApp",
    "notes": "Lead de teste"
  }' | python3 -m json.tool
```

**Esperado:**
- Status HTTP: `201 Created` ou `200 OK`
- Resposta contém o ID do lead criado

**Se falhar:**
- Verifique se o token está válido
- Confirme se o formato dos dados está correto

---

## Nível 5: Teste Completo de Fluxo

### Teste 5.1: Envio de Mensagem Real

Este é o teste mais importante, validando o fluxo completo.

**Procedimento:**
1. Pegue um celular com WhatsApp instalado
2. Envie uma mensagem para o número WhatsApp Business configurado
3. Aguarde 5-10 segundos para o processamento

**Validação no Banco Local:**
```bash
mysql -h <host> -u <user> -p<password> whatsapp_bridge -e "SELECT * FROM whatsapp_messages_log ORDER BY id DESC LIMIT 1\G"
```

**Esperado:**
- Um novo registro com:
  - `phone_number`: seu número de celular
  - `message_body`: o texto que você enviou
  - `processed`: 1 (true)
  - `error_message`: NULL
  - `core_lead_id`: um número (ID do lead criado no Core)

**Validação no Core CRM:**
1. Acesse `https://core.catarinosfull.com`
2. Procure por um lead com seu número de telefone
3. Verifique:
   - Nome: seu nome do WhatsApp ou "WhatsApp XXXXXXXXXXX"
   - Telefone: seu número (sem código do país)
   - Source: "WhatsApp"
   - Notes: contém a mensagem que você enviou

**Se falhar:**
- Verifique os logs do servidor
- Consulte a tabela `whatsapp_messages_log` para mensagens de erro
- Verifique se o telefone está no formato correto (sem código do país)

### Teste 5.2: Teste de Idempotência

Valida se o sistema não duplica leads em caso de retry.

**Procedimento:**
1. Envie uma mensagem do celular
2. Aguarde o processamento (5-10 segundos)
3. Reenvie a **mesma mensagem** (se possível, ou simule um retry do webhook)

**Validação:**
```bash
# Verificar no banco local
mysql -h <host> -u <user> -p<password> whatsapp_bridge -e \
  "SELECT wa_message_id, COUNT(*) FROM whatsapp_messages_log GROUP BY wa_message_id HAVING COUNT(*) > 1;"
```

**Esperado:**
- Nenhum resultado (não há duplicatas de `wa_message_id`)

**Validação no Core CRM:**
1. Procure pelo lead criado
2. Verifique que há apenas **um** lead com esse número de telefone
3. Verifique que as notes contêm apenas **uma** cópia da mensagem

**Se falhar:**
- O sistema pode estar criando duplicatas
- Verifique se o campo `wa_message_id` está sendo armazenado corretamente

### Teste 5.3: Atualização de Lead Existente

Valida se o sistema atualiza leads existentes em vez de criar duplicatas.

**Procedimento:**
1. Envie uma primeira mensagem: "Olá, teste 1"
2. Aguarde o processamento
3. Envie uma segunda mensagem: "Olá, teste 2"
4. Aguarde o processamento

**Validação no Core CRM:**
1. Procure pelo lead
2. Verifique que há apenas **um** lead com seu número
3. Verifique que as notes contêm **ambas** as mensagens:
   ```
   [WhatsApp 17/05/2026 10:30:00] Olá, teste 1
   ---
   [WhatsApp 17/05/2026 10:35:00] Olá, teste 2
   ```

**Se falhar:**
- Verifique se a função `atualizarNotesLead` está funcionando
- Consulte os logs para mensagens de erro

---

## Nível 6: Testes de Tipos de Mensagem

### Teste 6.1: Mensagem de Texto

**Procedimento:** Envie uma mensagem de texto simples

**Esperado:** `message_type: "text"`, `message_body: "<seu_texto>"`

### Teste 6.2: Mensagem com Imagem

**Procedimento:** Envie uma imagem com caption

**Esperado:** `message_type: "image"`, `message_body: "<seu_caption>"` ou `"[Imagem]"`

### Teste 6.3: Mensagem com Áudio

**Procedimento:** Envie um áudio

**Esperado:** `message_type: "audio"`, `message_body: "[Áudio]"`

### Teste 6.4: Mensagem com Documento

**Procedimento:** Envie um documento (PDF, Word, etc.)

**Esperado:** `message_type: "document"`, `message_body: "[Documento: <nome_do_arquivo>]"`

### Teste 6.5: Mensagem com Localização

**Procedimento:** Envie uma localização

**Esperado:** `message_type: "location"`, `message_body: "[Localização: <latitude>, <longitude>]"`

---

## Checklist de Testes

Marque cada teste conforme for completado:

| Teste | Status |
|-------|--------|
| 1.1 — Health Check | [ ] |
| 1.2 — Verificação de DNS | [ ] |
| 2.1 — Handshake do Webhook | [ ] |
| 2.2 — Validação de Assinatura HMAC | [ ] |
| 3.1 — Conexão com MySQL | [ ] |
| 3.2 — Verificação de Tabelas | [ ] |
| 3.3 — Verificação de Registros | [ ] |
| 4.1 — Autenticação no Core | [ ] |
| 4.2 — Busca de Lead no Core | [ ] |
| 4.3 — Criação de Lead no Core | [ ] |
| 5.1 — Envio de Mensagem Real | [ ] |
| 5.2 — Teste de Idempotência | [ ] |
| 5.3 — Atualização de Lead Existente | [ ] |
| 6.1 — Mensagem de Texto | [ ] |
| 6.2 — Mensagem com Imagem | [ ] |
| 6.3 — Mensagem com Áudio | [ ] |
| 6.4 — Mensagem com Documento | [ ] |
| 6.5 — Mensagem com Localização | [ ] |

---

## Logs e Debugging

### Acessar Logs do Servidor

**Se usando PM2:**
```bash
pm2 logs whatsapp-bridge
```

**Se usando Docker:**
```bash
docker logs <container_id>
```

**Se usando Railway/Render:**
- Acesse o dashboard da plataforma e visualize os logs

### Analisar Logs de Erro

Procure por padrões como:
- `[Processor] Erro ao processar mensagem`
- `[CoreAPI] Erro ao buscar lead`
- `[Webhook] Assinatura inválida`

### Consultar Banco de Dados para Erros

```bash
mysql -h <host> -u <user> -p<password> whatsapp_bridge -e \
  "SELECT id, wa_message_id, phone_number, error_message FROM whatsapp_messages_log WHERE processed = 0 OR error_message IS NOT NULL;"
```

---

## Conclusão

Após completar todos os testes com sucesso, o sistema estará pronto para uso em produção. Se algum teste falhar, consulte o documento **GUIA_DE_DEPLOY.md**, seção "Troubleshooting".

---

*Documentação gerada por Manus AI — Maio/2026*
