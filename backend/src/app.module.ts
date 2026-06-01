import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttController } from './mqtt.controller';
import { JogoModule } from './jogo/jogo.module';

@Module({
  imports: [JogoModule],
  controllers: [
    AppController, 
    MqttController
  ],
  providers: [AppService],
})
export class AppModule {}
