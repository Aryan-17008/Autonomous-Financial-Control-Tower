import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Financial Control Tower API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

    describe('POST /api/analyze', () => {
    it('should analyze and persist a transaction', async () => {
      const transaction = {
        id: `e2e-tx-${Date.now()}`,
        amount: 75000,
        currency: 'USD',
        vendor: 'E2E Test Vendor',
        timestamp: new Date().toISOString(),
        category: 'operations',
        counterparty_id: 'cp-e2e-1',
      };

      const analyzeResponse = await request(app.getHttpServer())
        .post('/api/analyze')
        .send({
          transactions: [transaction],
        })
        .expect(201);

      expect(analyzeResponse.body).toHaveProperty('risk_score');
      expect(analyzeResponse.body).toHaveProperty('alerts_count');
      expect(analyzeResponse.body).toHaveProperty('recommendations');

      expect(analyzeResponse.body.alerts_count).toBeGreaterThan(0);
      expect(analyzeResponse.body.recommendations.length).toBeGreaterThan(0);

      const transactionsResponse = await request(app.getHttpServer())
        .get('/api/transactions')
        .expect(200);

      expect(
        transactionsResponse.body.transactions.some(
          (tx: any) => tx.id === transaction.id,
        ),
      ).toBe(true);

      const alertsResponse = await request(app.getHttpServer())
        .get('/api/alerts')
        .expect(200);

      expect(alertsResponse.body.alerts.length).toBeGreaterThan(0);

      const recommendationsResponse = await request(app.getHttpServer())
        .get('/api/recommendations')
        .expect(200);

      expect(
        recommendationsResponse.body.recommendations.length,
      ).toBeGreaterThan(0);
    });
  });

    describe('POST /api/execute/:id', () => {
    it('should execute a pending recommendation and create an audit record', async () => {
      const transaction = {
        id: `e2e-execute-tx-${Date.now()}`,
        amount: 75000,
        currency: 'USD',
        vendor: 'E2E Execute Vendor',
        timestamp: new Date().toISOString(),
        category: 'operations',
        counterparty_id: 'cp-execute-1',
      };

      const analyzeResponse = await request(app.getHttpServer())
        .post('/api/analyze')
        .send({
          transactions: [transaction],
        })
        .expect(201);

      expect(analyzeResponse.body.recommendations.length).toBeGreaterThan(0);

      const recommendation =
        analyzeResponse.body.recommendations[0];

      expect(recommendation).toHaveProperty('id');

      const executeResponse = await request(app.getHttpServer())
        .post(`/api/execute/${recommendation.id}`)
        .expect(201);

      expect(executeResponse.body).toEqual(
        expect.objectContaining({
          status: 'executed',
        }),
      );

      expect(executeResponse.body.recommendation).toEqual(
        expect.objectContaining({
          id: recommendation.id,
          status: 'executed',
        }),
      );

      const auditResponse = await request(app.getHttpServer())
        .get('/api/audit')
        .expect(200);

      expect(auditResponse.body.audit_trail).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            recommendation_id: recommendation.id,
            action: recommendation.action,
          }),
        ]),
      );
    });

    it('should return an error for a non-existent recommendation', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/execute/non-existent-recommendation')
        .expect(201);

      expect(response.body).toEqual({
        error: 'Recommendation not found',
      });
    });
  });

  describe('GET /api/transactions', () => {
    it('should return transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/transactions')
        .expect(200);

      expect(response.body).toHaveProperty('transactions');
      expect(Array.isArray(response.body.transactions)).toBe(true);
    });
  });

  describe('GET /api/alerts', () => {
    it('should return active alerts', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/alerts')
        .expect(200);

      expect(response.body).toHaveProperty('alerts');
      expect(Array.isArray(response.body.alerts)).toBe(true);
    });
  });

  describe('GET /api/recommendations', () => {
    it('should return pending recommendations', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/recommendations')
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
    });
  });

  describe('GET /api/audit', () => {
    it('should return the audit trail', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/audit')
        .expect(200);

      expect(response.body).toHaveProperty('audit_trail');
      expect(Array.isArray(response.body.audit_trail)).toBe(true);
    });
  });
});
