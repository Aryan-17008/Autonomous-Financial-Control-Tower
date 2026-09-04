import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { User } from './user.entity';

describe('User', () => {
  it('should be defined', () => {
    expect(User).toBeDefined();
  });

  it('should create a User instance', () => {
    const user = new User();

    user.email = 'test@example.com';
    user.password_hash = 'hashed-password';
    user.role = 'analyst';
    user.created_at = new Date().toISOString();

    expect(user).toBeInstanceOf(User);
    expect(user.email).toBe('test@example.com');
    expect(user.password_hash).toBe('hashed-password');
    expect(user.role).toBe('analyst');
    expect(user.created_at).toBeDefined();
  });

  it('should have the users table entity metadata', () => {
    const entityMetadata = getMetadataArgsStorage().tables.find(
      (table) => table.target === User,
    );

    expect(entityMetadata).toBeDefined();
    expect(entityMetadata?.name).toBe('users');
  });

  it('should define the expected columns', () => {
    const columns = getMetadataArgsStorage().columns.filter(
      (column) => column.target === User,
    );

    const columnNames = columns.map((column) => column.propertyName);

    expect(columnNames).toEqual(
      expect.arrayContaining([
        'id',
        'email',
        'password_hash',
        'role',
        'created_at',
      ]),
    );
  });

  it('should configure email as unique', () => {
    const emailColumn = getMetadataArgsStorage().columns.find(
      (column) =>
        column.target === User && column.propertyName === 'email',
    );

    expect(emailColumn).toBeDefined();
    expect(emailColumn?.options.unique).toBe(true);
  });

  it('should configure role with analyst as the default', () => {
    const roleColumn = getMetadataArgsStorage().columns.find(
      (column) =>
        column.target === User && column.propertyName === 'role',
    );

    expect(roleColumn).toBeDefined();
    expect(roleColumn?.options.default).toBe('analyst');
  });

  it('should configure id as a generated primary key', () => {
    const primaryColumn = getMetadataArgsStorage().columns.find(
      (column) =>
        column.target === User && column.propertyName === 'id',
    );

    expect(primaryColumn).toBeDefined();
    expect(primaryColumn?.mode).toBe('regular');
  });

  it('should use text columns for email, password_hash, role, and created_at', () => {
    const columns = getMetadataArgsStorage().columns.filter(
      (column) => column.target === User,
    );

    const expectedTextColumns = [
      'email',
      'password_hash',
      'role',
      'created_at',
    ];

    for (const propertyName of expectedTextColumns) {
      const column = columns.find(
        (entry) => entry.propertyName === propertyName,
      );

      expect(column).toBeDefined();
      expect(column?.options.type).toBe('text');
    }
  });
});