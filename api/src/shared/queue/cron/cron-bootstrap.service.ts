import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { QueueService } from "../queue.service";

/**
 * Worker process açıldığında repeatable BullMQ job'ları kurar.
 * Sadece WORKER_ENABLED=true olduğunda çalışır.
 *
 * Cron pattern: standart cron (Europe/Istanbul tz)
 */
@Injectable()
export class CronBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(CronBootstrapService.name);

  constructor(
    private readonly queue: QueueService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    if (this.config.get<string>("WORKER_ENABLED") !== "true") {
      return; // API process'inde cron kurma
    }

    // Eski cron'ları temizle (idempotent restart için)
    try {
      await this.queue.clearAllCrons();
    } catch (e) {
      this.logger.warn(`Cron clear başarısız: ${(e as Error).message}`);
    }

    // ─── Daily 08:30 — Pazarlama 5 newsletter compose + send
    await this.queue.registerCron(
      "newsletter",
      "daily-digest",
      "30 8 * * 1-5", // Pzt-Cum 08:30
    );

    // ─── Hourly — subscription dunning retry + scheduled article publish
    await this.queue.registerCron(
      "mail",
      "hourly-tasks",
      "0 * * * *",
    );

    // ─── Daily 02:00 — view count Redis → DB batch sync
    await this.queue.registerCron(
      "ai",
      "daily-maintenance",
      "0 2 * * *",
    );

    // ─── Daily 09:00 — expired job archive
    await this.queue.registerCron(
      "mail",
      "expire-jobs",
      "0 9 * * *",
    );

    this.logger.log(
      `⏰ Cron jobs kuruldu: daily-digest (08:30), hourly-tasks, daily-maintenance (02:00), expire-jobs (09:00)`,
    );
  }
}
