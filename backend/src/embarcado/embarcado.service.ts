import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmbarcadoService {
  constructor(private readonly prisma: PrismaService) {}

  async processarStatus(rawPayload: string): Promise<boolean> {
    const parsedPayload = this.parseJson(rawPayload);
    const online = this.normalizarStatus(rawPayload, parsedPayload);

    try {
      await this.salvarDadosConexao(parsedPayload);
    } catch (err) {
      console.error('Falha ao salvar dados do embarcado:', err);
    }

    return online;
  }

  private async salvarDadosConexao(data: unknown) {
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
