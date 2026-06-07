import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

type QueryResult<T> = {
  rows: T[];
};

type PgPool = {
  query<T = unknown>(query: string, values?: unknown[]): Promise<QueryResult<T>>;
  end(): Promise<void>;
};

const { Pool } = require('pg') as {
  Pool: new (config: { connectionString: string }) => PgPool;
};

type PartidaRecord = {
  id: number;
  apelido: string;
  fase: number;
  createdAt: Date;
};

export type PartidaCreateInput = {
  apelido: string;
  fase: number;
};

export type PartidaSelect = {
  id?: boolean;
  apelido?: boolean;
  fase?: boolean;
  createdAt?: boolean;
};

export type PartidaOrderBy = Array<{
  id?: 'asc' | 'desc';
  apelido?: 'asc' | 'desc';
  fase?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
}>;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly pool: PgPool;
  private readonly orderColumns: Record<keyof PartidaRecord, string> = {
    id: 'id',
    apelido: 'apelido',
    fase: 'fase',
    createdAt: '"createdAt"',
  };

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL não configurada para persistir o ranking.');
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  partida = {
    create: async ({
      data,
      select,
    }: {
      data: PartidaCreateInput;
      select?: PartidaSelect;
    }) => {
      const result = await this.pool.query<PartidaRecord>(
        `
          INSERT INTO partida (apelido, fase)
          VALUES ($1, $2)
          RETURNING id, apelido, fase, "createdAt"
        `,
        [data.apelido, data.fase],
      );

      return this.aplicarSelect(result.rows[0], select);
    },

    findMany: async ({
      orderBy,
      select,
    }: {
      orderBy?: PartidaOrderBy;
      select?: PartidaSelect;
    }) => {
      const orderClause = this.montarOrderBy(orderBy);
      const result = await this.pool.query<PartidaRecord>(
        `
          SELECT id, apelido, fase, "createdAt"
          FROM partida
          ${orderClause}
        `,
      );

      return result.rows.map((item) => this.aplicarSelect(item, select));
    },
  };

  async onModuleInit() {
    await this.$connect();
    await this.garantirSchema();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async $connect() {
    await this.pool.query('SELECT 1');
  }

  async $disconnect() {
    await this.pool.end();
  }

  private async garantirSchema() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS partida (
        id SERIAL PRIMARY KEY,
        apelido VARCHAR(20) NOT NULL,
        fase INTEGER NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.pool.query(`
      ALTER TABLE partida
      ALTER COLUMN apelido TYPE VARCHAR(20)
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS partida_fase_idx
      ON partida (fase)
    `);
  }

  private montarOrderBy(orderBy: PartidaOrderBy | undefined) {
    const clauses: string[] = [];

    for (const criterio of orderBy ?? []) {
      for (const [key, direction] of Object.entries(criterio)) {
        if (!(key in this.orderColumns)) {
          continue;
        }

        const column = this.orderColumns[key as keyof PartidaRecord];
        const sqlDirection = direction === 'desc' ? 'DESC' : 'ASC';
        clauses.push(`${column} ${sqlDirection}`);
      }
    }

    return clauses.length > 0 ? `ORDER BY ${clauses.join(', ')}` : '';
  }

  private aplicarSelect(
    record: PartidaRecord,
    select: PartidaSelect | undefined,
  ) {
    if (!select) {
      return record;
    }

    const result: Record<string, unknown> = {};

    for (const key of Object.keys(select)) {
      if (select[key]) {
        result[key] = record[key as keyof PartidaRecord];
      }
    }

    return result;
  }
}
