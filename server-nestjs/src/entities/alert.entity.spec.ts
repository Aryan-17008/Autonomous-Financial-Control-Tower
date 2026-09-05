import 'reflect-metadata';
import { getMetadataArgsStorage } from 'typeorm';
import { Alert } from './alert.entity';

describe('Alert', () => {
  it('should be defined', () => {
    expect(Alert).toBeDefined();
  });

  it('should create an Alert instance', () => {
    const alert = new Alert();

    alert.type = 'fraud' as Alert['type'];
    alert.severity = 'high' as Alert['severity'];
    alert.message = 'Suspicious transaction detected';
    alert.transaction_id = 'txn-123';
    alert.timestamp = new Date().toISOString();
    alert.status = 'active';

    expect(alert).toBeInstanceOf(Alert);
    expect(alert.type).toBe('fraud');
    expect(alert.severity).toBe('high');
    expect(alert.message).toBe('Suspicious transaction detected');
    expect(alert.transaction_id).toBe('txn-123');
    expect(alert.timestamp).toBeDefined();
    expect(alert.status).toBe('active');
  });

  it('should have the alerts table entity metadata', () => {
    const table = getMetadataArgsStorage().tables.find(
      (metadata) => metadata.target === Alert,
    );

    expect(table).toBeDefined();
    expect(table?.name).toBe('alerts');
  });

  it('should define the expected columns', () => {
    const columns = getMetadataArgsStorage().columns
      .filter((metadata) => metadata.target === Alert)
      .map((metadata) => metadata.propertyName);

    expect(columns).toEqual(
      expect.arrayContaining([
        'id',
        'type',
        'severity',
        'message',
        'transaction_id',
        'timestamp',
        'status',
      ]),
    );
  });

  it('should configure id as a generated primary key', () => {
    const primaryColumn = getMetadataArgsStorage().columns.find(
      (metadata) =>
        metadata.target === Alert &&
        metadata.propertyName === 'id',
        );

    const generatedColumn = getMetadataArgsStorage().generations.find(
      (metadata) =>
        metadata.target === Alert &&
        metadata.propertyName === 'id',
    );

    expect(primaryColumn).toBeDefined();
    expect(generatedColumn).toBeDefined();
    expect(generatedColumn?.strategy).toBe('increment');
  });

  it('should configure transaction_id as nullable', () => {
    const column = getMetadataArgsStorage().columns.find(
      (metadata) =>
        metadata.target === Alert &&
        metadata.propertyName === 'transaction_id',
    );

    expect(column).toBeDefined();
    expect(column?.options.nullable).toBe(true);
  });

  it('should configure status with active as the default', () => {
    const column = getMetadataArgsStorage().columns.find(
      (metadata) =>
        metadata.target === Alert &&
        metadata.propertyName === 'status',
    );

    expect(column).toBeDefined();
    expect(column?.options.default).toBe('active');
  });

  it('should use text columns for string fields', () => {
    const textFields = [
      'type',
      'severity',
      'message',
      'transaction_id',
      'timestamp',
      'status',
    ];

    for (const field of textFields) {
      const column = getMetadataArgsStorage().columns.find(
        (metadata) =>
          metadata.target === Alert &&
          metadata.propertyName === field,
      );

      expect(column?.options.type).toBe('text');
    }
  });
});