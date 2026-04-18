import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'lumiq',
  synchronize: false,
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [path.join(__dirname, '../../../shared/dist/entities/*.entity.js')],
  migrations: [path.join(__dirname, 'migrations/*.ts')],
  migrationsTableName: 'migrations',
});

export default AppDataSource;
