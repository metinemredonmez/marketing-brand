import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import {
  IsArray,
  IsBooleanString,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { UserRole } from "@prisma/client";
import { ResearchPanelService } from "./research-panel.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Audit } from "../../common/decorators/audit.decorator";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../../common/decorators/current-user.decorator";

class JoinPanelDto {
  @IsString() @MaxLength(50) roleType!: string;
  @IsOptional() @IsString() @MaxLength(50) companySize?: string;
  @IsOptional() @IsString() @MaxLength(80) industry?: string;
}

class CreateSurveyDto {
  @IsString() @MaxLength(200) title!: string;
  @IsOptional() @IsString() slug?: string;
  questions!: unknown;
  @IsOptional() @IsArray() targetSegments?: string[];
}

@ApiTags("research-panel (user)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard)
@Controller("research-panel")
export class ResearchPanelUserController {
  constructor(private readonly research: ResearchPanelService) {}

  @Audit({
    action: "research_panel.join",
    resource: "research_panel_member",
    resourceIdFrom: "result.id",
  })
  @Post("join")
  join(
    @Body() dto: JoinPanelDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.research.joinPanel(user.id, dto);
  }

  @Post("leave")
  leave(@CurrentUser() user: CurrentUserPayload) {
    return this.research.leavePanel(user.id);
  }

  @Get("surveys/:slug")
  getSurvey(@Param("slug") slug: string) {
    return this.research.getSurvey(slug);
  }

  @Audit({
    action: "research_panel.respond",
    resource: "research_response",
    resourceIdFrom: "params.surveyId",
  })
  @Post("surveys/:surveyId/respond")
  respond(
    @Param("surveyId") surveyId: string,
    @Body() body: { answers: unknown },
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.research.submitResponse(surveyId, user.id, body.answers);
  }
}

@ApiTags("research-panel (admin)")
@ApiBearerAuth()
@ApiCookieAuth("mr_access")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.editor)
@Controller("admin/research-panel")
export class ResearchPanelAdminController {
  constructor(private readonly research: ResearchPanelService) {}

  @Get("members")
  listMembers(
    @Query("roleType") roleType?: string,
    @Query("isActive") isActive?: string,
  ) {
    return this.research.listMembers({
      roleType,
      isActive:
        isActive === "true" ? true : isActive === "false" ? false : undefined,
    });
  }

  @Get("summary")
  summary() {
    return this.research.monthlyIndexSummary();
  }

  @Post("surveys")
  createSurvey(@Body() dto: CreateSurveyDto) {
    return this.research.createSurvey(dto);
  }

  @Get("surveys")
  listSurveys() {
    return this.research.listSurveys();
  }

  @Post("surveys/:id/field")
  field(@Param("id") id: string) {
    return this.research.fieldSurvey(id);
  }

  @Post("surveys/:id/close")
  close(@Param("id") id: string) {
    return this.research.closeSurvey(id);
  }
}
