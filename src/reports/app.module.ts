import { Module } from '@nestjs/common';
import { ReportsModule } from './reports.module';

@Module({
  imports: [ReportsModule],
})
export class AppModule {}
