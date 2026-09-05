import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should create a RegisterDto instance', () => {
    const dto = new RegisterDto();

    dto.email = 'user@example.com';
    dto.password = 'password123';

    expect(dto).toBeInstanceOf(RegisterDto);
    expect(dto.email).toBe('user@example.com');
    expect(dto.password).toBe('password123');
  });

  it('should accept a valid email and password', async () => {
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
    expect(errors[0].constraints?.isEmail).toBeDefined();
  });

  it('should reject a non-string email', async () => {
    const dto = new RegisterDto();

    dto.email = 12345 as any;
    dto.password = 'password123';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints?.isEmail).toBeDefined();
  });

  it('should reject a non-string password', async () => {
    const dto = new RegisterDto();

    dto.email = 'user@example.com';
    dto.password = 12345 as any;

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints?.isString).toBeDefined();
  });

  it('should reject a password shorter than 8 characters', async () => {
    const dto = new RegisterDto();

    dto.email = 'user@example.com';
    dto.password = 'short';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints?.minLength).toBeDefined();
  });

  it('should accept a password with exactly 8 characters', async () => {
    const dto = new RegisterDto();

    dto.email = 'user@example.com';
    dto.password = '12345678';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should not expose a role property', () => {
    const dto = new RegisterDto();

    expect(Object.prototype.hasOwnProperty.call(dto, 'role')).toBe(false);
  });
});
