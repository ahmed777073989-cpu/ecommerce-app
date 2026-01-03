import { DataSource } from 'typeorm';
import { User, AccessCode, Session, AuditLog } from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://admin:admin123@localhost:5432/ecommerce_app',
  entities: [User, AccessCode, Session, AuditLog],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
