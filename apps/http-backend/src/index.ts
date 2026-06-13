import express from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types";
import { Client } from "@repo/db/client";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.post("/signup", async (req: Request, res: Response) => {
  const parsedData = CreateUserSchema.safeParse(req.body);

  if (!parsedData.success) {
    return res.status(400).json({
      message: "Incorrect inputs"
    });
  }

  try {
    const existingUser = await Client.user.findUnique({
      where: {
        email: parsedData.data.email
      }
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists"
      });
    }

    await Client.user.create({
      data: {
        email: parsedData.data.email,
        password: parsedData.data.password, // hash this
        name: parsedData.data.name
      }
    });

    return res.status(201).json({
      message: "Signup successful"
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

app.post("/login", (req: Request, res: Response)=>{
  const parsedata = SigninSchema.safeParse(req.body);
  if(!parsedata.success){
    res.json({
      message:"Incorrect Inputs",
    })
  }
  res.status(2000).json({
    message: "Login successfull",
  })
});

app.post("/room", Middleware, (req: Request, res:Response)=>{
    const parsedata = CreateRoomSchema.safeParse(req.body);
    if(!parsedata.success){
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