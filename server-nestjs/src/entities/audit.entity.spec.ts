import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { AuditLog } from './audit.entity';

describe('AuditLog', () => {
  it('should be defined', () => {
    expect(AuditLog).toBeDefined();
  });

  it('should create an AuditLog instance', () => {
    const audit = new AuditLog();

    audit.id = 1;
    audit.recommendation_id = 'rec_123';
    audit.action = 'execute';
    audit.user = 'system';
    audit.timestamp = '2026-09-05T10:30:00Z';

    expect(audit).toBeInstanceOf(AuditLog);
    expect(audit.id).toBe(1);
    expect(audit.recommendation_id).toBe('rec_123');
    expect(audit.action).toBe('execute');
    expect(audit.user).toBe('system');
    expect(audit.timestamp).toBe('2026-09-05T10:30:00Z');
  });

  it('should have the audit_log table entity metadata', () => {
    const table = getMetadataArgsStorage().tables.find(
      (metadata) => metadata.target === AuditLog,
    );

    expect(table).toBeDefined();
    expect(table?.name).toBe('audit_log');
  });

  it('should define the expected columns', () => {
    const columns = getMetadataArgsStorage().columns
      .filter((metadata) => metadata.target === AuditLog)
      .map((metadata) => metadata.propertyName);

    expect(columns).toEqual(
      expect.arrayContaining([
        'id',
        'recommendation_id',
        'action',
        'user',
        'timestamp',
      ]),
    );
  });

  it('should configure id as a generated primary key', () => {
    const generatedColumn = getMetadataArgsStorage().generations.find(
      (metadata) =>
        metadata.target === AuditLog &&
        metadata.propertyName === 'id',
    );

    expect(generatedColumn).toBeDefined();
    expect(generatedColumn?.strategy).toBe('increment');
  });

  it('should configure recommendation_id as nullable', () => {
    const column = getMetadataArgsStorage().columns.find(
      (metadata) =>
        metadata.target === AuditLog &&
        metadata.propertyName === 'recommendation_id',
    );

    expect(column).toBeDefined();
    expect(column?.options.nullable).toBe(true);
  });

  it('should configure user with system as the default', () => {
    const column = getMetadataArgsStorage().columns.find(
      (metadata) =>
        metadata.target === AuditLog &&
        metadata.propertyName === 'user',
    );

    expect(column).toBeDefined();
    expect(column?.options.default).toBe('system');
  });

  it('should configure the expected column types', () => {
    const expectedTypes: Record<string, string | Function> = {
      id: Number,
      recommendation_id: String,
      action: String,
      user: String,
      timestamp: String,
    };

    for (const [field, expectedType] of Object.entries(expectedTypes)) {
      const column = getMetadataArgsStorage().columns.find(
        (metadata) =>
          metadata.target === AuditLog &&
          metadata.propertyName === field,
      );

      expect(column).toBeDefined();
      expect(column?.options.type).toBe(expectedType);
    }
  });
});