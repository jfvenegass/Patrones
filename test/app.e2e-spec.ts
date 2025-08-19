/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ReportsModule } from '../src/reports/reports.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Reports (e2e) standalone', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sectionId: string;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [ReportsModule],
    }).compile();

    app = modRef.createNestApplication();
    await app.init();

    prisma = modRef.get(PrismaService);
    const section = await prisma.section.findFirst();
    if (!section) throw new Error('No hay Section en la BD (corre el seed).');
    sectionId = section.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /reports/grades responde 200 y contrato', async () => {
    const res = await request(app.getHttpServer())
      .get('/reports/grades')
      .query({ sectionId })
      .expect(200);

    expect(res.body).toHaveProperty('meta');
    expect(res.body.meta.sectionId).toBe(sectionId);
    expect(Array.isArray(res.body.rows)).toBe(true);
  });
});
