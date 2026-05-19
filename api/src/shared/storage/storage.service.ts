import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";
import { randomUUID } from "crypto";

export interface UploadInput {
  buffer: Buffer;
  contentType: string;
  /** Klasör prefix (örn: "articles/cover", "users/avatar") */
  prefix?: string;
  /** Resize varyantları: ana asset için + thumb için. */
  variants?: Array<{ name: string; width: number; quality?: number }>;
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  variants?: Record<string, { key: string; url: string; size: number }>;
}

const DEFAULT_VARIANTS = [
  { name: "thumb", width: 400, quality: 80 },
  { name: "card", width: 800, quality: 85 },
  { name: "hero", width: 1600, quality: 88 },
];

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = config.get<string>("S3_BUCKET", "markaradar-media");
    this.publicUrl = config.get<string>(
      "S3_PUBLIC_URL",
      "http://localhost:9110/markaradar-media",
    );

    this.client = new S3Client({
      endpoint: config.get<string>("S3_ENDPOINT", "http://localhost:9110"),
      region: config.get<string>("S3_REGION", "auto"),
      credentials: {
        accessKeyId: config.get<string>("S3_ACCESS_KEY", "markaradar"),
        secretAccessKey: config.get<string>(
          "S3_SECRET_KEY",
          "dev_minio_password",
        ),
      },
      forcePathStyle: true, // MinIO için zorunlu, R2 da destekler
    });

    this.logger.log(
      `📦 Storage aktif: ${this.bucket} @ ${this.publicUrl}`,
    );
  }

  /**
   * Görsel yükle: orijinal + 3 varyant (thumb/card/hero) WebP'ye çevirir.
   * Görsel değilse sadece orijinal yüklenir.
   */
  async uploadImage(input: UploadInput): Promise<UploadResult> {
    const ext = this.extFromContentType(input.contentType);
    const isImage = input.contentType.startsWith("image/");
    const baseKey = `${input.prefix ?? "uploads"}/${randomUUID()}`;

    if (!isImage) {
      // Görsel değilse — orijinal yükle, varyant yok
      const key = `${baseKey}${ext}`;
      await this.putObject(key, input.buffer, input.contentType);
      return {
        key,
        url: this.publicUrlFor(key),
        size: input.buffer.length,
      };
    }

    // Orijinal — meta için Sharp ile decode et
    const metadata = await sharp(input.buffer).metadata();
    this.logger.debug(
      `Image upload: ${metadata.width}x${metadata.height}, ${input.contentType}`,
    );

    // Original (WebP'ye çevir, kalite 92)
    const originalKey = `${baseKey}.webp`;
    const original = await sharp(input.buffer)
      .webp({ quality: 92 })
      .toBuffer();
    await this.putObject(originalKey, original, "image/webp");

    // Varyantlar
    const variants: Record<
      string,
      { key: string; url: string; size: number }
    > = {};
    const sizes = input.variants ?? DEFAULT_VARIANTS;
    for (const v of sizes) {
      // Orijinal varyanttan küçükse skip
      if (metadata.width && metadata.width < v.width) continue;
      const variantKey = `${baseKey}_${v.name}.webp`;
      const variantBuffer = await sharp(input.buffer)
        .resize({
          width: v.width,
          withoutEnlargement: true,
        })
        .webp({ quality: v.quality ?? 85 })
        .toBuffer();
      await this.putObject(variantKey, variantBuffer, "image/webp");
      variants[v.name] = {
        key: variantKey,
        url: this.publicUrlFor(variantKey),
        size: variantBuffer.length,
      };
    }

    return {
      key: originalKey,
      url: this.publicUrlFor(originalKey),
      size: original.length,
      variants,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  /** Private object'lere geçici erişim için presigned URL (15 dk default) */
  async presignedDownloadUrl(
    key: string,
    expiresInSec = 900,
  ): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn: expiresInSec },
    );
  }

  /** Client-side direct upload için presigned PUT URL */
  async presignedUploadUrl(
    key: string,
    contentType: string,
    expiresInSec = 300,
  ): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
    const uploadUrl = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: expiresInSec },
    );
    return { uploadUrl, key, publicUrl: this.publicUrlFor(key) };
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  // ─── private ──────────────────────────────────────────────

  private async putObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  }

  private publicUrlFor(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  private extFromContentType(ct: string): string {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
      "image/avif": ".avif",
      "image/svg+xml": ".svg",
      "application/pdf": ".pdf",
      "video/mp4": ".mp4",
    };
    return map[ct] ?? "";
  }
}
