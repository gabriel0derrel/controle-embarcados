import { Controller, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JogoGateway } from './jogo/jogo.gateway';
import mqtt, { MqttClient } from 'mqtt';

@Controller()
export class MqttController implements OnModuleInit, OnModuleDestroy {
  private readonly statusTopic = 'esp32_genius/status';
  private mqttStatusClient: MqttClient | null = null;

  constructor(private readonly jogoGateway: JogoGateway) {}

  onModuleInit() {
    this.conectarPresenca();
  }

  onModuleDestroy() {
    this.mqttStatusClient?.end(true);
    this.mqttStatusClient = null;
  }

  @EventPattern('esp32_genius/estado')
  handleEstado(@Payload() data: any) {
    console.log('Estado recebido do ESP32:', data);
    this.jogoGateway.registrarEmbarcadoStatus(true);
    this.jogoGateway.broadcastEstado(data);
  }

  @EventPattern('esp32_genius/led')
  handleTelemetry(@Payload() data: any) {
    console.log('Dados recebidos do ESP32:', data);
  }

  private conectarPresenca() {
    if (this.mqttStatusClient) {
      return;
    }

    const url = process.env.MQTT_URL || 'mqtt://localhost:1883';
    const client = mqtt.connect(url, {
      reconnectPeriod: 5000,
      clean: true,
    });

    client.on('connect', () => {
      client.subscribe(this.statusTopic, (err) => {
        if (err) {
          console.error('Falha ao assinar tópico de presença:', err);
        }
      });
    });

    client.on('message', (topic, payload, packet) => {
      if (topic !== this.statusTopic) {
        return;
      }

      if (packet?.retain) {
        console.log('Ignorando status retido antigo do ESP32.');
        return;
      }

      const online = this.normalizarStatus(payload);
      console.log('Status recebido do ESP32:', {
        raw: payload.toString('utf-8'),
        online,
      });
      this.jogoGateway.registrarEmbarcadoStatus(online);
    });

    client.on('error', (err) => {
      console.error('Erro no cliente MQTT de presença:', err);
    });

    client.on('close', () => {
      this.jogoGateway.registrarEmbarcadoStatus(false);
    });

    this.mqttStatusClient = client;
  }

  private normalizarStatus(payload: Buffer): boolean {
    const raw = payload.toString('utf-8').trim();

    if (!raw) {
      return false;
    }

    try {
      const data = JSON.parse(raw);

      if (typeof data === 'boolean') {
        return data;
      }

      if (typeof data === 'string') {
        return this.parseBoolean(data);
      }

      if (data && typeof data === 'object') {
        if (typeof data.online === 'boolean') {
          return data.online;
        }

        if (typeof data.status === 'string') {
          return this.parseBoolean(data.status);
        }
      }
    } catch {
      return this.parseBoolean(raw);
    }

    return false;
  }

  private parseBoolean(value: string): boolean {
    const normalized = value.trim().toLowerCase();
    return normalized === 'online' || normalized === 'true' || normalized === '1';
  }
}
