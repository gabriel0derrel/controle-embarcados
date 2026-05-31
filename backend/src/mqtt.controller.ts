import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class MqttController {
  
  // Escuta o tópico especificado
  @EventPattern('esp32/led')
  handleTelemetry(@Payload() data: any) {
    console.log('Dados recebidos do ESP32:', data);
    // Aqui você pode salvar no Postgres usando seu serviço
  }
}
