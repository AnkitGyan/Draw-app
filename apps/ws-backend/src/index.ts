import { WebSocketServer } from "ws";
import { RawData } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";


const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, request) => {
  const url = request.url;

  if (!url) {
    ws.close(1008, "Invalid URL");
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token");

  if (!token) {
    ws.close(1008, "Token missing");
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if(!decoded || !(decoded as JwtPayload).userId){
      ws.close(1008, "User is not authenticated");
      return;
    }

    ws.on("message", (data : RawData) => {
      ws.send(`Hello, you sent -> ${data}`);
    });
  } catch (err) {
    console.log("Invalid token");
    ws.close(1008, "Invalid token");
  }
});