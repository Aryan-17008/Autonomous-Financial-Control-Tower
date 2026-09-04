import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';

describe('Auth DTOs', () => {
  describe('RegisterDto', () => {
    it('should accept valid registration data', async () => {
      const dto = new RegisterDto();
      dto.email = 'user@example.com';
      dto.password = 'password123';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject an invalid email', async () => {
      const dto = new RegisterDto();
      dto.email = 'invalid-email';
      dto.password = 'password123';

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
    });

    it('should reject an empty email', async () => {
      const dto = new RegisterDto();
      dto.email = '';
      dto.password = 'password123';

      const errors = await validate(dto);

      expect(errors.some(error => error.property === 'email')).toBe(true);
    });

    it('should reject a password shorter than 8 characters', async () => {
      const dto = new RegisterDto();
      dto.email = 'user@example.com';
      dto.password = 'short';

      const errors = await validate(dto);

      const passwordError = errors.find(
        error => error.property === 'password',
      );

      expect(passwordError).toBeDefined();
      expect(passwordError?.constraints?.minLength).toBe(
        'password must be at least 8 characters',
      );
    });

    it('should reject a non-string password', async () => {
      const dto = new RegisterDto();
      dto.email = 'user@example.com';
      dto.password = 12345678 as unknown as string;

      const errors = await validate(dto);

      expect(errors.some(error => error.property === 'password')).toBe(true);
    });

    it('should not accept role as a registration field', () => {
      const dto = new RegisterDto();

      expect('role' in dto).toBe(false);
    });
  });

  describe('LoginDto', () => {
    it('should accept valid login data', async () => {
      const dto = new LoginDto();
      dto.email = 'user@example.com';
      dto.password = 'password123';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should reject an invalid email', async () => {
      const dto = new LoginDto();
      dto.email = 'invalid-email';
      dto.password = 'password123';

      const errors = await validate(dto);

      expect(errors.some(error => error.property === 'email')).toBe(true);
    });

    it('should reject an empty email', async () => {
      const dto = new LoginDto();
      dto.email = '';
      dto.password = 'password123';

      const errors = await validate(dto);

      expect(errors.some(error => error.property === 'email')).toBe(true);
    });

    it('should reject a non-string password', async () => {
      const dto = new LoginDto();
      dto.email = 'user@example.com';
      dto.password = 12345678 as unknown as string;

      const errors = await validate(dto);

      expect(errors.some(error => error.property === 'password')).toBe(true);
    });

    it('should accept any string password length for login', async () => {
      const dto = new LoginDto();
      dto.email = 'user@example.com';
      dto.password = 'short';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });
});