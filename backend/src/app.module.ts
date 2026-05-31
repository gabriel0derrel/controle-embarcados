import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MqttController } from './mqtt.controller'; // 1. Importe o novo controller

@Module({
  imports: [],
  controllers: [
    AppController, 
    MqttController // 2. Adicione ele aqui na lista
  ],
  providers: [AppService],
})
export class AppModule {}
