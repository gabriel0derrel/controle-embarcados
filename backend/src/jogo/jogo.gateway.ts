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
  private embarcadoOnline = false;

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
    client.emit('embarcado-status', this.getEmbarcadoSnapshot());
  }

  handleDisconnect(client: Socket) {
    console.log(`Cliente desconectado: ${client.id}`);
  }

  // Envia estado para todos os clientes conectados
  broadcastEstado(estado: any) {
    this.server.emit('estado', estado);
  }

  getEmbarcadoOnline() {
    return this.embarcadoOnline;
  }

  getEmbarcadoSnapshot() {
    return {
      online: this.embarcadoOnline,
      lastSeenAt: null,
    };
  }

  registrarEmbarcadoStatus(online: boolean) {
    if (this.embarcadoOnline === online) {
      this.server.emit('embarcado-status', this.getEmbarcadoSnapshot());
      return;
    }

    this.embarcadoOnline = online;
    this.server.emit('embarcado-status', this.getEmbarcadoSnapshot());
  }
}
