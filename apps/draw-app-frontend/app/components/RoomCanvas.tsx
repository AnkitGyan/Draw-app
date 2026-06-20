"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({
  roomId,
}: {
  roomId: string;
}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      console.log("Connected to websocket");

      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: Number(roomId),
        })
      );

      setSocket(ws);
      setLoading(false);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setSocket(null);
    };

    ws.onerror = (err) => {
      console.log("WebSocket error", err);
      setLoading(false);
    };

    return () => {
      ws.send(
        JSON.stringify({
          type: "leave_room",
          roomId: Number(roomId),
        })
      );

      ws.close();
    };
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-xl border border-border bg-card p-6 shadow-md">
          <p className="text-muted-foreground">
            Connecting to server...
          </p>
        </div>
      </div>
    );
  }

  if (!socket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="rounded-xl border border-border bg-card p-6 shadow-md">
          <p className="text-destructive">
            Failed to connect to server
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background">
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}

