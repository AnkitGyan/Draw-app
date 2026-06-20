"use client";

import { WS_URL } from "@/config";
import { initDraw } from "@/draw/index";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyMzY2OWM2YS1jM2Q4LTRjM2QtYTgxNS04YWVmNmIyZjRkZWEiLCJpYXQiOjE3ODE5ODI4Njh9.l0aWTQBKsp1x4hncoOLJvPS6-F2CM1Jv9hylUQ9Y4Bs`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            ws.send(data)
        }
        
    }, [])
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}