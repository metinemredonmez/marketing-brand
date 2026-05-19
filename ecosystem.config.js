// ═══════════════════════════════════════════════════════════════
// PM2 ecosystem — MarkaRadar VPS deploy
//
// Kullanım:
//   pm2 start ecosystem.config.js --env production
//   pm2 save
//   pm2 startup
//
// Servisler (port'lar pureolentia ile çakışmaması için yüksek seçildi):
//   markaradar-api    (NestJS)    → port 4010
//   markaradar-web    (Next.js)   → port 3013
//   markaradar-admin  (Next.js)   → port 3014
//   markaradar-worker (BullMQ)    → BG job processor (HTTP yok)
//
// Loglar: /var/log/pm2/markaradar-*.log (pm2-logrotate ile rotate)
// ═══════════════════════════════════════════════════════════════

module.exports = {
  apps: [
    // ─────────────────────── API
    {
      name: "markaradar-api",
      cwd: "./api",
      script: "dist/main.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 4010,
      },
      error_file: "/var/log/pm2/markaradar-api.err.log",
      out_file: "/var/log/pm2/markaradar-api.out.log",
      merge_logs: true,
      time: true,
    },

    // ─────────────────────── Worker (BullMQ jobs)
    {
      name: "markaradar-worker",
      cwd: "./api",
      script: "dist/worker.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        WORKER_ENABLED: "true",
      },
      error_file: "/var/log/pm2/markaradar-worker.err.log",
      out_file: "/var/log/pm2/markaradar-worker.out.log",
      merge_logs: true,
      time: true,
    },

    // ─────────────────────── Web (Next.js)
    {
      name: "markaradar-web",
      cwd: "./web",
      // Standalone build → server.js
      script: ".next/standalone/server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3013,
        HOSTNAME: "127.0.0.1",
      },
      error_file: "/var/log/pm2/markaradar-web.err.log",
      out_file: "/var/log/pm2/markaradar-web.out.log",
      merge_logs: true,
      time: true,
    },

    // ─────────────────────── Admin (Next.js)
    {
      name: "markaradar-admin",
      cwd: "./admin",
      script: ".next/standalone/server.js",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3014,
        HOSTNAME: "127.0.0.1",
      },
      error_file: "/var/log/pm2/markaradar-admin.err.log",
      out_file: "/var/log/pm2/markaradar-admin.out.log",
      merge_logs: true,
      time: true,
    },
  ],
};
