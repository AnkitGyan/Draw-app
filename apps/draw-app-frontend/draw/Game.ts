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
      startX: number;
      startY: number;
      endX: number;
      endY: number;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private roomId: string;
  private clicked = false;
  private startX = 0;
  private startY = 0;
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

    // Set canvas dimensions
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  async init() {
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  public redraw() {
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
        const parsedData = JSON.parse(message.message);

        this.existingShapes.push(parsedData.shape);

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

    // Background
    this.ctx.fillStyle = "#111827";
    this.ctx.fillRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    this.ctx.strokeStyle = "white";

    this.existingShapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeRect(
          shape.x,
          shape.y,
          shape.width,
          shape.height
        );
      }

      if (shape.type === "circle") {
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

      if (shape.type === "pencil") {
        this.ctx.beginPath();

        this.ctx.moveTo(
          shape.startX,
          shape.startY
        );

        this.ctx.lineTo(
          shape.endX,
          shape.endY
        );

        this.ctx.stroke();
        this.ctx.closePath();
      }
    });
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;

    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;

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

    if (this.selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;

      shape = {
        type: "circle",
        radius,
        centerX: this.startX + radius,
        centerY: this.startY + radius,
      };
    }

    if (this.selectedTool === "pencil") {
      shape = {
        type: "pencil",
        startX: this.startX,
        startY: this.startY,
        endX: e.clientX,
        endY: e.clientY,
      };
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

    const width = e.clientX - this.startX;
    const height = e.clientY - this.startY;

    this.clearCanvas();

    this.ctx.strokeStyle = "white";

    if (this.selectedTool === "rect") {
      this.ctx.strokeRect(
        this.startX,
        this.startY,
        width,
        height
      );
    }

    if (this.selectedTool === "circle") {
      const radius = Math.max(width, height) / 2;

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

    if (this.selectedTool === "pencil") {
      this.ctx.beginPath();

      this.ctx.moveTo(
        this.startX,
        this.startY
      );

      this.ctx.lineTo(
        e.clientX,
        e.clientY
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