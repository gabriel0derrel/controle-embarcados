import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@WebSocketGateway({
  cors: { origin: '*' },
  path: '/socket.io',
})
export class JogoGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private mqttClient: ClientProxy;

  constructor() {
    this.mqttClient = ClientProxyFactory.create({
      transport: Transport.MQTT,
      options: {
        url: process.env.MQTT_URL || 'mqtt://localhost:1883',
      },
    });
  }

  afterInit() {
    console.log('WebSocket Gateway iniciado');
  }

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // Envia estado para todos os clientes conectados
  broadcastEstado(estado: any) {
    this.server.emit('estado', estado);
  }
}
