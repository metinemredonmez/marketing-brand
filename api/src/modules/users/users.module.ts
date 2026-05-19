import { Module } from "@nestjs/common";
import { UsersController, UsersAdminController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
  controllers: [UsersController, UsersAdminController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
