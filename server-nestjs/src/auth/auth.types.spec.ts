import { AuthUser, JwtPayload } from './auth.types';

describe('AuthUser', () => {
  it('should support the expected authenticated user shape', () => {
    const user: AuthUser = {
      id: 1,
      email: 'user@example.com',
      role: 'analyst',
    };

    expect(user).toEqual({
      id: 1,
      email: 'user@example.com',
      role: 'analyst',
    });
  });
});

describe('JwtPayload', () => {
  it('should support the expected JWT payload shape', () => {
    const payload: JwtPayload = {
      sub: '1',
      email: 'user@example.com',
      role: 'analyst',
    };

    expect(payload).toEqual({
      sub: '1',
      email: 'user@example.com',
      role: 'analyst',
    });
  });
});
