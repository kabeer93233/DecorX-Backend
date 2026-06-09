import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('saved_designs')
export class SavedDesign {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: number;

  @Column()
  roomId!: string;

  @Column({ default: 'My Design' })
  name!: string;

  @Column({ type: 'jsonb' })
  items!: object[];

  @Column({ type: 'jsonb', nullable: true })
  cameraState!: object | null;

  @Column({ type: 'text', nullable: true })
  screenshotUrl!: string | null;

  @Column({ default: false })
  isDeleted!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
