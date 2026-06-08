import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CorGenius, JogoService } from './jogo.service';

const CORES_VALIDAS: CorGenius[] = ['verde', 'vermelho', 'amarelo', 'azul'];

@Controller('jogo')
export class JogoController {
  constructor(private readonly jogoService: JogoService) {}

  @Post('led')
  enviarLed(@Body() body: { cor?: string }) {
    const cor = body?.cor?.trim().toLowerCase() as CorGenius | undefined;

    if (!cor || !CORES_VALIDAS.includes(cor)) {
      throw new BadRequestException(
        'Cor inválida. Use verde, vermelho, amarelo ou azul.',
      );
    }

    console.log('POST /api/jogo/led recebido:', { cor });
    const mqtt = this.jogoService.enviarLed(cor);
    return { ok: true, mqtt };
  }

  @Post('iniciar')
  iniciar() {
    console.log('POST /api/jogo/iniciar recebido');
    const mqtt = this.jogoService.enviarJogo('iniciar');
    return { ok: true, mqtt };
  }

  @Post('reiniciar')
  reiniciar() {
    console.log('POST /api/jogo/reiniciar recebido');
    const mqtt = this.jogoService.enviarJogo('reiniciar');
    return { ok: true, mqtt };
  }

  @Post('confirmar')
  confirmar() {
    console.log('POST /api/jogo/confirmar recebido');
    const mqtt = this.jogoService.enviarJogo('confirmar');
    return { ok: true, mqtt };
  }
}
