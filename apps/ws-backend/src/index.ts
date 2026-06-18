import { WebSocketServer, WebSocket, RawData } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { Client } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (typeof decoded === "string") {
      return null;
    }

    if (!decoded?.userId) {
      return null;
    }

    return decoded.userId;
  } catch {
    return null;
  }
}

wss.on("connection", async (ws, request) => {
  const url = request.url;

  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token");

  if (!token) {
    ws.close();
    return;
  }

  const userId = checkUser(token);

  if (!userId) {
    ws.close();
    return;
  }

  const currentUser: User = {
    userId,
    rooms: [],
    ws,
  };

  users.push(currentUser);

  console.log(`User connected: ${userId}`);

  ws.on("message", async (data: RawData) => {
    try {
      const parsedData = JSON.parse(data.toString());

      switch (parsedData.type) {
        case "join_room": {
          const roomId = parsedData.roomId;

          if (!currentUser.rooms.includes(roomId)) {
            currentUser.rooms.push(roomId);
          }

          ws.send(
            JSON.stringify({
              type: "joined",
              roomId,
            })
          );

          break;
        }

        case "leave_room": {
          const roomId = parsedData.roomId;

          currentUser.rooms = currentUser.rooms.filter(
            (room) => room !== roomId
          );

          ws.send(
            JSON.stringify({
              type: "left",
              roomId,
            })
          );

          break;
        }

        case "chat": {
          const roomId = parsedData.roomId;
          const message = parsedData.message;

           const chat = await Client.chat.create({
              data: {
                message,
                roomId,
                userId: currentUser.userId,
              },
            });


          users.forEach((user) => {
            if (user.rooms.includes(roomId)) {
              user.ws.send(
                JSON.stringify({
                  type: "chat",
                  roomId,
                  message,
                  senderId: currentUser.userId,
                })
              );
            }
          });

          break;
        }

        default:
          ws.send(
            JSON.stringify({
              error: "Invalid message type",
            })
          );
      }
    } catch (err) {
      console.log(err);
    }
  });

  ws.on("close", () => {
    const index = users.findIndex((u) => u.userId === userId);

    if (index !== -1) {
      users.splice(index, 1);
    }

    console.log(`User disconnected: ${userId}`);
  });
});

console.log("WebSocket server running on port 8080");