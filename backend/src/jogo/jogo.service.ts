import { Injectable, OnModuleDestroy } from '@nestjs/common';
import mqtt, { MqttClient } from 'mqtt';

export type CorGenius = 'verde' | 'vermelho' | 'amarelo' | 'azul';

@Injectable()
export class JogoService implements OnModuleDestroy {
  private client: MqttClient;

  constructor() {
    const url = process.env.MQTT_URL || 'mqtt://localhost:1883';

    this.client = mqtt.connect(url, {
      reconnectPeriod: 5000,
      clean: true,
    });

    this.client.on('connect', () => {
      console.log('Cliente MQTT de comandos conectado:', url);
    });

    this.client.on('error', (error) => {
      console.error('Erro no cliente MQTT de comandos:', error);
    });
  }

  onModuleDestroy() {
    this.client.end(true);
  }

  private publicar(topico: string, payload: Record<string, unknown>) {
    const mensagem = JSON.stringify(payload);

    console.log('Publicando MQTT:', { topico, payload });

    this.client.publish(topico, mensagem, (error) => {
      if (error) {
        console.error('Erro ao publicar MQTT:', { topico, payload, error });
      }
    });

    return { topico, payload };
  }

  enviarLed(cor: CorGenius) {
    return this.publicar('esp32_genius/led', {
      cor,
      acao: 'on',
    });
  }

  enviarJogo(acao: 'iniciar' | 'reiniciar' | 'confirmar') {
    return this.publicar('esp32_genius/jogo', { acao });
  }
}
