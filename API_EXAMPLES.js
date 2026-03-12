/**
 * EXEMPLOS DE CHAMADAS À API HELENA
 * Use isso no Postman ou Insomnia para testar
 */

// ========== 1. BUSCAR CONTATOS ==========
GET https://api.helena.app/contacts
Headers:
  Authorization: Bearer pn_seu_token_aqui
  Content-Type: application/json

// Resposta esperada:
{
  "contacts": [
    {
      "id": "contact_123abc",
      "phone": "5511999999999",
      "name": "João Silva",
      "created_at": "2024-03-01T10:00:00Z"
    }
  ]
}


// ========== 2. BUSCAR MENSAGENS DE UM CONTATO ==========
GET https://api.helena.app/messages/contact_123abc
Headers:
  Authorization: Bearer pn_seu_token_aqui
  Content-Type: application/json

// Resposta esperada:
{
  "messages": [
    {
      "id": "msg_456def",
      "from": "customer",
      "text": "Olá, gostaria de saber mais sobre o produto",
      "created_at": "2024-03-10T14:30:00Z",
      "timestamp": "2024-03-10T14:30:00Z"
    },
    {
      "id": "msg_789ghi",
      "from": "business",
      "text": "Olá João! Claro, qual produto te interessa?",
      "created_at": "2024-03-10T14:35:00Z"
    }
  ]
}


// ========== 3. ENVIAR TEMPLATE (FOLLOW-UP) ==========
POST https://api.helena.app/messages/template
Headers:
  Authorization: Bearer pn_seu_token_aqui
  Content-Type: application/json

Body (JSON):
{
  "phone": "5511999999999",
  "template": "followup_dia_1",
  "parameters": ["João"]
}

// Como funciona o "parameters":
// Se seu template no WhatsApp for:
// "Olá {{1}}! Vi que conversamos {{2}}. Posso ajudar?"
// 
// Você envia:
// "parameters": ["João", "ontem"]
//
// O WhatsApp envia:
// "Olá João! Vi que conversamos ontem. Posso ajudar?"


// ========== 4. EXEMPLOS DE TEMPLATES ==========

// Template simples (só nome):
{
  "phone": "5511999999999",
  "template": "followup_dia_3",
  "parameters": ["Maria"]
}
// Se o template for: "Oi {{1}}, tudo bem?"
// Envia: "Oi Maria, tudo bem?"


// Template com múltiplos parâmetros:
{
  "phone": "5511999999999",
  "template": "followup_dia_7",
  "parameters": ["Carlos", "notebook Dell", "R$ 2.500"]
}
// Se o template for: "Oi {{1}}! O {{2}} por {{3}} ainda te interessa?"
// Envia: "Oi Carlos! O notebook Dell por R$ 2.500 ainda te interessa?"


// ========== 5. CRIAR TEMPLATES NO WHATSAPP BUSINESS ==========

/*
Para criar os templates, acesse:
https://business.facebook.com/wa/manage/message-templates/

Exemplos de templates para aprovar:

1. Template: followup_dia_1
Categoria: Marketing
Mensagem:
---
Olá {{1}}! 👋

Vi que conversamos ontem. Ficou alguma dúvida que posso esclarecer?

Estou à disposição!
---


2. Template: followup_dia_3
Categoria: Marketing  
Mensagem:
---
Oi {{1}}! 

Passou alguns dias e queria saber se ainda tem interesse no que conversamos.

Posso ajudar com alguma informação adicional?
---


3. Template: followup_dia_7
Categoria: Marketing
Mensagem:
---
{{1}}, tudo bem?

Faz uma semana que conversamos. Gostaria de retomar nossa conversa?

Fico no aguardo! 😊
---


4. Template: followup_dia_30
Categoria: Marketing
Mensagem:
---
Olá {{1}}!

Faz um tempo que não conversamos. Caso ainda tenha interesse, estou aqui para ajudar!

Pode chamar quando quiser.
---

IMPORTANTE: 
- Use {{1}}, {{2}}, etc para variáveis
- Aguarde aprovação do WhatsApp (1-2 dias úteis)
- Após aprovado, use o NOME EXATO do template no código
*/


// ========== 6. TESTAR NO POSTMAN ==========

/*
1. Abra o Postman
2. Crie uma Collection "Helena API"
3. Adicione as 3 requisições acima
4. Configure uma variável de ambiente:
   - HELENA_TOKEN = pn_seu_token
5. Use {{HELENA_TOKEN}} nas requisições
6. Teste cada endpoint antes de usar no código
*/
