import express from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Middleware } from "./middleware";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
}
);

app.post("/signup", (req: Request, res: Response)=>{
  const {name, email, password} = req.body;
  res.status(2000).json({
    message: "Signup successfull",
  })
})

app.post("/login", (req: Request, res: Response)=>{
  const {email, password} = req.body;

  res.status(2000).json({
    message: "Login successfull",
  })
});

app.post("/room", Middleware, (req: Request, res:Response)=>{

})

app.listen(8000, () => {
  console.log("Server is running on port 3000");
});