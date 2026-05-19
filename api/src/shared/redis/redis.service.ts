import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
  public readonly client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: config.get<string>("REDIS_HOST", "localhost"),
      port: config.get<number>("REDIS_PORT", 6390),
      password: config.get<string>("REDIS_PASSWORD") || undefined,
      db: config.get<number>("REDIS_DB", 0),
      lazyConnect: false,
      maxRetriesPerRequest: null,
    });
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set(key: string, value: unknown, ttlSec?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSec) {
      await this.client.set(key, serialized, "EX", ttlSec);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async del(key: string | string[]): Promise<void> {
    if (Array.isArray(key)) {
      await this.client.del(...key);
    } else {
      await this.client.del(key);
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
