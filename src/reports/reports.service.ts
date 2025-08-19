//Patron Façade (Un solo punto de entrada)
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportIterator } from './query-iterator';
import { ReportBuilder, TableJsonBuilder, TableReport } from './report-builder';

export type GenerateReportParams = {
  sectionId: string;
  title?: string;
  format?: 'table';
  pageSize?: number;
};

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  //Fachada
  async generate(params: GenerateReportParams): Promise<TableReport> {
    const title = params.title ?? 'Reporte de Calificaciones';
    const iterator = new ReportIterator(
      this.prisma,
      params.sectionId,
      params.pageSize ?? 100,
    );

    //Builder concreto (table/json)
    const builder: ReportBuilder<TableReport> = new TableJsonBuilder();
    builder.reset();
    builder.setMeta({ title, sectionId: params.sectionId });

    for await (const row of iterator) {
      builder.addRow(row);
    }

    builder.setSummary();
    return builder.build();
  }
}
