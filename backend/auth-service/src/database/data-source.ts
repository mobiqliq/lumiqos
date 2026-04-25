import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {
  User, Role, Permission, RolePermission, School,
  AcademicYear, Class, Section, Subject, TeacherSubject,
  Student, StudentEnrollment, StudentGuardian, StudentDocument, StudentHealthRecord,
} from '@xceliqos/shared/src/entities';

// AUTH-SERVICE ENTITY BOUNDARY
// This list is intentionally explicit. Only entities owned by auth-service belong here.
// When adding new auth-owned entities (e.g. RefreshToken, MfaRecord, AuditLog),
// add them to this array AND to app.module.ts entities list.
// Never add school-service entities here — they are managed by school-service migrations.
const AUTH_SERVICE_ENTITIES = [
  User, Role, Permission, RolePermission, School,
  AcademicYear, Class, Section, Subject, TeacherSubject,
  Student, StudentEnrollment, StudentGuardian, StudentDocument, StudentHealthRecord,
];

dotenv.config();
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'xceliq',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  namingStrategy: new SnakeNamingStrategy(),
  entities: AUTH_SERVICE_ENTITIES,
  migrations: [path.join(__dirname, 'migrations/*.ts')],
  migrationsTableName: 'migrations',
  migrationsRun: false,
});
export default AppDataSource;
