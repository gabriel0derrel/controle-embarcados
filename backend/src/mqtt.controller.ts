import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JogoGateway } from './jogo/jogo.gateway';

@Controller()
export class MqttController {
  constructor(private readonly jogoGateway: JogoGateway) {}

  @EventPattern('esp32_genius/estado')
  handleEstado(@Payload() data: any) {
    console.log('Estado recebido do ESP32:', data);
    this.jogoGateway.broadcastEstado(data);
  }

  @EventPattern('esp32/led')
  handleTelemetry(@Payload() data: any) {
    console.log('Dados recebidos do ESP32:', data);
  }
}
