import { Module } from '@nestjs/common';
import { JogoController } from './jogo.controller';
import { JogoService } from './jogo.service';
import { JogoGateway } from './jogo.gateway';

@Module({
  controllers: [JogoController],
  providers: [JogoService, JogoGateway],
  exports: [JogoGateway],
})
export class JogoModule {}
