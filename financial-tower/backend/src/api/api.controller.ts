import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('analyze')
  async analyze(@Body() body: any, @Request() req: any) {
    const transactions = Array.isArray(body) ? body : [body];
    if (transactions.length > 200) {
      throw new Error('Batch size exceeds 200');
    }
    return this.apiService.analyzeTransactions(transactions, req.user.id);
  }

  @Get('alerts')
  async getAlerts() {
    return this.apiService.getAlerts();
  }

  @Get('recommendations')
  async getRecommendations() {
    return this.apiService.getRecommendations();
  }

  @Get('audit')
  async getAudit() {
    return this.apiService.getAudit();
  }

  @Get('transactions')
  async getTransactions() {
    return this.apiService.getTransactions();
  }

  @Post('execute/:id')
  async executeRecommendation(@Param('id') id: string, @Request() req: any) {
    return this.apiService.executeRecommendation(id, req.user.id);
  }
}
