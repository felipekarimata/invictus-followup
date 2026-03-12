// 🚀 PM2 Ecosystem Configuration
// Use: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'helena-followup',
      script: './app.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        HELENA_TOKEN: 'pn_zff6DnFtKnpVMblIDHkhmQSH9gHnn9nF6LU6vbHnWQ',
        HELENA_API_URL: 'https://api.helena.run',
        PORT: 3000,
        DATABASE_PATH: './helena_followup.db'
      },
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      ignore_watch: ['node_modules', 'logs', '.git']
    }
  ]
};
