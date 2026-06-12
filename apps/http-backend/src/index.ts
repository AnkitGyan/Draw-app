import express from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types";
import { Client } from "@repo/db/client";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
}
);

app.post("/signup", (req: Request, res: Response)=>{
  const data = CreateUserSchema.safeParse(req.body);
  if(!data.success){
    return res.json({
      message: "Incorrect Inputs"
    })
  }

  res.status(2000).json({
    message: "Signup successfull",
  })
})

app.post("/login", (req: Request, res: Response)=>{
  const data = SigninSchema.safeParse(req.body);
  if(!data.success){
    res.json({
      message:"Incorrect Inputs",
    })
  }
  res.status(2000).json({
    message: "Login successfull",
  })
});

app.post("/room", Middleware, (req: Request, res:Response)=>{
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success){
      return res.json({
        message: "Incorrect Inputs"
      })
    }
    res.status(2000).json({
      message: "Room created successfully",
    })
})

app.listen(8000, () => {
  console.log("Server is running on port 3000");
});