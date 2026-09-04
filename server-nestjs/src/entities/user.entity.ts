import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * User entity - auth scope belongs to Nayan (login/register/JWT).
 * This is only the persistence model; auth logic lives in src/auth/.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  email: string;

  @Column('text')
  password_hash: string;

  @Column('text', { default: 'analyst' })
  role: string;

  @Column('text')
  created_at: string;
}
