import { Controller, Post, Body } from '@nestjs/common';
import { JogoService } from './jogo.service';

@Controller('jogo')
export class JogoController {
  constructor(private readonly jogoService: JogoService) {}

  @Post('led')
  enviarLed(@Body() body: { cor: string }) {
    this.jogoService.enviarLed(body.cor);
    return { ok: true };
  }

  @Post('iniciar')
  iniciar() {
    this.jogoService.enviarJogo('iniciar');
    return { ok: true };
  }

  @Post('reiniciar')
  reiniciar() {
    this.jogoService.enviarJogo('reiniciar');
    return { ok: true };
  }

  @Post('confirmar')
  confirmar() {
    this.jogoService.enviarJogo('confirmar');
    return { ok: true };
  }
}
