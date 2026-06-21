import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    }
  | {
      type: "pencil";
      points?: {
        x: number;
        y: number;
      }[];
      startX?: number;
      startY?: number;
      endX?: number;
      endY?: number;
    }
  | {
      type: "text";
      x: number;
      y: number;
      text: string;
    };

declare global {
  interface Window {
    selectedTool?: string;
  }
}

export async function initDraw(
  canvas: HTMLCanvasElement,
  roomId: string,
  socket: WebSocket
) {
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  let existingShapes: Shape[] =
    await getExistingShapes(roomId);

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "chat") {
      const parsedShape = JSON.parse(
        message.message
      );

      existingShapes.push(
        parsedShape.shape
      );

      clearCanvas(
        existingShapes,
        canvas,
        ctx
      );
    }
  };

  clearCanvas(
    existingShapes,
    canvas,
    ctx
  );

  let clicked = false;
  let startX = 0;
  let startY = 0;

  let currentPoints: {
    x: number;
    y: number;
  }[] = [];

  canvas.addEventListener(
    "mousedown",
    (e) => {
      const selectedTool =
        window.selectedTool;

      // TEXT TOOL
      if (selectedTool === "text") {
        const text = prompt(
          "Enter text"
        );

        if (!text) return;

        const shape: Shape = {
          type: "text",
          x: e.clientX,
          y: e.clientY,
          text,
        };

        existingShapes.push(shape);

        socket.send(
          JSON.stringify({
            type: "chat",
            message: JSON.stringify({
              shape,
            }),
            roomId,
          })
        );

        clearCanvas(
          existingShapes,
          canvas,
          ctx
        );

        return;
      }

      // ERASER TOOL
      if (selectedTool === "eraser") {
        existingShapes =
          existingShapes.filter(
            (shape) => {
              if (
                shape.type === "rect"
              ) {
                return !(
                  e.clientX >= shape.x &&
                  e.clientX <=
                    shape.x +
                      shape.width &&
                  e.clientY >= shape.y &&
                  e.clientY <=
                    shape.y +
                      shape.height
                );
              }

              return true;
            }
          );

        clearCanvas(
          existingShapes,
          canvas,
          ctx
        );

        return;
      }

      clicked = true;

      startX = e.clientX;
      startY = e.clientY;

      if (
        selectedTool === "pencil"
      ) {
        currentPoints = [
          {
            x: e.clientX,
            y: e.clientY,
          },
        ];
      }
    }
  );

  canvas.addEventListener(
    "mouseup",
    (e) => {
      clicked = false;

      const width =
        e.clientX - startX;

      const height =
        e.clientY - startY;

      const selectedTool =
        window.selectedTool;

      let shape: Shape | null =
        null;

      if (selectedTool === "rect") {
        shape = {
          type: "rect",
          x: startX,
          y: startY,
          width,
          height,
        };
      }

      else if (
        selectedTool === "circle"
      ) {
        const radius =
          Math.max(width, height) / 2;

        shape = {
          type: "circle",
          radius,
          centerX: startX + radius,
          centerY: startY + radius,
        };
      }

      else if (
        selectedTool === "pencil"
      ) {
        shape = {
          type: "pencil",
          points: [
            ...currentPoints,
          ],
        };

        currentPoints = [];
      }

      if (!shape) return;

      existingShapes.push(shape);

      socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({
            shape,
          }),
          roomId,
        })
      );

      clearCanvas(
        existingShapes,
        canvas,
        ctx
      );
    }
  );

  canvas.addEventListener(
    "mousemove",
    (e) => {
      if (!clicked) return;

      const width =
        e.clientX - startX;

      const height =
        e.clientY - startY;

      clearCanvas(
        existingShapes,
        canvas,
        ctx
      );

      const selectedTool =
        window.selectedTool;

      ctx.strokeStyle = "white";

      if (selectedTool === "rect") {
        ctx.strokeRect(
          startX,
          startY,
          width,
          height
        );
      }

      else if (
        selectedTool === "circle"
      ) {
        const radius =
          Math.max(width, height) / 2;

        ctx.beginPath();

        ctx.arc(
          startX + radius,
          startY + radius,
          Math.abs(radius),
          0,
          Math.PI * 2
        );

        ctx.stroke();
        ctx.closePath();
      }

      else if (
        selectedTool === "pencil"
      ) {
        currentPoints.push({
          x: e.clientX,
          y: e.clientY,
        });

        ctx.beginPath();

        currentPoints.forEach(
          (point, index) => {
            if (index === 0) {
              ctx.moveTo(
                point.x,
                point.y
              );
            } else {
              ctx.lineTo(
                point.x,
                point.y
              );
            }
          }
        );

        ctx.stroke();
        ctx.closePath();
      }
    }
  );
}

function clearCanvas(
  existingShapes: Shape[],
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D
) {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.fillStyle = "#111827";

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  existingShapes.forEach(
    (shape) => {
      ctx.strokeStyle = "white";
      ctx.fillStyle = "white";

      if (shape.type === "rect") {
        ctx.strokeRect(
          shape.x,
          shape.y,
          shape.width,
          shape.height
        );
      }

      else if (
        shape.type === "circle"
      ) {
        ctx.beginPath();

        ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          Math.PI * 2
        );

        ctx.stroke();
        ctx.closePath();
      }

      else if (
        shape.type === "pencil"
      ) {
        ctx.beginPath();

        // New freehand format
        if (
          shape.points &&
          shape.points.length > 1
        ) {
          shape.points.forEach(
            (point, index) => {
              if (index === 0) {
                ctx.moveTo(
                  point.x,
                  point.y
                );
              } else {
                ctx.lineTo(
                  point.x,
                  point.y
                );
              }
            }
          );
        }

        // Old line format
        else if (
          shape.startX !==
            undefined &&
          shape.startY !==
            undefined &&
          shape.endX !== undefined &&
          shape.endY !== undefined
        ) {
          ctx.moveTo(
            shape.startX,
            shape.startY
          );

          ctx.lineTo(
            shape.endX,
            shape.endY
          );
        }

        ctx.stroke();
        ctx.closePath();
      }

      else if (
        shape.type === "text"
      ) {
        ctx.font = "20px Arial";

        ctx.fillText(
          shape.text,
          shape.x,
          shape.y
        );
      }
    }
  );
}

async function getExistingShapes(
  roomId: string
) {
  const res = await axios.get(
    `${HTTP_BACKEND}/chats/${roomId}`
  );

  const messages =
    res.data.messages ?? [];

  return messages
    .map(
      (msg: { message: string }) => {
        try {
          const parsed = JSON.parse(
            msg.message
          );

          return parsed.shape;
        } catch {
          return null;
        }
      }
    )
    .filter(Boolean);
}