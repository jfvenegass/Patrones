import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { TableReport } from './report-builder';

@Controller('reports')
export class ReportsController {
  prisma: any;
  constructor(private readonly reports: ReportsService) {}

  @Get('generate')
  async grades(
    @Query('nrcId') nrcId: string,
    @Query('title') title?: string,
    @Query('pageSize') pageSize?: string,
  ): Promise<TableReport> {
    if (!nrcId) throw new Error('Falta nrcId');

    let ps: number | undefined = undefined;
    if (typeof pageSize === 'string') {
      const n = Number(pageSize);
      if (Number.isFinite(n) && n > 0) ps = n; // solo aceptamos > 0
    }

    return this.reports.generate({ nrcId, title, pageSize: ps });
  }

  @Get('debug')
  async debug(@Query('nrcId') nrcId: string) {
    if (!nrcId) throw new Error('Falta nrcId');
    return this.reports.debug(nrcId);
  }
}
