import { IsEmail, IsString } from 'class-validator';

/** POST /auth/login body. */
export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
