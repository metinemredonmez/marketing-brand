import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import {
  CommentsAdminController,
  CommentsPublicController,
  CommentsUserController,
} from "./comments.controller";

@Module({
  controllers: [
    CommentsPublicController,
    CommentsUserController,
    CommentsAdminController,
  ],
  providers: [CommentsService],
})
export class CommentsModule {}
