import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SchoolController } from './school.controller';
import { SchoolService } from './school.service';
import { LessonPlan } from '@xceliqos/shared';

@Module({
  imports: [
    TypeOrmModule.forFeature([LessonPlan]),
    ClientsModule.register([
      {
        name: 'AI_SERVICE',
        transport: Transport.TCP,
        options: { host: 'ai-service', port: 3003 },
      },
    ]),
  ],
  controllers: [SchoolController],
  providers: [SchoolService],
  exports: [SchoolService],
})
export class SchoolModule {}
