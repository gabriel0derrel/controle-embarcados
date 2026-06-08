import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // Conecta o microserviço MQTT sem bloquear a subida da API HTTP
  const mqttMicroservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: process.env.MQTT_URL || 'mqtt://localhost:1883',
      // O 'mqtt://localhost:1883' serve como fallback caso você rode fora do Docker localmente
    },
  });

  // Inicializa a API HTTP convencional
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);

  // Sobe o MQTT em paralelo e deixa a API HTTP responder mesmo se o broker demorar.
  void mqttMicroservice.listen().catch((error) => {
    console.error('Falha ao iniciar microserviço MQTT:', error);
  });
}
bootstrap();
