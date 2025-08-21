import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService, GenerateReportParams } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('generate')
  async generateReport(
    @Query('sectionId') nrcId: string,
    @Query('title') title?: string,
    @Query('format') format?: 'table',
    @Query('pageSize') pageSize?: number,
  ) {
    const params: GenerateReportParams = {
      nrcId,
      title,
      format,
      pageSize: pageSize ? Number(pageSize) : undefined,
    };

    return this.reportsService.generate(params);
  }
}
