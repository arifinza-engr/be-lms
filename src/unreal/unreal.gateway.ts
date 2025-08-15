import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UnrealService } from './unreal.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  namespace: '/unreal',
})
export class UnrealGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(UnrealGateway.name);
  private server: Server;

  constructor(
    private readonly unrealService: UnrealService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
    this.logger.log('Unreal WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Unreal client connected: ${client.id}`);

    // Optional: Add authentication check here
    // const token = client.handshake.auth.token;
    // if (!token) {
    //   client.disconnect();
    //   return;
    // }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Unreal client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinSession')
  async handleJoinSession(
    @MessageBody() data: { subchapterId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const sessionData = await this.unrealService.getMetahumanSessionData(
      data.subchapterId,
      data.userId,
    );

    client.join(`session-${data.subchapterId}-${data.userId}`);
    client.emit('sessionData', sessionData);
  }

  @SubscribeMessage('updateProgress')
  handleUpdateProgress(
    @MessageBody() data: { sessionId: string; progress: number },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast progress update to other clients in the same session
    client.broadcast.emit('progressUpdate', data);
  }

  @SubscribeMessage('sessionComplete')
  async handleSessionComplete(
    @MessageBody() data: { sessionId: string; duration: number },
    @ConnectedSocket() client: Socket,
  ) {
    await this.unrealService.updateSessionDuration(
      data.sessionId,
      data.duration,
    );
    client.emit('sessionCompleted', { success: true });
  }
}
