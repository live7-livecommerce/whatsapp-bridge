# Guia de Deploy e Configuração — WhatsApp Bridge

Este documento detalha o processo completo para colocar o microserviço `whatsapp-bridge` em produção, incluindo o deploy do código, a configuração da conta Meta (WhatsApp Business), a realização de testes e a resolução de problemas comuns.

---

## 1. Deploy do Serviço

O microserviço pode ser implantado de duas maneiras principais, dependendo da infraestrutura escolhida.

### Opção A: Deploy via Manus WebDev

Se o projeto foi criado utilizando a infraestrutura WebDev do Manus, siga estes passos:

1. **Configurar Variáveis de Ambiente:**
   No painel do projeto Manus, adicione as seguintes *secrets*:

   ```env
   # Core CRM (OBRIGATÓRIO)
   CORE_API_URL=https://core.catarinosfull.com
   CORE_SERVICE_EMAIL=carlos@verificacao.com
   CORE_SERVICE_PASSWORD=Verifica@2026

   # Meta WhatsApp (OBRIGATÓRIO — preencher com dados reais da Meta)
   WHATSAPP_VERIFY_TOKEN=catarinos_whatsapp_2026
   WHATSAPP_APP_SECRET=<App Secret do Meta Developers>
   WHATSAPP_ACCESS_TOKEN=<System User Token do Meta Developers>
   WHATSAPP_PHONE_NUMBER_ID=<Phone Number ID do Meta Developers>
   ```

2. **Executar Migração do Banco de Dados:**
   ```bash
   pnpm db:push
   ```

3. **Verificar o Serviço:**
   ```bash
   curl https://<DOMINIO_DO_PROJETO>/health
   ```
   O retorno esperado é: `{"status":"ok","service":"whatsapp-bridge","timestamp":"..."}`

4. **Configurar Domínio Personalizado:**
   - No painel Manus (Settings → Domains), adicione `whatsapp.catarinosfull.com`.
   - No seu provedor de DNS (ex: Cloudflare), crie um registro CNAME apontando `whatsapp` para o domínio fornecido pelo Manus.

### Opção B: Deploy em VPS, Railway ou Render

Para implantação em outras plataformas, consulte o arquivo `DEPLOYMENT.md` incluído no repositório do projeto, que contém instruções detalhadas para cada ambiente.

---

## 2. Configuração da Conta Meta (WhatsApp Business)

Para que o webhook funcione, é necessário configurar corretamente o aplicativo na plataforma Meta Developers.

### 2.1. Criação do Aplicativo

1. Acesse o [Meta Developers](https://developers.facebook.com/apps/).
2. Clique em **"Criar App"** e selecione o tipo **Business**.
3. Nomeie o aplicativo (ex: `Catarinos WhatsApp`) e selecione a conta Business Manager da sua empresa.
4. Após a criação, no menu lateral, vá em **Adicionar Produto → WhatsApp → Configurar**.

### 2.2. Registro do Número

1. Navegue até **App → WhatsApp → Getting Started**.
2. Vincule um número Business existente ou utilize o número de teste fornecido pela Meta.
3. Anote o **Phone Number ID** e adicione-o à variável `WHATSAPP_PHONE_NUMBER_ID` no arquivo `.env`.

### 2.3. Obtenção do App Secret

1. Vá para **App → Settings → Basic**.
2. Copie o valor do campo **App Secret**.
3. Adicione-o à variável `WHATSAPP_APP_SECRET` no arquivo `.env`.

### 2.4. Geração do Token de Acesso Permanente

**Importante:** O token temporário exibido na tela de API Setup expira em 24 horas. Para uso em produção, um token permanente é obrigatório.

1. Acesse **App → WhatsApp → API Setup**.
2. Na seção "System User Token" ou "Permanent Token", crie um System User (se necessário) em **Business Settings → System Users**.
3. Atribua as permissões `whatsapp_business_messaging` e `whatsapp_business_management`.
4. Gere o token permanente, copie-o e adicione-o à variável `WHATSAPP_ACCESS_TOKEN` no arquivo `.env`.

### 2.5. Configuração do Webhook

1. Navegue até **App → WhatsApp → Configuration**.
2. Na seção **Webhook**, preencha:
   - **Callback URL:** `https://whatsapp.catarinosfull.com/webhook`
   - **Verify Token:** `catarinos_whatsapp_2026` (deve corresponder ao valor no `.env`)
3. Clique em **"Verify and Save"**. A Meta enviará uma requisição GET para validar a URL.
4. Após a verificação bem-sucedida, na seção **Webhook Fields**, marque a opção **"messages"** e clique em **"Subscribe"**.

---

## 3. Testes de Validação

Após a configuração, execute os seguintes testes para garantir o funcionamento correto.

### Teste 1: Health Check
Verifique se o serviço está online e respondendo.
```bash
curl https://whatsapp.catarinosfull.com/health
```
**Esperado:** `{"status":"ok","service":"whatsapp-bridge","timestamp":"..."}`

### Teste 2: Verificação do Webhook
Simule a requisição de verificação da Meta.
```bash
curl "https://whatsapp.catarinosfull.com/webhook?hub.mode=subscribe&hub.verify_token=catarinos_whatsapp_2026&hub.challenge=teste123"
```
**Esperado:** `teste123`

### Teste 3: Envio de Mensagem Real
1. Envie uma mensagem do seu celular para o número WhatsApp Business configurado.
2. Verifique o registro no banco de dados local:
   ```sql
   SELECT * FROM whatsapp_messages_log ORDER BY id DESC LIMIT 5;
   ```
3. Verifique no Core CRM (`core.catarinosfull.com`):
   - Um novo lead deve ter sido criado com nome, telefone e origem "WhatsApp".
   - Se o lead já existia, as notas (notes) devem ter sido atualizadas com o conteúdo da mensagem.

### Teste 4: Idempotência
1. Reenvie o mesmo payload de webhook (ou a mesma mensagem).
2. Confirme que nenhum lead duplicado foi criado no Core CRM.
3. Confirme que há apenas um registro no banco local para o `wa_message_id` correspondente.

### Teste 5: Verificação via API do Core
Busque o lead criado utilizando a API do Core CRM.
```bash
curl -s "https://core.catarinosfull.com/api/leads?search=TELEFONE_DO_CELULAR" \
  -H "Authorization: Bearer TOKEN" | python3 -m json.tool
```

---

## 4. Checklist Final

Antes de considerar o deploy concluído, verifique todos os itens abaixo:

| Item | Status |
|------|--------|
| Serviço rodando e acessível via HTTPS | [ ] |
| Health check retorna 200 OK | [ ] |
| Domínio `whatsapp.catarinosfull.com` funcionando | [ ] |
| Variáveis de ambiente configuradas (Core + Meta) | [ ] |
| Migração do banco executada (`pnpm db:push` ou equivalente) | [ ] |
| Webhook verificado na Meta (Verify and Save OK) | [ ] |
| Campo "messages" subscrito no webhook | [ ] |
| Teste com mensagem real: lead criado/atualizado no Core | [ ] |
| Teste de idempotência: sem duplicação de registros | [ ] |

---

## 5. Troubleshooting (Resolução de Problemas)

### Falha no "Verify and Save" da Meta
- Confirme se o serviço está rodando (`curl https://whatsapp.catarinosfull.com/health`).
- Verifique se o `WHATSAPP_VERIFY_TOKEN` no `.env` é idêntico ao inserido na Meta.
- Certifique-se de que o domínio possui um certificado HTTPS válido (exigência da Meta).
- Analise os logs do servidor para confirmar o recebimento da requisição GET.

### Mensagem Enviada, mas Lead Não Aparece no Core
- Verifique os logs do servidor em busca de erros.
- Consulte a tabela `whatsapp_messages_log` e analise os campos `processed` e `error_message`.
- Confirme se as credenciais do Core CRM estão corretas.
- Verifique o formato do telefone (o Core espera DDD + número, sem o código do país).

### Lead Criado, mas Sem Mensagem nas Notas
- Confirme se o endpoint `PUT /api/leads/:id` do Core CRM aceita atualizações no campo de notas.
- Verifique os logs para identificar possíveis falhas na função `atualizarNotesLead`.

### Webhook Recebe a Requisição, mas Não Processa
- Verifique se o `WHATSAPP_APP_SECRET` está correto para a validação da assinatura HMAC.
- Analise os logs em busca de mensagens como "[Webhook] Request sem assinatura" ou "[Webhook] Assinatura inválida".

---

## Próximos Passos

Com o fluxo ativo, o processo ocorrerá da seguinte forma:
**Cliente envia WhatsApp → Meta dispara webhook → whatsapp-bridge processa → Lead é registrado no Core CRM.**

A próxima etapa (Etapa 2) consistirá em exibir o histórico de mensagens do WhatsApp na ficha do lead no CRM Frontend.

---
*Documentação gerada por Manus AI — Maio/2026*
