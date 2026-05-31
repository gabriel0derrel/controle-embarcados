import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Conecta o microserviço MQTT apontando para o container do Docker
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: process.env.MQTT_URL ?? 'mqtt://localhost:1883', 
      // O 'mqtt://localhost:1883' serve como fallback caso você rode fora do Docker localmente
    },
  });

  // Inicializa o microserviço MQTT para escutar os tópicos
  await app.startAllMicroservices();
  
  // Inicializa a API HTTP convencional
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
