import express from "express";
import type { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
}
);

app.listen(8000, () => {
  console.log("Server is running on port 3000");
});