module.exports = {
  apps: [{
    name: 'playwright-server',
    script: './src/server.js',
    cwd: '/Users/gk/Projects/playwright-server',
    env: {
      NODE_ENV: 'production',
      DEBUG: '',  // 生产环境不输出debug日志
      PORT: '9001'  // 设置端口为 9001
    },
    env_dev: {
      NODE_ENV: 'development',
      DEBUG: 'debug:*',  // 开发环境输出所有debug日志
      PORT: '9001'  // 设置端口为 9001
    },
    autorestart: true,
    watch: false,
    // max_memory_restart: '54G',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    restart_delay: 3000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};

