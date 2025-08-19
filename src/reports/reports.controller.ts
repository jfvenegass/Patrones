import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService, GenerateReportParams } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('generate')
  async generateReport(
    @Query('sectionId') sectionId: string,
    @Query('title') title?: string,
    @Query('format') format?: 'table',
    @Query('pageSize') pageSize?: number,
  ) {
    const params: GenerateReportParams = {
      sectionId,
      title,
      format,
      pageSize: pageSize ? Number(pageSize) : undefined,
    };

    return this.reportsService.generate(params);
  }
}
