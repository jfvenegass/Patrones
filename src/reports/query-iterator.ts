import { PrismaClient, Grade } from '@prisma/client';

export type GradeRow = {
  studentCode: string;
  studentName: string;
  assessmentType: string;
  score: number;
  maxScore: number;
};

export class ReportIterator implements AsyncIterable<GradeRow> {
  private lastId: string | null = null;
  private buffer: (Grade & {
    assessment: { type: string; maxScore: number };
    enrollment: { student: { code: string; name: string } };
  })[] = [];
  private idx = 0;

  constructor(
    private prisma: PrismaClient,
    private nrcId: string,
    private pageSize = 100,
  ) {
    // Saneamiento: evitar pageSize <= 0 o ridículamente pequeño
    if (!Number.isFinite(this.pageSize) || this.pageSize <= 0) {
      this.pageSize = 100;
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<GradeRow> {
    return {
      next: async () => {
        if (this.idx >= this.buffer.length) {
          // Siguiente página por cursor estable en id
          const where = { enrollment: { nrcId: this.nrcId } } as const;

          const page = await this.prisma.grade.findMany({
            where,
            take: this.pageSize,
            ...(this.lastId ? { cursor: { id: this.lastId }, skip: 1 } : {}),
            orderBy: { id: 'asc' }, // orden total, estable
            include: {
              assessment: true,
              enrollment: { include: { student: true } },
            },
          });

          if (page.length === 0) {
            return { value: undefined, done: true };
          }

          this.buffer = page;
          this.idx = 0;
          this.lastId = page[page.length - 1].id; // avanzar cursor
        }

        const g = this.buffer[this.idx++];
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
