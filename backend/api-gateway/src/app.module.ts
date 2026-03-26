import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'lumiqos_db',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'lumiq',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.TCP,
        options: { host: process.env.AUTH_SERVICE_HOST || 'auth-service', port: 3002 },
      },
      {
        name: 'SCHOOL_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.SCHOOL_SERVICE_HOST || 'localhost',
          port: parseInt(process.env.SCHOOL_SERVICE_PORT || '3001', 10)
        },
      },
      {
        name: 'BILLING_SERVICE',
        transport: Transport.TCP,
        options: { host: process.env.BILLING_SERVICE_HOST || 'lumiqos_billing', port: 3006 },
      },
    ]),
    HttpModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule { }
