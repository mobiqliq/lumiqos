import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { PortfolioService } from "./portfolio.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { RbacGuard } from "@xceliqos/shared";
import { RequirePermissions } from "@xceliqos/shared";

@Controller("portfolio")
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  // ── Config ────────────────────────────────────────────────────────────────

  @Get("config")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getConfig(@Query("school_id") schoolId: string) {
    return this.portfolioService.getConfig(schoolId);
  }

  @Post("config")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  upsertConfig(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.portfolioService.upsertConfig(schoolId, dto);
  }

  // ── Portfolios ────────────────────────────────────────────────────────────

  @Get()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getPortfolios(@Query("school_id") schoolId: string, @Query("academic_year_id") ayId: string) {
    return this.portfolioService.getPortfolios(schoolId, ayId);
  }

  @Get(":studentId")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getPortfolio(
    @Query("school_id") schoolId: string,
    @Param("studentId") studentId: string,
    @Query("academic_year_id") ayId: string,
  ) {
    return this.portfolioService.getOrCreatePortfolio(schoolId, studentId, ayId);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  updatePortfolio(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any) {
    return this.portfolioService.updatePortfolio(schoolId, id, dto);
  }

  @Post(":id/enable-self-curation")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  enableSelfCuration(@Query("school_id") schoolId: string, @Param("id") id: string) {
    return this.portfolioService.enableSelfCuration(schoolId, id);
  }

  @Post(":id/share-token")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  generateShareToken(
    @Query("school_id") schoolId: string,
    @Param("id") id: string,
    @Body() dto: { consent_given_by: string },
  ) {
    return this.portfolioService.generateShareToken(schoolId, id, dto.consent_given_by);
  }

  // ── Items ─────────────────────────────────────────────────────────────────

  @Post(":portfolioId/items")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  addItem(
    @Query("school_id") schoolId: string,
    @Param("portfolioId") portfolioId: string,
    @Body() dto: any,
  ) {
    return this.portfolioService.addItem(schoolId, portfolioId, dto);
  }

  @Get(":portfolioId/items")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getItems(
    @Query("school_id") schoolId: string,
    @Param("portfolioId") portfolioId: string,
    @Query("include_non_approved") includeNonApproved: string,
  ) {
    return this.portfolioService.getItems(schoolId, portfolioId, includeNonApproved === "true");
  }

  @Patch("items/:id")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  updateItem(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any) {
    return this.portfolioService.updateItem(schoolId, id, dto);
  }

  @Post("items/:id/submit")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  submitItemForApproval(@Query("school_id") schoolId: string, @Param("id") id: string) {
    return this.portfolioService.submitItemForApproval(schoolId, id);
  }

  @Post("items/:id/approve")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  approveItem(
    @Query("school_id") schoolId: string,
    @Param("id") id: string,
    @Body() dto: { approver_id: string },
  ) {
    return this.portfolioService.approveItem(schoolId, id, dto.approver_id);
  }

  @Post("items/:id/reject")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  rejectItem(
    @Query("school_id") schoolId: string,
    @Param("id") id: string,
    @Body() dto: { feedback: string },
  ) {
    return this.portfolioService.rejectItem(schoolId, id, dto.feedback);
  }

  @Get("items/pending-approvals")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getPendingApprovals(@Query("school_id") schoolId: string, @Query("academic_year_id") ayId: string) {
    return this.portfolioService.getPendingApprovals(schoolId, ayId);
  }
}
