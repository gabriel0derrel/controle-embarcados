import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttController } from './mqtt.controller';
import { JogoModule } from './jogo/jogo.module';
import { RankingModule } from './ranking/ranking.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    JogoModule, 
    RankingModule, 
    PrismaModule
  ],
  controllers: [
    AppController, 
    MqttController
  ],
  providers: [AppService],
})
export class AppModule {}
