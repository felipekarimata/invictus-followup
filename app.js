// 🚀 Helena Follow-up System v2 - PROFISSIONAL
// URL correta: https://api.helena.run
// Com banco de dados SQLite + Seleção de números + Templates dinâmicos

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ========== CONFIGURAÇÕES ==========
const HELENA_API_URL = process.env.HELENA_API_URL || 'https://api.helena.run';
const HELENA_TOKEN = process.env.HELENA_TOKEN;

// Global DB instance
let database = null;

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.static('public'));

// ========== FUNÇÕES AUXILIARES ==========

function getDaysDifference(lastMessageDate) {
  const now = new Date();
  const lastDate = new Date(lastMessageDate);
  const diffTime = Math.abs(now - lastDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Get Account Info
async function getAccount() {
  try {
    const response = await axios.get(`${HELENA_API_URL}/core/v1/account`, {
      headers: {
        'Authorization': `Bearer ${HELENA_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar conta:', error.message);
    return null;
  }
}

// Get Channels (WhatsApp Numbers)
async function getChannels() {
  try {
    const response = await axios.get(`${HELENA_API_URL}/chat/v1/channel`, {
      headers: {
        'Authorization': `Bearer ${HELENA_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    return response.data.channels || response.data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar canais:', error.message);
    return [];
  }
}

// Get Templates
async function getTemplates() {
  try {
    const response = await axios.get(`${HELENA_API_URL}/chat/v1/template`, {
      headers: {
        'Authorization': `Bearer ${HELENA_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    return response.data.templates || response.data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar templates:', error.message);
    return [];
  }
}

// Get Contacts with filters
async function getContacts(filters = {}) {
  try {
    let url = `${HELENA_API_URL}/core/v1/contact?Status=ACTIVE&PageSize=100`;

    // Add filters
    if (filters.tags && filters.tags.length > 0) {
      url += `&Tags=${filters.tags.join(',')}`;
    }

    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${HELENA_TOKEN}`,
        'Accept': 'application/json'
      }
    });
    return response.data.contact || response.data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar contatos:', error.message);
    return [];
  }
}

// Get Messages for Contact
async function getMessages(contactId) {
  try {
    const response = await axios.get(
      `${HELENA_API_URL}/core/v1/contact/${contactId}`,
      {
        headers: {
          'Authorization': `Bearer ${HELENA_TOKEN}`,
          'Accept': 'application/json'
        }
      }
    );
    return response.data.messages || response.data.chat || [];
  } catch (error) {
    console.error(`❌ Erro ao buscar mensagens: ${error.message}`);
    return [];
  }
}

// Send Template
async function sendTemplate(phone, templateId, templateName, channelId, parameters = []) {
  try {
    const payload = {
      to: phone.startsWith('+') ? phone : `+${phone}`,
      templateId: templateId,
      parameters: parameters.length > 0 ? { name: parameters[0] } : {}
    };

    if (channelId) {
      payload.channelId = channelId;
    }

    const response = await axios.post(
      `${HELENA_API_URL}/chat/v1/scheduled-message`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${HELENA_TOKEN}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    await db.logCampaign(database, {
      contactId: phone,
      phone: phone,
      templateId: templateId,
      templateName: templateName,
      channelId: channelId,
      status: 'success',
      message: `✅ Template enviado para ${phone}`
    });

    console.log(`✅ Template "${templateName}" enviado para ${phone}`);
    return response.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;

    await db.logCampaign(database, {
      contactId: phone,
      phone: phone,
      templateId: templateId,
      templateName: templateName,
      channelId: channelId,
      status: 'error',
      message: `❌ Erro: ${errorMsg}`
    });

    console.error(`❌ Erro ao enviar para ${phone}: ${errorMsg}`);
    return null;
  }
}

// Process Follow-ups
async function processFollowups() {
  console.log('\n🚀 Iniciando processamento de follow-ups...');
  console.log(`⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n`);

  // Get config
  const config = await db.getConfig(database);

  // Validar canal
  if (!config.selectedChannelId) {
    console.warn('⚠️ Nenhum canal selecionado!');
    return;
  }

  // Verificar se o canal está habilitado
  const enabledChannels = config.enabledChannels || {};
  if (enabledChannels[config.selectedChannelId] === false) {
    console.warn(`⚠️ Canal ${config.selectedChannelId} está desabilitado!`);
    return;
  }

  // Get contacts com filtros
  const contacts = await getContacts({
    tags: config.selectedTags && config.selectedTags.length > 0 ? config.selectedTags : []
  });
  console.log(`📋 Total de contatos encontrados: ${contacts.length}\n`);

  let sentCount = 0;

  for (const contact of contacts) {
    const contactId = contact.id;
    const phone = contact.phone;
    const name = contact.name || 'Cliente';

    // Get messages
    const messages = await getMessages(contactId);
    if (!messages || messages.length === 0) {
      console.log(`⚠️ Contato ${phone} sem mensagens`);
      continue;
    }

    // Get last message date
    const lastMessage = messages[messages.length - 1];
    const lastMessageDate = lastMessage.created_at || lastMessage.timestamp || lastMessage.date;
    const daysSinceLastMessage = getDaysDifference(lastMessageDate);

    console.log(`👤 ${name} (${phone}) - Última msg há ${daysSinceLastMessage} dias`);

    // Check if should send based on config days
    if (config.selectedDays.includes(daysSinceLastMessage)) {
      await sendTemplate(
        phone,
        config.selectedTemplate,
        config.selectedTemplate,
        config.selectedChannelId,
        [name]
      );
      sentCount++;
    }

    // Throttle
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\n✅ Processamento concluído! ${sentCount} mensagens enviadas.\n`);
}

// ========== ROTAS API ==========

// Dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get Account
app.get('/api/account', async (req, res) => {
  const account = await getAccount();
  res.json(account || { error: 'Não foi possível buscar conta' });
});

// Get Channels
app.get('/api/channels', async (req, res) => {
  const channels = await getChannels();
  res.json({ channels });
});

// Get Templates
app.get('/api/templates', async (req, res) => {
  const templates = await getTemplates();
  res.json({ templates });
});

// Get Config
app.get('/api/config', async (req, res) => {
  const config = await db.getConfig(database);
  res.json(config);
});

// Save Config
app.post('/api/config', async (req, res) => {
  await db.saveConfig(database, req.body);
  res.json({ success: true, message: 'Configuração salva!' });
});

// Get Status
app.get('/api/status', async (req, res) => {
  const stats = await db.getStats(database);
  const successRate = stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(2) : 0;

  const nextExecution = new Date();
  nextExecution.setDate(nextExecution.getDate() + 1);
  nextExecution.setHours(9, 0, 0, 0);

  res.json({
    status: 'online',
    totalSent: stats.success,
    totalErrors: stats.error,
    successRate: successRate,
    nextExecution: nextExecution,
    timestamp: new Date()
  });
});

// Get History
app.get('/api/history', async (req, res) => {
  const history = await db.getHistory(database, 50);
  res.json(history);
});

// Run Now (Manual)
app.post('/api/run-now', async (req, res) => {
  console.log('🧪 Execução manual disparada');
  processFollowups();
  res.json({ message: 'Follow-ups iniciados! Verifique o histórico em alguns segundos.' });
});

// ========== AGENDAMENTO ==========

// CRON: Diariamente às 9h (São Paulo)
cron.schedule('0 9 * * *', () => {
  console.log('⏰ CRON disparado - Executando follow-ups diários...');
  processFollowups();
}, {
  timezone: "America/Sao_Paulo"
});

// Para testes
if (process.env.RUN_NOW === 'true') {
  console.log('🧪 Modo teste ativado');
  setTimeout(() => processFollowups(), 1000);
}

// ========== INICIAR SERVIDOR ==========

async function startServer() {
  try {
    // Initialize database
    database = await db.initDB();

    app.listen(PORT, () => {
      console.log(`\n🤖 Sistema Helena Follow-up v2 iniciado!`);
      console.log(`🌐 Dashboard: http://localhost:${PORT}`);
      console.log(`📅 Próxima execução: Amanhã às 9h`);
      console.log(`🔑 API: ${HELENA_API_URL}`);
      console.log(`✅ Token configurado\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
