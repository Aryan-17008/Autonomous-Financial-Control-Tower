import { IsEmail, IsString, MinLength } from 'class-validator';

/**
 * POST /auth/register body.
 * role is intentionally NOT accepted here — roles are assigned
 * server-side (default 'analyst') to avoid privilege escalation.
 */
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'password must be at least 8 characters' })
  password: string;
}
