"use client";

import { useEffect, useRef, useState } from "react";
import {
  Circle,
  Pencil,
  RectangleHorizontalIcon,
  Type,
  Eraser,
} from "lucide-react";

import { IconButton } from "./IconButton";
import { initDraw } from "@/draw";

export type Tool =
  | "circle"
  | "rect"
  | "pencil"
  | "text"
  | "eraser";

declare global {
  interface Window {
    selectedTool?: string;
  }
}

export function Canvas({
  roomId,
  socket,
}: {
  socket: WebSocket;
  roomId: string;
}) {
  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const [selectedTool, setSelectedTool] =
    useState<Tool>("circle");

  useEffect(() => {
    window.selectedTool = selectedTool;
  }, [selectedTool]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    initDraw(canvas, roomId, socket);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
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
        setSelectedTool={
          setSelectedTool
        }
      />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
}: {
  selectedTool: Tool;
  setSelectedTool: (
    tool: Tool
  ) => void;
}) {
  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-lg">

        <IconButton
          onClick={() =>
            setSelectedTool(
              "pencil"
            )
          }
          activated={
            selectedTool ===
            "pencil"
          }
          icon={<Pencil size={18} />}
        />

        <IconButton
          onClick={() =>
            setSelectedTool("rect")
          }
          activated={
            selectedTool === "rect"
          }
          icon={
            <RectangleHorizontalIcon
              size={18}
            />
          }
        />

        <IconButton
          onClick={() =>
            setSelectedTool(
              "circle"
            )
          }
          activated={
            selectedTool ===
            "circle"
          }
          icon={<Circle size={18} />}
        />

        <IconButton
          onClick={() =>
            setSelectedTool("text")
          }
          activated={
            selectedTool === "text"
          }
          icon={<Type size={18} />}
        />

        <IconButton
          onClick={() =>
            setSelectedTool(
              "eraser"
            )
          }
          activated={
            selectedTool ===
            "eraser"
          }
          icon={<Eraser size={18} />}
        />
      </div>
    </div>
  );
}