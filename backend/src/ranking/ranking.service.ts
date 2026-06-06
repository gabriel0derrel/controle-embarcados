import { Injectable, BadRequestException, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface RankingEntry {
  id: number;
  apelido: string;
  fase: number;
  created_at: Date;
}

@Injectable()
export class RankingService implements OnModuleDestroy {
  private prisma = new PrismaClient();

  async salvar(apelido: any, fase: any): Promise<RankingEntry> {
    if (!apelido || typeof apelido !== 'string') throw new BadRequestException('apelido inválido');
    const faseNum = Number(fase);
    if (!Number.isFinite(faseNum)) throw new BadRequestException('fase inválida');

    const apelidoClean = apelido.toUpperCase().slice(0, 20);

    const created = await this.prisma.ranking.create({
      data: {
        apelido: apelidoClean,
        fase: faseNum,
      },
    });

    return {
      id: created.id,
      apelido: created.apelido,
      fase: created.fase,
      created_at: created.created_at,
    };
  }

  async listar(): Promise<RankingEntry[]> {
    const items = await this.prisma.ranking.findMany({
      orderBy: [
        { fase: 'desc' },
        { created_at: 'desc' },
      ],
      take: 10,
    });

    return items.map((i) => ({ id: i.id, apelido: i.apelido, fase: i.fase, created_at: i.created_at }));
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
