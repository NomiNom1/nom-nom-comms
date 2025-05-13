// import {
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from "@nestjs/websockets";
// import { Server, Socket } from "socket.io";
// import { ServerToClientEvents } from "./events";

// @WebSocketGateway(3002, {})
// export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server!: Server<any, ServerToClientEvents>;

//   handleConnection(client: Socket) {
//     console.log("New User connected", client.id);

//     client.broadcast.emit("user-joined", {
//       message: `User ${client.id} has connected`,
//     });
//   }

//   handleDisconnect(client: Socket) {
//     console.log("User disconnected", client.id);

//     client.broadcast.emit("user-left", {
//       message: `User ${client.id} has disconnected`,
//     });
//   }

//   @SubscribeMessage("message")
//   handleMessage(client: Socket, message: string) {
//     console.log(message);

//     client.broadcast.emit("message", { message });

//   }
// }
