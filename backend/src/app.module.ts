import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttController } from './mqtt.controller';
import { JogoModule } from './jogo/jogo.module';
import { RankingModule } from './ranking/ranking.module';
import { PrismaModule } from './prisma/prisma.module';
import { EmbarcadoModule } from './embarcado/embarcado.module';

@Module({
  imports: [JogoModule, RankingModule, PrismaModule, EmbarcadoModule],
  controllers: [AppController, MqttController],
  providers: [AppService],
})
export class AppModule {}
