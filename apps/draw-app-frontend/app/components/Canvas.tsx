"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, Pencil, RectangleHorizontalIcon } from "lucide-react";

import { IconButton } from "./IconButton";
import { Game } from "@/draw/Game";

export type Tool = "circle" | "rect" | "pencil";

export function Canvas({
  roomId,
  socket,
}: {
  socket: WebSocket;
  roomId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] =
    useState<Tool>("circle");

  // Update tool whenever selection changes
  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  // Initialize canvas/game
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const g = new Game(canvas, roomId, socket);

    setGame(g);

    // Handle resizing
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      g.redraw?.();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );

      g.destroy();
    };
  }, [roomId, socket]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        className="h-screen w-screen"
      />

      <Topbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
      />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
}) {
  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-lg">

        <IconButton
          onClick={() => setSelectedTool("pencil")}
          activated={selectedTool === "pencil"}
          icon={<Pencil size={18} />}
        />

        <IconButton
          onClick={() => setSelectedTool("rect")}
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontalIcon size={18} />}
        />

        <IconButton
          onClick={() => setSelectedTool("circle")}
          activated={selectedTool === "circle"}
          icon={<Circle size={18} />}
        />
      </div>
    </div>
  );
}

