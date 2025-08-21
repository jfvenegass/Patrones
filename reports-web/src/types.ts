export type Row = {
  studentCode: string;
  studentName: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  percentage: number;
};

export type TableReport = {
  meta: { title: string; nrcId: string; total: number; avgScore: number };
  rows: Row[];
};
