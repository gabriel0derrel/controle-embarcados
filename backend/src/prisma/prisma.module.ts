import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exportamos para que outros módulos possam usá-lo
})
export class PrismaModule {}
