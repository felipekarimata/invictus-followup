// Sistema de Follow-up Automático - Helena CRM
// Executa 1x por dia e envia mensagens nos intervalos: 1, 3, 7 e 30 dias

require('dotenv').config();
const axios = require('axios');
const cron = require('node-cron');

// ========== CONFIGURAÇÕES ==========
const HELENA_API_URL = 'https://api.helena.app'; // Ajuste com a URL real da API
const HELENA_TOKEN = process.env.HELENA_TOKEN;

// Templates aprovados no WhatsApp (ajuste os nomes conforme seus templates)
const TEMPLATES = {
  DIA_1: 'followup_dia_1',   // Nome do template no WhatsApp
  DIA_3: 'followup_dia_3',
  DIA_7: 'followup_dia_7',
  DIA_30: 'followup_dia_30'
};

// Armazena quem já recebeu follow-up (em produção, use banco de dados)
let followupsSent = {
  dia_1: new Set(),
  dia_3: new Set(),
  dia_7: new Set(),
  dia_30: new Set()
};

// ========== FUNÇÕES AUXILIARES ==========

// Calcular diferença em dias entre duas datas
function getDaysDifference(lastMessageDate) {
  const now = new Date();
  const lastDate = new Date(lastMessageDate);
  const diffTime = Math.abs(now - lastDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Buscar todos os contatos da Helena
async function getContacts() {
  try {
    const response = await axios.get(`${HELENA_API_URL}/contacts`, {
      headers: {
        'Authorization': `Bearer ${HELENA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.contacts || response.data; // Ajustar conforme estrutura real
  } catch (error) {
    console.error('❌ Erro ao buscar contatos:', error.message);
    return [];
  }
}

// Buscar histórico de mensagens de um contato
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

// Enviar template do WhatsApp
async function sendTemplate(phone, templateName, parameters = []) {
  try {
    const payload = {
      phone: phone,
      template: templateName,
      parameters: parameters // Ex: ["João"] para preencher {{1}} no template
    };

    const response = await axios.post(`${HELENA_API_URL}/messages/template`, payload, {
      headers: {
        'Authorization': `Bearer ${HELENA_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Template "${templateName}" enviado para ${phone}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Erro ao enviar template para ${phone}:`, error.response?.data || error.message);
    return null;
  }
}

// ========== LÓGICA PRINCIPAL ==========

async function processFollowups() {
  console.log('\n🚀 Iniciando processamento de follow-ups...');
  console.log(`⏰ Horário: ${new Date().toLocaleString('pt-BR')}\n`);

  // 1. Buscar todos os contatos
  const contacts = await getContacts();
  console.log(`📋 Total de contatos encontrados: ${contacts.length}\n`);

  for (const contact of contacts) {
    const contactId = contact.id;
    const phone = contact.phone;
    const name = contact.name || 'Cliente';

    // 2. Buscar última mensagem do contato
    const messages = await getMessages(contactId);
    
    if (!messages || messages.length === 0) {
      console.log(`⚠️  Contato ${phone} sem mensagens, pulando...`);
      continue;
    }

    // Pegar a mensagem mais recente
    const lastMessage = messages[messages.length - 1];
    const lastMessageDate = lastMessage.created_at || lastMessage.timestamp;
    const daysSinceLastMessage = getDaysDifference(lastMessageDate);

    console.log(`👤 ${name} (${phone}) - Última msg há ${daysSinceLastMessage} dias`);

    // 3. Verificar se deve enviar follow-up
    
    // Follow-up de 1 dia
    if (daysSinceLastMessage === 1 && !followupsSent.dia_1.has(phone)) {
      await sendTemplate(phone, TEMPLATES.DIA_1, [name]);
      followupsSent.dia_1.add(phone);
    }
    
    // Follow-up de 3 dias
    else if (daysSinceLastMessage === 3 && !followupsSent.dia_3.has(phone)) {
      await sendTemplate(phone, TEMPLATES.DIA_3, [name]);
      followupsSent.dia_3.add(phone);
    }
    
    // Follow-up de 7 dias
    else if (daysSinceLastMessage === 7 && !followupsSent.dia_7.has(phone)) {
      await sendTemplate(phone, TEMPLATES.DIA_7, [name]);
      followupsSent.dia_7.add(phone);
    }
    
    // Follow-up de 30 dias
    else if (daysSinceLastMessage === 30 && !followupsSent.dia_30.has(phone)) {
      await sendTemplate(phone, TEMPLATES.DIA_30, [name]);
      followupsSent.dia_30.add(phone);
    }

    // Pequeno delay para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ Processamento concluído!\n');
}

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

console.log('🤖 Sistema de Follow-up iniciado!');
console.log('📅 Próxima execução: Todos os dias às 9h');
console.log('🔑 Token configurado:', HELENA_TOKEN ? 'SIM ✅' : 'NÃO ❌');
