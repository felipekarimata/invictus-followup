# 🚀 Guia de Setup do Servidor - Helena Follow-up

## 📋 Pré-requisitos

- VPS com Ubuntu 20.04+
- Node.js v16+ instalado
- PM2 instalado globalmente
- Git instalado
- Acesso SSH ao servidor

## 🔧 Instalação Inicial (Apenas Uma Vez)

### 1. Conectar ao Servidor via SSH
```bash
ssh root@31.97.251.29
# ou com usuário específico
ssh usuario@31.97.251.29
```

### 2. Instalar Node.js (se não tiver)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
```

### 3. Instalar PM2 Globalmente
```bash
sudo npm install -g pm2
sudo pm2 startup
sudo pm2 save
```

### 4. Clonar Repositório
```bash
cd /home
git clone https://github.com/seu-usuario/Invictus-FollowUp.git followup-app
cd followup-app
```

### 5. Criar Arquivo .env
```bash
cat > .env << EOF
HELENA_TOKEN=pn_zff6DnFtKnpVMblIDHkhmQSH9gHnn9nF6LU6vbHnWQ
HELENA_API_URL=https://api.helena.run
PORT=3000
DATABASE_PATH=./helena_followup.db
NODE_ENV=production
EOF
```

### 6. Instalar Dependências
```bash
npm install --production
```

### 7. Inicializar Banco de Dados
```bash
node -e "require('./db').initDB()"
```

### 8. Iniciar Aplicação
```bash
pm2 start app.js --name helena-followup
pm2 save
```

### 9. Configurar Nginx (Reverse Proxy)

#### Instalar Nginx
```bash
sudo apt-get install -y nginx
```

#### Criar Configuração
```bash
sudo nano /etc/nginx/sites-available/followup
```

Adicione:
```nginx
server {
    listen 80;
    server_name followup.invictusmarketing.com.br;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Ativar Configuração
```bash
sudo ln -s /etc/nginx/sites-available/followup /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 10. Instalar SSL (Let's Encrypt)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot certonly --nginx -d followup.invictusmarketing.com.br --non-interactive --agree-tos -m seu-email@exemplo.com
```

#### Atualizar Nginx para HTTPS
```bash
sudo nano /etc/nginx/sites-available/followup
```

Substitua por:
```nginx
server {
    listen 80;
    server_name followup.invictusmarketing.com.br;

    # Redirecionar HTTP para HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name followup.invictusmarketing.com.br;

    ssl_certificate /etc/letsencrypt/live/followup.invictusmarketing.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/followup.invictusmarketing.com.br/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

## 📦 Atualizar Aplicação (Deploy)

Sempre que fizer alterações no código:

### 1. Commit e Push para Git
```bash
git add .
git commit -m "📝 Descrição da mudança"
git push origin main
```

### 2. No Servidor, Execute Deploy
```bash
cd /home/followup-app
bash deploy.sh
```

Ou manualmente:
```bash
git pull origin main
npm install
pm2 restart helena-followup
```

## 🔄 Configurar Deploy Automático com Webhook (Opcional)

### Criar Script de Webhook
```bash
sudo nano /usr/local/bin/deploy-followup.sh
```

Adicione:
```bash
#!/bin/bash
cd /home/followup-app
git pull origin main
npm install
pm2 restart helena-followup
```

```bash
sudo chmod +x /usr/local/bin/deploy-followup.sh
```

### Configurar GitHub Webhook
1. Vá para repositório → Settings → Webhooks
2. Clique "Add webhook"
3. URL: `http://seu-servidor.com/webhook`
4. Selecione apenas `push` events
5. Clique "Add webhook"

## 🔍 Verificar Status

### Verificar PM2
```bash
pm2 status
pm2 logs helena-followup
```

### Verificar Nginx
```bash
sudo systemctl status nginx
sudo nginx -t
```

### Testar Endpoint
```bash
curl http://followup.invictusmarketing.com.br/api/config
```

## 🚨 Troubleshooting

### Aplicação não inicia
```bash
pm2 logs helena-followup
```

### Banco de dados locked
```bash
rm helena_followup.db
node -e "require('./db').initDB()"
pm2 restart helena-followup
```

### Porta 3000 em uso
```bash
lsof -i :3000
kill -9 <PID>
pm2 restart helena-followup
```

### Nginx não redireciona
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 📊 Monitoramento

### Logs em Tempo Real
```bash
pm2 logs helena-followup --tail 100
```

### Dashboard PM2
```bash
pm2 monit
```

### Reiniciar Automático
PM2 já está configurado para reiniciar automáticamente em caso de falha.

---

**Documentação Última Atualização:** 2026-03-12
**Versão:** 1.0.0
