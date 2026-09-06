import { Controller, Post, Get, Body, Param, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('transactions/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTransactions(@UploadedFile() file: any, @Body() body: any, @Request() req: any) {
    if (!file && !body.csv) {
      throw new BadRequestException('No CSV file or text provided');
    }
    const csvContent = file ? file.buffer.toString('utf8') : body.csv;
    return this.apiService.processCSVUpload(csvContent, req.user.id);
  }

  @Post('analyze')
  async analyze(@Body() body: any, @Request() req: any) {
    const transactions = Array.isArray(body) ? body : [body];
    if (transactions.length > 200) {
      throw new Error('Batch size exceeds 200');
    }
    return this.apiService.analyzeTransactions(transactions, req.user.id);
  }

  @Get('dashboard/summary')
  async getDashboardSummary(@Request() req: any) {
    return this.apiService.getDashboardSummary(req.user.id);
  }

  @Get('forecast')
  async getForecast(@Request() req: any) {
    return this.apiService.getForecast(req.user.id);
  }

  @Post('simulate')
  async simulate(@Body() body: any, @Request() req: any) {
    return this.apiService.simulateForecast(req.user.id, body);
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
