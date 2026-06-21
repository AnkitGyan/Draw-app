import { Tool } from "@/app/components/Canvas";
import { getExistingShapes } from "./http";

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
      points: {
        x: number;
        y: number;
      }[];
    }
  | {
      type: "text";
      x: number;
      y: number;
      text: string;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];

  private roomId: string;
  private clicked = false;

  private startX = 0;
  private startY = 0;

  private currentPoints: {
    x: number;
    y: number;
  }[] = [];

  private selectedTool: Tool = "circle";

  socket: WebSocket;

  constructor(
    canvas: HTMLCanvasElement,
    roomId: string,
    socket: WebSocket
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  async init() {
    this.existingShapes =
      await getExistingShapes(this.roomId);

    this.clearCanvas();
  }

  redraw() {
    this.clearCanvas();
  }

  destroy() {
    this.canvas.removeEventListener(
      "mousedown",
      this.mouseDownHandler
    );

    this.canvas.removeEventListener(
      "mouseup",
      this.mouseUpHandler
    );

    this.canvas.removeEventListener(
      "mousemove",
      this.mouseMoveHandler
    );

    this.socket.onmessage = null;
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsedData = JSON.parse(
          message.message
        );

        this.existingShapes.push(
          parsedData.shape
        );

        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    this.ctx.fillStyle = "#111827";

    this.ctx.fillRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    this.ctx.strokeStyle = "white";
    this.ctx.fillStyle = "white";

    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeRect(
          shape.x,
          shape.y,
          shape.width,
          shape.height
        );
      }

      else if (shape.type === "circle") {
        this.ctx.beginPath();

        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          Math.abs(shape.radius),
          0,
          Math.PI * 2
        );

        this.ctx.stroke();
        this.ctx.closePath();
      }

      else if (shape.type === "pencil") {
        if (shape.points.length < 2) return;

        this.ctx.beginPath();

        shape.points.forEach(
          (point, index) => {
            if (index === 0) {
              this.ctx.moveTo(
                point.x,
                point.y
              );
            } else {
              this.ctx.lineTo(
                point.x,
                point.y
              );
            }
          }
        );

        this.ctx.stroke();
        this.ctx.closePath();
      }

      else if (shape.type === "text") {
        this.ctx.font = "20px Arial";

        this.ctx.fillText(
          shape.text,
          shape.x,
          shape.y
        );
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    // TEXT TOOL

    if (this.selectedTool === "text") {
      const text = prompt("Enter text");

      if (!text) return;

      const shape: Shape = {
        type: "text",
        x: e.clientX,
        y: e.clientY,
        text,
      };

      this.existingShapes.push(shape);

      this.clearCanvas();

      this.socket.send(
        JSON.stringify({
          type: "chat",
          roomId: Number(this.roomId),
          message: JSON.stringify({
            shape,
          }),
        })
      );

      return;
    }

    // ERASER

    if (this.selectedTool === "eraser") {
      this.existingShapes =
        this.existingShapes.filter(
          (shape) => {
            if (shape.type === "rect") {
              return !(
                e.clientX >= shape.x &&
                e.clientX <= shape.x + shape.width &&
                e.clientY >= shape.y &&
                e.clientY <= shape.y + shape.height
              );
            }

            return true;
          }
        );

      this.clearCanvas();
      return;
    }

    this.clicked = true;

    this.startX = e.clientX;
    this.startY = e.clientY;

    if (this.selectedTool === "pencil") {
      this.currentPoints = [
        {
          x: e.clientX,
          y: e.clientY,
        },
      ];
    }
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;

    const width =
      e.clientX - this.startX;

    const height =
      e.clientY - this.startY;

    let shape: Shape | null = null;

    if (this.selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    }

    else if (this.selectedTool === "circle") {
      const radius =
        Math.max(width, height) / 2;

      shape = {
        type: "circle",
        radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      };
    }

    else if (this.selectedTool === "pencil") {
      shape = {
        type: "pencil",
        points: [...this.currentPoints],
      };

      this.currentPoints = [];
    }

    if (!shape) return;

    this.existingShapes.push(shape);

    this.clearCanvas();

    this.socket.send(
      JSON.stringify({
        type: "chat",
        roomId: Number(this.roomId),
        message: JSON.stringify({
          shape,
        }),
      })
    );
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    const width =
      e.clientX - this.startX;

    const height =
      e.clientY - this.startY;

    this.clearCanvas();

    if (this.selectedTool === "rect") {
      this.ctx.strokeRect(
        this.startX,
        this.startY,
        width,
        height
      );
    }

    else if (this.selectedTool === "circle") {
      const radius =
        Math.max(width, height) / 2;

      this.ctx.beginPath();

      this.ctx.arc(
        this.startX + radius,
        this.startY + radius,
        Math.abs(radius),
        0,
        Math.PI * 2
      );

      this.ctx.stroke();
      this.ctx.closePath();
    }

    else if (this.selectedTool === "pencil") {
      this.currentPoints.push({
        x: e.clientX,
        y: e.clientY,
      });

      this.ctx.beginPath();

      this.currentPoints.forEach(
        (point, index) => {
          if (index === 0) {
            this.ctx.moveTo(
              point.x,
              point.y
            );
          } else {
            this.ctx.lineTo(
              point.x,
              point.y
            );
          }
        }
      );

      this.ctx.stroke();
      this.ctx.closePath();
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener(
      "mousedown",
      this.mouseDownHandler
    );

    this.canvas.addEventListener(
      "mouseup",
      this.mouseUpHandler
    );

    this.canvas.addEventListener(
      "mousemove",
      this.mouseMoveHandler
    );
  }
}