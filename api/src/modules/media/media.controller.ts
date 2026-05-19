import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { StorageService } from "../../shared/storage/storage.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";
import { UserRole } from "@prisma/client";

const MAX_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "application/pdf",
]);

@ApiTags("media")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(
  UserRole.super_admin,
  UserRole.editor,
  UserRole.writer,
  UserRole.social_manager,
)
@Controller("admin/media")
export class MediaController {
  constructor(private readonly storage: StorageService) {}

  @Audit({ action: "media.upload", resource: "media" })
  @Post("upload")
  @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_SIZE } }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Query("prefix") prefix?: string,
  ) {
    if (!file) throw new BadRequestException("Dosya yok");
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        `İzin verilmeyen dosya tipi: ${file.mimetype}`,
      );
    }
    return this.storage.uploadImage({
      buffer: file.buffer,
      contentType: file.mimetype,
      prefix: prefix ?? "uploads",
    });
  }

  /** Client-side direct upload için presigned URL (büyük dosya, AI Studio görsel) */
  @Get("presigned-upload")
  async presigned(
    @Query("contentType") contentType: string,
    @Query("prefix") prefix?: string,
    @Query("filename") filename?: string,
  ) {
    if (!contentType) {
      throw new BadRequestException("contentType gerekli");
    }
    const key = `${prefix ?? "uploads"}/${Date.now()}-${filename ?? "file"}`;
    return this.storage.presignedUploadUrl(key, contentType);
  }
}
