import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from "@nestjs/common";
import { OperationsService } from "./operations.service";
import { JwtAuthGuard } from "@xceliqos/shared";
import { RbacGuard } from "@xceliqos/shared";
import { RequirePermissions } from "@xceliqos/shared";

@Controller("operations")
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  // ── Config ────────────────────────────────────────────────────────────────

  @Get("config")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getConfig(@Query("school_id") schoolId: string) {
    return this.operationsService.getConfig(schoolId);
  }

  @Patch("config")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  upsertConfig(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.operationsService.upsertConfig(schoolId, dto);
  }

  // ── Library ───────────────────────────────────────────────────────────────

  @Post("library/books")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  addBook(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.operationsService.addBook(schoolId, dto);
  }

  @Get("library/books")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  searchBooks(@Query("school_id") schoolId: string, @Query() query: any) {
    return this.operationsService.searchBooks(schoolId, query);
  }

  @Get("library/books/:id")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getBook(@Query("school_id") schoolId: string, @Param("id") id: string) {
    return this.operationsService.getBook(schoolId, id);
  }

  @Post("library/books/:id/issue")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  issueBook(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any) {
    return this.operationsService.issueBook(schoolId, id, dto);
  }

  @Post("library/books/:id/return")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  returnBook(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any) {
    return this.operationsService.returnBook(schoolId, id, dto);
  }

  @Post("library/books/:id/renew")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  renewBook(@Query("school_id") schoolId: string, @Param("id") id: string) {
    return this.operationsService.renewBook(schoolId, id);
  }

  @Post("library/books/:id/pay-fine")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  payFine(@Query("school_id") schoolId: string, @Param("id") id: string) {
    return this.operationsService.payFine(schoolId, id);
  }

  // ── Transport Routes ──────────────────────────────────────────────────────

  @Post("transport/routes")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  createRoute(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.operationsService.createRoute(schoolId, dto);
  }

  @Get("transport/routes")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getRoutes(@Query("school_id") schoolId: string, @Query("academic_year_id") academicYearId?: string) {
    return this.operationsService.getRoutes(schoolId, academicYearId);
  }

  @Get("transport/routes/:id")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getRoute(@Query("school_id") schoolId: string, @Param("id") id: string) {
    return this.operationsService.getRoute(schoolId, id);
  }

  @Patch("transport/routes/:id")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  updateRoute(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: any) {
    return this.operationsService.updateRoute(schoolId, id, dto);
  }

  // ── Transport Assignments ─────────────────────────────────────────────────

  @Post("transport/assignments")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  assignStudent(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.operationsService.assignStudent(schoolId, dto);
  }

  @Get("transport/assignments")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getAssignments(
    @Query("school_id") schoolId: string,
    @Query("route_id") routeId?: string,
    @Query("academic_year_id") academicYearId?: string,
  ) {
    return this.operationsService.getAssignments(schoolId, routeId, academicYearId);
  }

  @Get("transport/assignments/student/:studentId")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getStudentAssignment(
    @Query("school_id") schoolId: string,
    @Param("studentId") studentId: string,
    @Query("academic_year_id") academicYearId: string,
  ) {
    return this.operationsService.getStudentAssignment(schoolId, studentId, academicYearId);
  }

  // ── Visitor Log ───────────────────────────────────────────────────────────

  @Post("visitors/check-in")
  checkIn(@Query("school_id") schoolId: string, @Body() dto: any) {
    return this.operationsService.checkIn(schoolId, dto);
  }

  @Patch("visitors/:id/check-out")
  checkOut(@Query("school_id") schoolId: string, @Param("id") id: string) {
    return this.operationsService.checkOut(schoolId, id);
  }

  @Get("visitors")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getVisitorLogs(@Query("school_id") schoolId: string, @Query() query: any) {
    return this.operationsService.getVisitorLogs(schoolId, query);
  }

  @Get("visitors/active")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:read")
  getActiveVisitors(@Query("school_id") schoolId: string) {
    return this.operationsService.getActiveVisitors(schoolId);
  }

  @Patch("visitors/:id/flag")
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions("admin:write")
  flagVisitor(@Query("school_id") schoolId: string, @Param("id") id: string, @Body() dto: { reason: string }) {
    return this.operationsService.flagVisitor(schoolId, id, dto.reason);
  }
}
