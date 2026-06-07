import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RankingEntry {
  id: number;
  apelido: string;
  fase: number;
  createdAt: Date;
}

export interface RankingListEntry {
  id: number;
  apelido: string;
  fase: number;
}

@Injectable()
export class RankingService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizarApelido(apelido: string): string {
    const valor = apelido?.trim();

    if (!valor || valor.length < 1 || valor.length > 20) {
      throw new BadRequestException(
        'Nome inválido. Use de 1 a 20 caracteres.',
      );
    }

    return valor;
  }

  private validarFase(fase: number): number {
    if (!Number.isInteger(fase) || fase < 1) {
      throw new BadRequestException('Fase inválida. Use um inteiro positivo.');
    }

    return fase;
  }

  async salvar(apelido: string, fase: number): Promise<RankingEntry> {
    const entry = (await this.prisma.partida.create({
      data: {
        apelido: this.normalizarApelido(apelido),
        fase: this.validarFase(fase),
      },
      select: {
        id: true,
        apelido: true,
        fase: true,
        createdAt: true,
      },
    })) as RankingEntry;

    return entry;
  }

  async listar(): Promise<RankingListEntry[]> {
    return (await this.prisma.partida.findMany({
      orderBy: [
        { fase: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        apelido: true,
        fase: true,
      },
    })) as RankingListEntry[];
  }
}
