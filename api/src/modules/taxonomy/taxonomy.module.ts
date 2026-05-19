import { Module } from "@nestjs/common";
import { TaxonomyService } from "./taxonomy.service";
import {
  TaxonomyAdminController,
  TaxonomyPublicController,
} from "./taxonomy.controller";

@Module({
  controllers: [TaxonomyPublicController, TaxonomyAdminController],
  providers: [TaxonomyService],
  exports: [TaxonomyService],
})
export class TaxonomyModule {}
