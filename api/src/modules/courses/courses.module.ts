import { Module } from "@nestjs/common";
import { CoursesService } from "./courses.service";
import {
  CoursesAdminController,
  CoursesPublicController,
  CoursesUserController,
} from "./courses.controller";

@Module({
  controllers: [
    CoursesPublicController,
    CoursesUserController,
    CoursesAdminController,
  ],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
