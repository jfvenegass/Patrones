import { NestFactory } from '@nestjs/core';
import { ReportsModule } from './reports/reports.module';

async function bootstrap() {
  const app = await NestFactory.create(ReportsModule);
  app.enableCors();
  await app.listen(3000);
}
void bootstrap();
