import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: ['super_admin', 'admin', 'user'],
    default: 'user'
  })
  role: string;

  @Column({ type: 'boolean', default: false })
  active: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  salaryRange: string;

  @Column({ type: 'simple-array', nullable: true })
  interestedCategories: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
