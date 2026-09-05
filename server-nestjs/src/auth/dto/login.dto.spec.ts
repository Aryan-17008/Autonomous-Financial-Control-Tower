import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should create a LoginDto instance', () => {
    const dto = new LoginDto();

    dto.email = 'user@example.com';
    dto.password = 'password123';

    expect(dto).toBeInstanceOf(LoginDto);
    expect(dto.email).toBe('user@example.com');
    expect(dto.password).toBe('password123');
  });

  it('should accept a valid email and password', async () => {
    const dto = new LoginDto();

    dto.email = 'user@example.com';
    dto.password = 'password123';

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should reject an invalid email', async () => {
    const dto = new LoginDto();

    dto.email = 'not-an-email';
    dto.password = 'password123';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints?.isEmail).toBeDefined();
  });

  it('should reject a non-string password', async () => {
    const dto = new LoginDto();

    dto.email = 'user@example.com';
    dto.password = 12345 as any;

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints?.isString).toBeDefined();
  });

  it('should reject a non-string email', async () => {
    const dto = new LoginDto();

    dto.email = 12345 as any;
    dto.password = 'password123';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints?.isEmail).toBeDefined();
  });
});
