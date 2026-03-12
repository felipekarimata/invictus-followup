# 🤖 Sistema de Follow-up Automático - Helena CRM

Sistema simples que envia mensagens automáticas de follow-up via WhatsApp nos intervalos de **1, 3, 7 e 30 dias** após o último contato.

## 📋 Como Funciona

1. **Roda 1x por dia** às 9h da manhã (configurável)
2. **Busca todos os contatos** que já entraram em contato
3. **Calcula quantos dias** desde a última mensagem
4. **Envia o template correspondente** se for 1, 3, 7 ou 30 dias
5. **Registra o envio** para não duplicar

## 🚀 Como Usar

### 1. Pré-requisitos

- Node.js 16+ instalado
- Token da API Helena CRM
- Templates do WhatsApp aprovados

### 2. Instalação

```bash
# Clone ou baixe o projeto
cd helena-followup

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
nano .env  # Cole seu token aqui
```

### 3. Configuração

**Edite o arquivo `.env`:**

```env
HELENA_TOKEN=pn_seu_token_aqui
RUN_NOW=false
```

**Obter o token:**
1. Acesse a plataforma Helena
2. Vá em **Ajustes > Integrações > Integração via API**
3. Gere o token e copie

### 4. Configurar Templates

No arquivo `index.js`, altere os nomes dos templates:

```javascript
const TEMPLATES = {
  DIA_1: 'seu_template_1_dia',   // Nome exato do template no WhatsApp
  DIA_3: 'seu_template_3_dias',
  DIA_7: 'seu_template_7_dias',
  DIA_30: 'seu_template_30_dias'
};
```

**Exemplo de template no WhatsApp:**

```
Nome: followup_dia_1
Mensagem: Olá {{1}}! Vi que conversamos ontem. Como posso ajudar?
```

### 5. Executar

```bash
# Rodar em produção (aguarda horário agendado - 9h)
npm start

# Rodar em modo desenvolvimento (com auto-reload)
npm run dev

# Testar agora (executa imediatamente)
npm run test
```

## 🏗️ Estrutura de Arquivos

```
helena-followup/
├── index.js          # Código principal
├── package.json      # Dependências
├── .env             # Suas credenciais (NÃO commitar!)
├── .env.example     # Exemplo de configuração
└── README.md        # Este arquivo
```

## ⚙️ Configurações Avançadas

### Mudar horário de execução

No arquivo `index.js`, linha do cron:

```javascript
// Formato: minuto hora * * *
cron.schedule('0 9 * * *', ...);  // 9h da manhã
cron.schedule('0 14 * * *', ...); // 2h da tarde
cron.schedule('30 10 * * *', ...); // 10h30 da manhã
```

### Ajustar URL da API

Se a URL da Helena for diferente:

```javascript
const HELENA_API_URL = 'https://api.helena.app'; // Altere aqui
```

### Adicionar mais intervalos

```javascript
// No loop principal, adicione:
else if (daysSinceLastMessage === 15 && !followupsSent.dia_15.has(phone)) {
  await sendTemplate(phone, TEMPLATES.DIA_15, [name]);
  followupsSent.dia_15.add(phone);
}
```

## 📊 Estrutura Esperada da API Helena

### GET /contacts
```json
{
  "contacts": [
    {
      "id": "123",
      "phone": "5511999999999",
      "name": "João Silva"
    }
  ]
}
```

### GET /messages/:contactId
```json
{
  "messages": [
    {
      "created_at": "2024-03-10T10:00:00Z",
      "from": "customer",
      "text": "Olá!"
    }
  ]
}
```

### POST /messages/template
```json
{
  "phone": "5511999999999",
  "template": "followup_dia_1",
  "parameters": ["João"]
}
```

## 🌐 Onde Hospedar?

### ❌ **Vercel NÃO serve** para este caso

Vercel é para funções serverless, não mantém processos rodando 24/7.

### ✅ **Opções Recomendadas:**

#### 1. **Railway** (Mais Fácil) - RECOMENDADO
- ✅ Plano grátis com $5/mês de crédito
- ✅ Deploy super simples
- ✅ Mantém o processo rodando
- 🔗 https://railway.app

**Como fazer:**
```bash
# 1. Crie conta no Railway
# 2. Instale o CLI
npm i -g @railway/cli

# 3. Faça login
railway login

# 4. Inicialize o projeto
railway init

# 5. Configure as variáveis de ambiente no painel
# 6. Deploy!
railway up
```

#### 2. **Render** (Alternativa)
- ✅ Plano grátis
- ✅ Fácil de usar
- ⚠️ Pode hibernar após inatividade
- 🔗 https://render.com

#### 3. **Fly.io**
- ✅ Plano grátis generoso
- ✅ Boa performance
- 🔗 https://fly.io

#### 4. **VPS Tradicional** (Mais Controle)
- Digital Ocean ($6/mês)
- Linode ($5/mês)
- Contabo ($3/mês)

**Setup na VPS:**
```bash
# Conectar via SSH
ssh root@seu-servidor

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Clonar projeto
git clone seu-repositorio
cd helena-followup
npm install

# Rodar com PM2 (mantém rodando sempre)
npm install -g pm2
pm2 start index.js --name helena-followup
pm2 startup
pm2 save
```

## 🔍 Monitoramento

### Ver logs (Railway/Render)
No painel web da plataforma, clique em "Logs"

### Ver logs (VPS com PM2)
```bash
pm2 logs helena-followup
pm2 monit  # Dashboard interativo
```

## ⚠️ Importante

1. **Não commite o arquivo `.env`** com seu token!
2. **Templates precisam estar aprovados** no WhatsApp Business
3. **Teste primeiro** com poucos contatos
4. **Respeite a política** de mensagens do WhatsApp
5. **A API da Helena pode mudar**, ajuste os endpoints conforme necessário

## 🐛 Problemas Comuns

### "Unauthorized" / 401
- Verifique se o token está correto
- Confirme que está no formato `Bearer pn_...`

### Templates não enviando
- Confirme que os nomes dos templates estão exatos
- Verifique se estão aprovados no WhatsApp Business Manager

### CRON não roda
- Confirme que o servidor não foi desligado
- Verifique o timezone configurado

## 📞 Suporte

- Documentação Helena: https://helena.readme.io
- Issues neste projeto: [link do seu repo]

## 📄 Licença

MIT - Use como quiser! 🚀
