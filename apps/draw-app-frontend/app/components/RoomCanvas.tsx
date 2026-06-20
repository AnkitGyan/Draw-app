"use client";

import { HTTP_BACKEND, WS_URL } from "@/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({
  slug,
}: {
  slug: string;
}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function connect() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Please login first");
          return;
        }

        
        const roomResponse = await axios.get(
          `${HTTP_BACKEND}/room/${slug}`
        );

        const actualRoomId = roomResponse.data.roomId;

        setRoomId(actualRoomId);

        const ws = new WebSocket(
          `${WS_URL}?token=${token}`
        );

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              type: "join_room",
              roomId: actualRoomId,
            })
          );

          setSocket(ws);
          setLoading(false);
        };

        ws.onclose = () => {
          setSocket(null);
        };

        ws.onerror = () => {
          setLoading(false);
        };

        return () => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: "leave_room",
                roomId: actualRoomId,
              })
            );
          }

          ws.close();
        };
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }

    connect();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Connecting...
      </div>
    );
  }

  if (!socket || roomId === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Failed to connect
      </div>
    );
  }

  return (
    <Canvas
      socket={socket}
      roomId={roomId.toString()}
    />
  );
}