import { Controller, Post, Get, Body } from '@nestjs/common';
import { RankingService } from './ranking.service';

@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingService: RankingService) {}

  @Post()
  salvar(@Body() body: { apelido: string; fase: number }) {
    return this.rankingService.salvar(body.apelido, body.fase);
  }

  @Get()
  listar() {
    return this.rankingService.listar();
  }
}
