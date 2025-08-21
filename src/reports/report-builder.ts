//Patron Builder (Construimos el reporte paso a paso)
import { GradeRow } from './query-iterator';

export interface ReportBuilder<TOut> {
  reset(): void;
  setMeta(meta: { title: string; nrcId: string }): void;
  addRow(row: GradeRow): void;
  setSummary(): void;
  build(): TOut;
}

//Implementación JSON tabular (simple y rápida)
export type TableReport = {
  meta: { title: string; nrcId: string; total: number; avgScore: number };
  rows: Array<GradeRow & { percentage: number }>;
};

export class TableJsonBuilder implements ReportBuilder<TableReport> {
  private meta!: TableReport['meta'];
  private rows: Array<GradeRow & { percentage: number }> = [];

  reset(): void {
    this.meta = { title: '', nrcId: '', total: 0, avgScore: 0 };
    this.rows = [];
  }

  setMeta(meta: { title: string; nrcId: string }): void {
    this.meta.title = meta.title;
    this.meta.nrcId = meta.nrcId;
  }

  addRow(row: GradeRow): void {
    this.rows.push({
      ...row,
      percentage: Math.round((row.score / row.maxScore) * 100),
    });
  }

  setSummary(): void {
    const total = this.rows.length;
    const avgScore = total
      ? Math.round(
          (this.rows.reduce((acc, r) => acc + r.score, 0) / total) * 100,
        ) / 100
      : 0;
    this.meta.total = total;
    this.meta.avgScore = avgScore;
  }

  build(): TableReport {
    return { meta: this.meta, rows: this.rows };
  }
}
