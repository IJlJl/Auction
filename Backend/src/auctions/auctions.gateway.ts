import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'] 
})
export class AuctionsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  
  handleConnection(client: any) {
    console.log(`Клієнт підключився: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Клієнт відключився: ${client.id}`);
  }

  notifyPriceUpdate(auctionId: string, newPrice: number) {
    console.log(`Надсилаю сигнал через сокети для ${auctionId}: ${newPrice}`);
    this.server.emit('priceUpdated', { auctionId, newPrice });
  }
}