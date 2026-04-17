import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { TeacherController } from './teacher.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'lumiqos_db',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'lumiq',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ClientsModule.register([
      {
        name: 'SCHOOL_SERVICE',
        transport: Transport.TCP,
        options: { host: 'school-service', port: 3001 },
      },
    ]),
    HttpModule,
  ],
  controllers: [AppController, HealthController, TeacherController],
  providers: [AppService],
})
export class AppModule {}
