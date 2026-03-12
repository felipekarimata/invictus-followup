# 🚀 Deploy no Hostinger - Helena Follow-up

## ⚠️ Situação Atual

- Domínio: `followup.invictusmarketing.com.br`
- Status: 403 Forbidden (Hostinger LiteSpeed)
- Problema: Aplicação Node.js não está rodando no servidor

## ✅ Opções de Deploy

### Opção 1: Usar Aplicação Node.js Nativa do Hostinger (RECOMENDADO)

#### Passo 1: Acessar Painel Hostinger
1. Vá para https://hpanel.hostinger.com
2. Acesse seu domínio
3. Procure por "Aplicações" ou "Node.js"

#### Passo 2: Criar Nova Aplicação Node.js
1. Clique em "Criar Aplicação"
2. Nome: `helena-followup`
3. Seleção de versão: Node.js 18.x
4. Comando de inicialização: `npm start`
5. Diretório: `/` ou `/public`

#### Passo 3: Conectar Repositório Git
1. No painel, procure "Git Integration" ou "GitHub"
2. Conecte seu repositório: `https://github.com/felipekarimata/invictus-followup.git`
3. Branch: `main`
4. Deploy automático: ✅ Ativar

#### Passo 4: Variáveis de Ambiente
No painel Hostinger, adicione as variáveis:
```
HELENA_TOKEN=pn_zff6DnFtKnpVMblIDHkhmQSH9gHnn9nF6LU6vbHnWQ
HELENA_API_URL=https://api.helena.run
PORT=3000
DATABASE_PATH=./helena_followup.db
NODE_ENV=production
```

#### Passo 5: Deploy
1. Clique "Deploy" no painel
2. Aguarde instalação das dependências
3. Acesse https://followup.invictusmarketing.com.br

---

### Opção 2: VPS Gerenciado Separado (Mais Controle)

Se você preferir usar um VPS separado com controle total.

---

## 📖 Próximos Passos

1. **Imediato**: Acessar painel Hostinger e criar aplicação Node.js
2. **Variáveis**: Adicionar variáveis de ambiente conforme listado
3. **Deploy**: Conectar repositório GitHub e fazer deploy
4. **Teste**: Acessar https://followup.invictusmarketing.com.br

Consulte SERVER_SETUP.md para detalhes técnicos completos.
