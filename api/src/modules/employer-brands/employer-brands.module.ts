import { Module } from "@nestjs/common";
import { EmployerBrandsService } from "./employer-brands.service";
import {
  EmployerBrandsAdminController,
  EmployerBrandsPublicController,
} from "./employer-brands.controller";

@Module({
  controllers: [
    EmployerBrandsPublicController,
    EmployerBrandsAdminController,
  ],
  providers: [EmployerBrandsService],
  exports: [EmployerBrandsService],
})
export class EmployerBrandsModule {}
