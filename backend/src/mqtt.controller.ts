import { Controller, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JogoGateway } from './jogo/jogo.gateway';
import { PrismaService } from './prisma/prisma.service';
import mqtt, { MqttClient } from 'mqtt';

@Controller()
export class MqttController implements OnModuleInit, OnModuleDestroy {
  private readonly statusTopic = 'esp32_genius/status';
  private mqttStatusClient: MqttClient | null = null;

  constructor(
    private readonly jogoGateway: JogoGateway,
    private readonly prisma: PrismaService,
  ) {}

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

    client.on('message', async (topic, payload, packet) => {
      if (topic !== this.statusTopic) {
        return;
      }

      if (packet?.retain) {
        console.log('Ignorando status retido antigo do ESP32.');
        return;
      }

      const raw = payload.toString('utf-8');
      const data = this.parseJson(raw);

      try {
        await this.salvarDadosEmbarcado(data);
      } catch (err) {
        console.error('Falha ao salvar dados do embarcado:', err);
      }

      const online = this.normalizarStatus(raw, data);
      console.log('Status recebido do ESP32:', {
        raw,
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

  private async salvarDadosEmbarcado(data: unknown) {
    if (!data || typeof data !== 'object') {
      return;
    }

    const nome = this.getStringField(data, 'nome');
    const marca = this.getStringField(data, 'marca');
    const modelo = this.getStringField(data, 'modelo');
    const ip = this.getStringField(data, 'ip');

    if (!nome || !marca || !modelo || !ip) {
      return;
    }

    await this.prisma.embarcado.upsert({
      data: {
        nome,
        marca,
        modelo,
        ip,
      },
    });
  }

  private getStringField(data: object, field: string): string | null {
    const value = (data as Record<string, unknown>)[field];

    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private parseJson(raw: string): unknown {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private normalizarStatus(rawPayload: string, parsedPayload: unknown): boolean {
    const raw = rawPayload.trim();

    if (!raw) {
      return false;
    }

    if (typeof parsedPayload === 'boolean') {
      return parsedPayload;
    }

    if (typeof parsedPayload === 'string') {
      return this.parseBoolean(parsedPayload);
    }

    if (parsedPayload && typeof parsedPayload === 'object') {
      const data = parsedPayload as Record<string, unknown>;

      if (typeof data.online === 'boolean') {
        return data.online;
      }

      if (typeof data.status === 'string') {
        return this.parseBoolean(data.status);
      }
    }

    return this.parseBoolean(raw);
  }

  private parseBoolean(value: string): boolean {
    const normalized = value.trim().toLowerCase();
    return normalized === 'online' || normalized === 'true' || normalized === '1';
  }
}
