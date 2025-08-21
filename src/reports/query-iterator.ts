/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// Patrón Iterator (recorremos el dataset por páginas)
import { PrismaClient } from '@prisma/client';

export type GradeRow = {
  studentCode: string;
  studentName: string;
  assessmentType: string;
  score: number;
  maxScore: number;
};

export class ReportIterator implements AsyncIterable<GradeRow> {
  private cursor = 0;

  constructor(
    private prisma: PrismaClient,
    private nrcId: string,
    private pageSize = 100,
  ) {}

  [Symbol.asyncIterator](): AsyncIterator<GradeRow> {
    return {
      next: async () => {
        const rows = await this.prisma.grade.findMany({
          skip: this.cursor,
          take: this.pageSize,
          where: {
            enrollment: { nrcId: this.nrcId },
          },
          include: {
            assessment: true,
            enrollment: { include: { student: true } },
          },
          orderBy: { createdAt: 'asc' },
        });

        if (rows.length === 0) {
          return { value: undefined, done: true };
        }
        const g = rows[0];
        this.cursor += this.pageSize;

        return {
          value: {
            studentCode: g.enrollment.student.code,
            studentName: g.enrollment.student.name,
            assessmentType: g.assessment.type,
            score: g.score,
            maxScore: g.assessment.maxScore,
          },
          done: false,
        };
      },
    };
  }
}
