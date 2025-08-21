/* eslint-disable @typescript-eslint/no-misused-promises */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Borrado de datos previos en orden de dependencias
  await prisma.grade.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.nrc.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();

  // 1. Creación de estudiantes
  const students: Promise<import('@prisma/client').Student>[] = [];
  for (let i = 1; i <= 100; i++) {
    students.push(
      prisma.student.create({
        data: {
          code: `STU-${i.toString().padStart(3, '0')}`,
          name: `Estudiante ${i}`,
          email: `estudiante${i}@uninorte.edu.co`,
        },
      }),
    );
  }
  const createdStudents = await Promise.all(students);

  // 2. Creación de cursos
  const cursoDS = await prisma.course.create({
    data: { code: 'DSW2', name: 'Diseño de Software 2', term: '2025-2' },
  });
  const cursoComp = await prisma.course.create({
    data: { code: 'COMP', name: 'Compiladores', term: '2025-2' },
  });

  // 3. Creación de 2 NRC por curso
  const nrcs: Promise<import('@prisma/client').Nrc>[] = [];
  nrcs.push(
    prisma.nrc.create({
      data: {
        courseId: cursoDS.id,
        teacher: 'Daniel Romero',
        schedule: 'Lu-Mi 8-10',
      },
    }),
  );
  nrcs.push(
    prisma.nrc.create({
      data: {
        courseId: cursoDS.id,
        teacher: 'Jean Pierre',
        schedule: 'Ma-Ju 10-12',
      },
    }),
  );
  nrcs.push(
    prisma.nrc.create({
      data: {
        courseId: cursoComp.id,
        teacher: 'Eduardo Angúlo',
        schedule: 'Lu-Mi 2-4',
      },
    }),
  );
  nrcs.push(
    prisma.nrc.create({
      data: {
        courseId: cursoComp.id,
        teacher: 'José Marquéz',
        schedule: 'Ma-Ju 4-6',
      },
    }),
  );
  const createdNrcs = await Promise.all(nrcs);

  // 4. Asignación de 25 estudiantes por NRC
  for (let i = 0; i < createdNrcs.length; i++) {
    const nrc = createdNrcs[i];
    const group = createdStudents.slice(i * 25, (i + 1) * 25);
    for (const s of group) {
      await prisma.enrollment.create({
        data: { studentId: s.id, nrcId: nrc.id },
      });
    }
  }

  // 5. Creación de evaluaciones según curso
  for (const nrc of createdNrcs) {
    const course = await prisma.course.findUnique({
      where: { id: nrc.courseId },
    });

    if (course?.code === 'DSW2') {
      // Diseño de software 2 → 2 parciales 25%, proyecto 25%, final 25%
      await prisma.assessment.createMany({
        data: [
          { nrcId: nrc.id, type: 'parcial1', maxScore: 100 },
          { nrcId: nrc.id, type: 'parcial2', maxScore: 100 },
          { nrcId: nrc.id, type: 'proyecto', maxScore: 100 },
          { nrcId: nrc.id, type: 'final', maxScore: 100 },
        ],
      });
    } else if (course?.code === 'COMP') {
      // Compiladores → 3 parciales 20%, I+D 15%, final 15%
      await prisma.assessment.createMany({
        data: [
          { nrcId: nrc.id, type: 'parcial1', maxScore: 100 },
          { nrcId: nrc.id, type: 'parcial2', maxScore: 100 },
          { nrcId: nrc.id, type: 'parcial3', maxScore: 100 },
          { nrcId: nrc.id, type: 'I+D', maxScore: 100 },
          { nrcId: nrc.id, type: 'final', maxScore: 100 },
        ],
      });
    }
  }

  // 6. Asignación notas aleatorias
  for (const nrc of createdNrcs) {
    const enrollments = await prisma.enrollment.findMany({
      where: { nrcId: nrc.id },
    });
    const assessments = await prisma.assessment.findMany({
      where: { nrcId: nrc.id },
    });

    for (const e of enrollments) {
      for (const a of assessments) {
        await prisma.grade.create({
          data: {
            assessmentId: a.id,
            enrollmentId: e.id,
            score: Math.floor(Math.random() * 101), // 0–100
          },
        });
      }
    }
  }

  console.log(
    '✅ Seed completo con 100 estudiantes, 2 cursos, 4 NRC y notas aleatorias',
  );
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main().finally(() => prisma.$disconnect());
