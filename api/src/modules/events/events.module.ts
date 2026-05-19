import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import {
  EventsAdminController,
  EventsPublicController,
  EventsUserController,
} from "./events.controller";

@Module({
  controllers: [
    EventsPublicController,
    EventsUserController,
    EventsAdminController,
  ],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
