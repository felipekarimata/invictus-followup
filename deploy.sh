#!/bin/bash

# 🚀 Helena Follow-up Deployment Script
# Este script será executado no servidor via git webhook ou manualmente

echo "📦 Iniciando deploy da aplicação Helena Follow-up..."

# 1. Atualizar repositório
echo "📥 Puxando alterações do Git..."
cd /home/followup-app || exit 1
git pull origin main

# 2. Instalar dependências
echo "📚 Instalando dependências..."
npm install --production

# 3. Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "⚙️  Criando arquivo .env..."
    cat > .env << EOF
HELENA_TOKEN=pn_zff6DnFtKnpVMblIDHkhmQSH9gHnn9nF6LU6vbHnWQ
HELENA_API_URL=https://api.helena.run
PORT=3000
DATABASE_PATH=./helena_followup.db
NODE_ENV=production
EOF
fi

# 4. Inicializar banco de dados
echo "🗄️  Inicializando banco de dados..."
node -e "require('./db').initDB()"

# 5. Parar aplicação anterior (se estiver rodando)
echo "🛑 Parando aplicação anterior..."
pm2 delete helena-followup 2>/dev/null || true

# 6. Iniciar com PM2
echo "🚀 Iniciando aplicação com PM2..."
pm2 start app.js --name helena-followup --exp-backoff-restart-delay=100

# 7. Salvar PM2 config para auto-restart
echo "💾 Salvando configuração PM2..."
pm2 save

# 8. Exibir status
echo "✅ Deploy concluído!"
echo ""
pm2 status

echo ""
echo "📊 Logs em tempo real:"
pm2 logs helena-followup --lines 50
