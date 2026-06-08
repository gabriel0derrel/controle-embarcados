import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EmbarcadoService } from './embarcado.service';

@Module({
  imports: [PrismaModule],
  providers: [EmbarcadoService],
  exports: [EmbarcadoService],
})
export class EmbarcadoModule {}
