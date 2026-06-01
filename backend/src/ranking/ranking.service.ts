import { Injectable } from '@nestjs/common';

export interface RankingEntry {
  id: number;
  apelido: string;
  fase: number;
  created_at: Date;
}

@Injectable()
export class RankingService {
  // Placeholder - será conectado ao PostgreSQL depois
  private rankings: RankingEntry[] = [];
  private idCounter = 1;

  async salvar(apelido: string, fase: number): Promise<RankingEntry> {
    const entry: RankingEntry = {
      id: this.idCounter++,
      apelido: apelido.toUpperCase().slice(0, 3),
      fase,
      created_at: new Date(),
    };
    this.rankings.push(entry);
    return entry;
  }

  async listar(): Promise<RankingEntry[]> {
    return this.rankings
      .sort((a, b) => b.fase - a.fase)
      .slice(0, 10);
  }
}
