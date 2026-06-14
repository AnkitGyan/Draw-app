import express from "express";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Middleware } from "./middleware";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateRoomSchema, CreateUserSchema, SigninSchema } from "@repo/common/types";
import { Client } from "@repo/db/client";

interface CustomRequest extends Request {
  user?: string;
}

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
      message: "Internal server error",
    });
  }
});

app.post("/login", async (req: Request, res: Response)=>{
  const parsedata = SigninSchema.safeParse(req.body);
  if(!parsedata.success){
    res.json({
      message:"Incorrect Inputs",
    })
  }
  try{

    //Todo: compare hashed password first
    const user = await Client.user.findFirst({
      where:{
        email : parsedata.data?.email,
        password : parsedata.data?.password
      }
    })

    if(!user){
      res.status(403).json({
        message: "Email or password is incorrect"
      })
      return;
    }

    const token = jwt.sign({userId : user.id}, JWT_SECRET);
    res.status(201).json({
      message:"Logged In",
      token
    })
    
  } catch(e){
    res.status(400).json({
      message:"Login failed, Try again with correct crendentials"
    })
  }

});

app.post("/room", Middleware, async (req: CustomRequest, res: Response) => {

  const parsedata = CreateRoomSchema.safeParse(req.body);

  if (!parsedata.success) {
    return res.status(400).json({
      message: "Incorrect Inputs"
    });
  }

  try {

    const userId = req.user;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const room = await Client.room.create({
      data: {
        slug: parsedata.data.name,

        admin: {
          connect: {
            id: userId
          }
        }
      }
    });

    return res.status(201).json({
      message: "Room created successfully",
      room
    });

  } catch (e) {

    console.error(e);

    return res.status(500).json({
      message: "Some error occurred"
    });

  }

});


app.listen(8000, () => {
  console.log("Server is running on port 8000");
});