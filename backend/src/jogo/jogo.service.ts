import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class JogoService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.MQTT,
      options: {
        url: process.env.MQTT_URL || 'mqtt://localhost:1883',
      },
    });
  }

  enviarLed(cor: string) {
    return this.client.emit('esp32_genius/led', {
      cor,
      acao: 'on',
    });
  }

  enviarJogo(acao: 'iniciar' | 'reiniciar' | 'confirmar') {
    return this.client.emit('esp32_genius/jogo', { acao });
  }
}
