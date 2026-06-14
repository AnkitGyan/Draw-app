import type {Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export const Middleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"] ?? "";
  if (!token) {
    res.status(401).json({ message: "Token missing" });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload | string;
    const userId = typeof decoded === "object" && decoded !== null ? (decoded as JwtPayload).userId : undefined;
    (req as any).user = userId;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};