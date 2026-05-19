// MarkaRadar — PM2 production config
// Kullanım:
//   pm2 start ecosystem.config.js
//   pm2 list
//   pm2 logs markaradar-api
//   pm2 reload ecosystem.config.js --update-env

module.exports = {
  apps: [
    {
      name: "markaradar-api",
      script: "dist/main.js",
      cwd: __dirname,
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        WORKER_ENABLED: "false",
      },
      env_file: ".env.production",
      max_memory_restart: "800M",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "30s",
      out_file: "./logs/api.out.log",
      error_file: "./logs/api.err.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      kill_timeout: 5000,
    },

    // Worker — BullMQ processors (AI, mail, social, newsletter)
    {
      name: "markaradar-worker",
      script: "dist/worker.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        WORKER_ENABLED: "true",
      },
      env_file: ".env.production",
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: "60s",
      out_file: "./logs/worker.out.log",
      error_file: "./logs/worker.err.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      kill_timeout: 30000, // worker uzun job için 30s'lik graceful kill
    },
  ],
};
