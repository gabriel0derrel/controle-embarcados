import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Post()
  salvar(@Body() body: { apelido?: string; fase?: number }) {
    const apelido = body?.apelido;
    const fase = body?.fase;

    if (typeof apelido !== 'string' || typeof fase !== 'number') {
      throw new BadRequestException(
        'Payload inválido. Informe apelido e fase.',
      );
    }

    return this.rankingService.salvar(apelido, fase);
  }

  @Get()
  listar() {
    return this.rankingService.listar();
  }
}
