import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { JogoGateway } from './jogo/jogo.gateway';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly jogoGateway: JogoGateway,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('embarcado/status')
  getEmbarcadoStatus() {
    return this.jogoGateway.getEmbarcadoSnapshot();
  }

  @Get('debug/ping')
  getDebugPing() {
    return {
      ok: true,
      source: 'backend',
      timestamp: new Date().toISOString(),
      embarcado: this.jogoGateway.getEmbarcadoSnapshot(),
    };
  }
}
