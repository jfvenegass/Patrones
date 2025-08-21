import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { TableReport } from './report-builder';

@Controller('reports')
export class ReportsController {
  prisma: any;
  constructor(private readonly reports: ReportsService) {}

  @Get('grades')
  async grades(
    @Query('nrcId') nrcId: string,
    @Query('title') title?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<TableReport> {
    if (!nrcId) throw new Error('Falta nrcId');
    const ps = pageSize ? Number(pageSize) : undefined;
    return this.reports.generate({ nrcId, title, pageSize: ps });
  }
}
