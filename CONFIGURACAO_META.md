# Guia Detalhado: Configuração da Meta (WhatsApp Business)

Este documento fornece instruções passo a passo para configurar a conta Meta (WhatsApp Business) e conectá-la ao microserviço `whatsapp-bridge`.

---

## Pré-requisitos

- Conta no [Meta Developers](https://developers.facebook.com/)
- Acesso a uma conta Business Manager
- Um número de telefone para WhatsApp Business (pode ser um número de teste fornecido pela Meta)
- Acesso ao domínio `whatsapp.catarinosfull.com` com HTTPS válido

---

## Passo 1: Criar o Aplicativo

### 1.1. Acessar Meta Developers

1. Navegue até [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/).
2. Faça login com sua conta Meta.

### 1.2. Criar Novo Aplicativo

1. Clique no botão **"Criar App"** (ou **"Create App"** se em inglês).
2. Na janela de diálogo, selecione o tipo **Business** (não Consumer).
3. Preencha os seguintes campos:
   - **Nome do App:** `Catarinos WhatsApp` (ou o nome que preferir)
   - **Email de Contato da App:** seu email corporativo
   - **Conta Business Manager:** selecione a conta da sua empresa
4. Clique em **"Criar App"**.

### 1.3. Adicionar Produto WhatsApp

1. Após a criação, você será redirecionado para o dashboard do aplicativo.
2. No painel lateral esquerdo, procure a seção **"Adicionar Produto"** ou **"Add Product"**.
3. Localize **WhatsApp** na lista de produtos disponíveis.
4. Clique em **"Configurar"** (ou **"Setup"**).

---

## Passo 2: Registrar Número de WhatsApp Business

### 2.1. Acessar Getting Started

1. No menu lateral, vá para **WhatsApp → Getting Started**.
2. Você verá opções para registrar um número.

### 2.2. Opções de Número

**Opção A: Número Existente**
- Se sua empresa já possui um número WhatsApp Business, clique em **"Usar número existente"** e siga as instruções.

**Opção B: Número de Teste**
- A Meta oferece um número de teste para desenvolvimento. Clique em **"Usar número de teste"** para obter um número temporário.

### 2.3. Anotar o Phone Number ID

1. Após registrar o número, a Meta exibirá o **Phone Number ID**.
2. **Copie este ID** e adicione-o à variável de ambiente:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=<seu_phone_number_id>
   ```

---

## Passo 3: Obter App Secret

### 3.1. Acessar Configurações Básicas

1. No menu lateral, vá para **Settings → Basic** (ou **Configurações → Básico**).

### 3.2. Copiar App Secret

1. Na seção **App Secret**, você verá um campo com um valor oculto.
2. Clique no ícone de "olho" para revelar o valor.
3. **Copie o App Secret** e adicione-o à variável de ambiente:
   ```env
   WHATSAPP_APP_SECRET=<seu_app_secret>
   ```

> **Segurança:** Nunca compartilhe o App Secret. Trate-o como uma senha.

---

## Passo 4: Gerar Token de Acesso Permanente

### 4.1. Acessar API Setup

1. No menu lateral, vá para **WhatsApp → API Setup**.

### 4.2. Criar System User (se necessário)

Se você ainda não tem um System User:

1. Vá para **Business Settings → System Users** (em uma nova aba).
2. Clique em **"Adicionar"** (ou **"Add"**).
3. Preencha o nome do usuário (ex: `whatsapp-bridge-user`).
4. Selecione o tipo **Employee** (não Admin).
5. Clique em **"Criar System User"**.

### 4.3. Atribuir Permissões

1. Após criar o System User, clique nele para abrir os detalhes.
2. Na seção **Roles**, clique em **"Atribuir Roles"** (ou **"Assign Roles"**).
3. Procure e selecione as seguintes permissões:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Clique em **"Salvar"** (ou **"Save"**).

### 4.4. Gerar Token Permanente

1. Volte para **WhatsApp → API Setup**.
2. Na seção **"System User Token"** ou **"Permanent Token"**, selecione o System User que você criou.
3. Clique em **"Gerar Token"** (ou **"Generate Token"**).
4. Uma janela exibirá o token. **Copie-o imediatamente** e adicione-o à variável de ambiente:
   ```env
   WHATSAPP_ACCESS_TOKEN=<seu_access_token>
   ```

> **Nota:** Este token não expira (ou expira em um período muito longo). Armazene-o com segurança.

---

## Passo 5: Configurar Webhook

### 5.1. Acessar Configuração de Webhook

1. No menu lateral, vá para **WhatsApp → Configuration** (ou **Configuração**).

### 5.2. Preencher Dados do Webhook

Na seção **Webhook**, preencha os seguintes campos:

- **Callback URL:** `https://whatsapp.catarinosfull.com/webhook`
- **Verify Token:** `catarinos_whatsapp_2026` (deve corresponder ao valor de `WHATSAPP_VERIFY_TOKEN` no `.env`)

### 5.3. Verificar e Salvar

1. Clique em **"Verify and Save"** (ou **"Verificar e Salvar"**).
2. A Meta enviará uma requisição GET para sua URL para validar:
   - Se o domínio está acessível
   - Se o HTTPS é válido
   - Se o Verify Token está correto
3. Se tudo estiver correto, você verá uma mensagem de sucesso.

> **Se receber erro:** Verifique se o serviço `whatsapp-bridge` está rodando e acessível publicamente. Consulte a seção de Troubleshooting.

### 5.4. Subscrever ao Campo "messages"

1. Após a verificação bem-sucedida, você verá a seção **Webhook Fields**.
2. Localize o campo **"messages"** e marque a caixa de seleção.
3. Clique em **"Subscribe"** (ou **"Subscrever"**).

---

## Passo 6: Resumo das Variáveis de Ambiente

Após completar todos os passos, você terá as seguintes variáveis para adicionar ao arquivo `.env`:

```env
# Core CRM
CORE_API_URL=https://core.catarinosfull.com
CORE_SERVICE_EMAIL=carlos@verificacao.com
CORE_SERVICE_PASSWORD=Verifica@2026

# Meta WhatsApp
WHATSAPP_VERIFY_TOKEN=catarinos_whatsapp_2026
WHATSAPP_APP_SECRET=<seu_app_secret_da_meta>
WHATSAPP_ACCESS_TOKEN=<seu_token_permanente>
WHATSAPP_PHONE_NUMBER_ID=<seu_phone_number_id>

# Servidor
PORT=3001
NODE_ENV=production
```

---

## Teste de Verificação

Após configurar o webhook, teste se a verificação funcionou:

```bash
curl "https://whatsapp.catarinosfull.com/webhook?hub.mode=subscribe&hub.verify_token=catarinos_whatsapp_2026&hub.challenge=teste123"
```

**Esperado:** `teste123`

Se receber um erro, verifique:
- Se o serviço está rodando
- Se o Verify Token está correto
- Se o HTTPS é válido

---

## Próximos Passos

Com a configuração da Meta concluída, o fluxo estará ativo:

1. Um cliente envia uma mensagem para o número WhatsApp Business.
2. A Meta dispara um webhook para `https://whatsapp.catarinosfull.com/webhook`.
3. O microserviço `whatsapp-bridge` processa a mensagem.
4. Um lead é criado ou atualizado no Core CRM.

Para testar o fluxo completo, consulte o documento **GUIA_DE_DEPLOY.md**, seção "Testes de Validação".

---

## Troubleshooting

### "Verify and Save" falha
- Confirme se o serviço está rodando: `curl https://whatsapp.catarinosfull.com/health`
- Verifique se o Verify Token está correto
- Certifique-se de que o HTTPS é válido (a Meta exige certificado válido)

### Token expirado
- Se o token temporário expirou, gere um novo token permanente via System User

### Webhook não recebe mensagens
- Verifique se o campo "messages" foi subscrito
- Confirme se o webhook foi verificado com sucesso

---

*Documentação gerada por Manus AI — Maio/2026*
