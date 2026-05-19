import { Module } from "@nestjs/common";
import { MailboxService } from "./mailbox.service";
import { ImapFetcherService } from "./imap-fetcher.service";
import { MailController } from "./mail.controller";

@Module({
  providers: [MailboxService, ImapFetcherService],
  controllers: [MailController],
  exports: [MailboxService],
})
export class MailModule {}
