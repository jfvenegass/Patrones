import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const s1 = await prisma.student.create({ data: { code: 'STU-001', name: 'Ana Pérez', email: 'ana@example.com' }});
  const s2 = await prisma.student.create({ data: { code: 'STU-002', name: 'Luis Gómez', email: 'luis@example.com' }});

  const c1 = await prisma.course.create({ data: { code: 'MAT101', name: 'Matemática I', term: '2025-2' }});
  const sec1 = await prisma.section.create({ data: { courseId: c1.id, teacher: 'Prof. Ruiz', schedule: 'Lu-Mi 8-10' }});

  const e1 = await prisma.enrollment.create({ data: { studentId: s1.id, sectionId: sec1.id }});
  const e2 = await prisma.enrollment.create({ data: { studentId: s2.id, sectionId: sec1.id }});

  const a1 = await prisma.assessment.create({ data: { sectionId: sec1.id, type: 'parcial', maxScore: 100 }});
  const a2 = await prisma.assessment.create({ data: { sectionId: sec1.id, type: 'final', maxScore: 100 }});

  await prisma.grade.createMany({
    data: [
      { assessmentId: a1.id, enrollmentId: e1.id, score: 85 },
      { assessmentId: a1.id, enrollmentId: e2.id, score: 72 },
      { assessmentId: a2.id, enrollmentId: e1.id, score: 90 },
      { assessmentId: a2.id, enrollmentId: e2.id, score: 78 },
    ]
  });

  console.log('Seed listo');
}
main().finally(() => prisma.$disconnect());
