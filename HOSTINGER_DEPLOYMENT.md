# 🚀 Deployment no Hostinger

## 📋 Pré-requisitos
- Acesso SSH ao servidor Hostinger
- Node.js instalado (geralmente já vem nos planos)
- Git instalado
- Domínio/subdomínio criado: `followup.invictusmarketing.com.br`

---

## 🔧 Passo a Passo

### 1️⃣ **Criar subdomínio no Hostinger**

1. Acesse o painel Hostinger
2. Vá para **Domínios** → **Gerenciar Subdomínios**
3. Crie um novo subdomínio: `followup.invictusmarketing.com.br`
4. Apontando para a raiz pública (geralmente `/public_html/followup`)

---

### 2️⃣ **Acessar via SSH**

```bash
ssh seu_usuario@seu_servidor_ip
# ou
ssh seu_usuario@invictusmarketing.com.br
```

---

### 3️⃣ **Clonar o repositório**

```bash
cd ~
git clone https://github.com/felipekarimata/invictus-followup.git
cd invictus-followup
```

---

### 4️⃣ **Criar arquivo .env**

```bash
nano .env
```

Adicione (substitua pelo seu token):
```
HELENA_TOKEN=pn_zff6DnFtKnpVMblIDHkhmQSH9gHnn9nF6LU6vbHnWQ
PORT=3000
```

Salve com `Ctrl+X` → `Y` → `Enter`

---

### 5️⃣ **Instalar dependências**

```bash
npm install
```

---

### 6️⃣ **Instalar PM2 (para manter rodando)**

```bash
npm install -g pm2
```

---

### 7️⃣ **Iniciar com PM2**

```bash
pm2 start app.js --name "helena-followup"
pm2 save
pm2 startup
```

---

### 8️⃣ **Configurar Proxy no Hostinger (cPanel)**

Se estiver usando cPanel:

1. Vá para **cPanel** → **Addon Domains** ou **Subdomains**
2. Localize `followup.invictusmarketing.com.br`
3. Configure um **Proxy** apontando para `http://localhost:3000`

Ou via **nginx.conf** (se tiver acesso):

```nginx
server {
    server_name followup.invictusmarketing.com.br;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔍 **Comandos úteis**

```bash
# Ver status da aplicação
pm2 status

# Ver logs em tempo real
pm2 logs helena-followup

# Parar a aplicação
pm2 stop helena-followup

# Reiniciar
pm2 restart helena-followup

# Remover
pm2 delete helena-followup
```

---

## 🧪 **Testar a aplicação**

```bash
# Acesso local
curl http://localhost:3000

# Ou visite via navegador quando configurado
# https://followup.invictusmarketing.com.br
```

---

## 📊 **Endpoints disponíveis**

- `GET /` - Dashboard web
- `GET /api/status` - Status do sistema
- `GET /api/history` - Histórico de envios
- `POST /api/run-now` - Executar follow-ups agora

---

## 🔄 **Atualizar código do repositório**

```bash
cd ~/invictus-followup
git pull origin main
npm install  # Se houver novas dependências
pm2 restart helena-followup
```

---

## ❌ **Troubleshooting**

**Porta 3000 já em uso?**
```bash
lsof -i :3000
kill -9 <PID>
```

**PM2 não inicia?**
```bash
pm2 status
pm2 logs
```

**Git acesso negado?**
```bash
# Use token pessoal do GitHub como senha
git clone https://felipekarimata:ghp_xxx@github.com/felipekarimata/invictus-followup.git
```

---

## ✅ **Pronto!**

A aplicação deve estar rodando em:
**https://followup.invictusmarketing.com.br** 🎉
