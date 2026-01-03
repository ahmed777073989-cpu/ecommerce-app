import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('access_codes')
export class AccessCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 8, unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: ['super_admin', 'admin', 'user'],
    default: 'user'
  })
  role: string;

  @Column({ type: 'timestamp' })
  validFrom: Date;

  @Column({ type: 'timestamp' })
  validUntil: Date;

  @Column({ type: 'int', default: 1 })
  usesAllowed: number;

  @Column({ type: 'int', default: 0 })
  usesCount: number;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ type: 'uuid', nullable: true })
  issuedBy: string;

  @Column({ type: 'text', nullable: true })
  note: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
