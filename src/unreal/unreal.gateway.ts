import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UnrealService } from './unreal.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UnrealGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly unrealService: UnrealService) {}

  handleConnection(client: Socket) {
    console.log(`Unreal client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Unreal client disconnected: ${client.id}`);
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
    await this.unrealService.updateSessionDuration(data.sessionId, data.duration);
    client.emit('sessionCompleted', { success: true });
  }
}