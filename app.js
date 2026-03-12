// Servidor Express + Follow-up Automático - Helena CRM
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== CONFIGURAÇÕES ==========
const HELENA_API_URL = 'https://api.wts.chat';
const HELENA_TOKEN = process.env.HELENA_TOKEN || 'pn_zff6DnFtKnpVMblIDHkhmQSH9gHnn9nF6LU6vbHnWQ';

// Templates aprovados no WhatsApp
const TEMPLATES = {
  DIA_1: 'ca4d6_reativacao',
  DIA_3: 'ca4d6_reativacao',
  DIA_7: 'ca4d6_reativacao',
  DIA_30: 'ca4d6_reativacao'
};

// Armazena histórico de seguintes enviados
let followupHistory = [];
let followupsSent = {
  dia_1: new Set(),
  dia_3: new Set(),
  dia_7: new Set(),
  dia_30: new Set()
};

let lastExecution = null;
let nextExecution = getNextExecution();

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.static('public'));

// ========== FUNÇÕES AUXILIARES ==========

function getNextExecution() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  return tomorrow;
}

function getDaysDifference(lastMessageDate) {
  const now = new Date();
  const lastDate = new Date(lastMessageDate);
  const diffTime = Math.abs(now - lastDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

async function getContacts() {
  try {
    const response = await axios.get(`${HELENA_API_URL}/contacts`, {
      headers: {
        'Authorization': `Bearer ${HELENA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.contacts || response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar contatos:', error.message);
    return [];
  }
}

async function getMessages(contactId) {
  try {
    const response = await axios.get(`${HELENA_API_URL}/messages/${contactId}`, {
      headers: {
        'Authorization': `Bearer ${HELENA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.messages || response.data;
  } catch (error) {
    console.error(`❌ Erro ao buscar mensagens do contato ${contactId}:`, error.message);
    return [];
  }
}

async function sendTemplate(phone, templateName, parameters = []) {
  try {
    const payload = {
      phone: phone,
      template: templateName,
      parameters: parameters
    };

    const response = await axios.post(`${HELENA_API_URL}/messages/template`, payload, {
      headers: {
        'Authorization': `Bearer ${HELENA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const logEntry = {
      timestamp: new Date(),
      phone: phone,
      template: templateName,
      status: 'success',
      message: `✅ Template "${templateName}" enviado para ${phone}`
    };
    followupHistory.push(logEntry);

    console.log(`✅ Template "${templateName}" enviado para ${phone}`);
    return response.data;
  } catch (error) {
    const logEntry = {
      timestamp: new Date(),
      phone: phone,
      template: templateName,
      status: 'error',
      message: `❌ Erro ao enviar para ${phone}: ${error.response?.data?.message || error.message}`
    };
    followupHistory.push(logEntry);

    console.error(`❌ Erro ao enviar template para ${phone}:`, error.response?.data || error.message);
    return null;
  }
}

// ========== LÓGICA PRINCIPAL ==========

async function processFollowups() {
  console.log('\n🚀 Iniciando processamento de follow-ups...');
  console.log(`⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n`);

  lastExecution = new Date();
  nextExecution = getNextExecution();

  const contacts = await getContacts();
  console.log(`📋 Total de contatos encontrados: ${contacts.length}\n`);

  let sentCount = 0;

  for (const contact of contacts) {
    const contactId = contact.id;
    const phone = contact.phone;
    const name = contact.name || 'Cliente';

    const messages = await getMessages(contactId);

    if (!messages || messages.length === 0) {
      console.log(`⚠️  Contato ${phone} sem mensagens, pulando...`);
      continue;
    }

    const lastMessage = messages[messages.length - 1];
    const lastMessageDate = lastMessage.created_at || lastMessage.timestamp;
    const daysSinceLastMessage = getDaysDifference(lastMessageDate);

    console.log(`👤 ${name} (${phone}) - Última msg há ${daysSinceLastMessage} dias`);

    if (daysSinceLastMessage === 1 && !followupsSent.dia_1.has(phone)) {
      await sendTemplate(phone, TEMPLATES.DIA_1, [name]);
      followupsSent.dia_1.add(phone);
      sentCount++;
    } else if (daysSinceLastMessage === 3 && !followupsSent.dia_3.has(phone)) {
      await sendTemplate(phone, TEMPLATES.DIA_3, [name]);
      followupsSent.dia_3.add(phone);
      sentCount++;
    } else if (daysSinceLastMessage === 7 && !followupsSent.dia_7.has(phone)) {
      await sendTemplate(phone, TEMPLATES.DIA_7, [name]);
      followupsSent.dia_7.add(phone);
      sentCount++;
    } else if (daysSinceLastMessage === 30 && !followupsSent.dia_30.has(phone)) {
      await sendTemplate(phone, TEMPLATES.DIA_30, [name]);
      followupsSent.dia_30.add(phone);
      sentCount++;
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Processamento concluído! ${sentCount} mensagens enviadas.\n`);
}

// ========== ROTAS ==========

// Dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    lastExecution: lastExecution,
    nextExecution: nextExecution,
    tokenConfigured: !!HELENA_TOKEN,
    totalSent: followupHistory.filter(l => l.status === 'success').length,
    totalErrors: followupHistory.filter(l => l.status === 'error').length
  });
});

// API: Histórico
app.get('/api/history', (req, res) => {
  res.json(followupHistory.slice(-50)); // Últimas 50
});

// API: Executar agora (teste)
app.post('/api/run-now', async (req, res) => {
  console.log('🧪 Execução manual disparada');
  processFollowups();
  res.json({ message: 'Follow-ups iniciados! Verifique o histórico em alguns segundos.' });
});

// ========== AGENDAMENTO ==========

// Executar todos os dias às 9h da manhã
cron.schedule('0 9 * * *', () => {
  console.log('⏰ CRON disparado - Executando follow-ups diários...');
  processFollowups();
}, {
  timezone: "America/Sao_Paulo"
});

// Para testes: executar imediatamente ao iniciar
if (process.env.RUN_NOW === 'true') {
  console.log('🧪 Modo teste ativado - Executando agora...');
  processFollowups();
}

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, () => {
  console.log(`\n🤖 Sistema de Follow-up iniciado!`);
  console.log(`🌐 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📅 Próxima execução: ${nextExecution.toLocaleString('pt-BR')}`);
  console.log(`🔑 Token configurado: ${HELENA_TOKEN ? 'SIM ✅' : 'NÃO ❌'}\n`);
});
