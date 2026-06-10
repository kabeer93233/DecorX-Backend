import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';

@Entity('ai_designs')
export class AiDesign {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: number;

  @ManyToOne(() => Auth, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: Auth;

  @Column()
  productId!: string;

  @Column()
  productName!: string;

  @Column({ type: 'text' })
  roomImageUrl!: string;

  @Column({ type: 'text' })
  resultImageUrl!: string;

  @Column({ nullable: true })
  roomType!: string;

  @Column({ nullable: true })
  roomStyle!: string;

  @Column({ type: 'jsonb', nullable: true })
  placement!: object;

  @Column({ type: 'jsonb', nullable: true })
  roomAnalysis!: object;

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
