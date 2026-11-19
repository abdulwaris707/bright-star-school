import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

export interface AuthenticatedUser {
  id: number;
  username: string;
  role: "admin" | "teacher" | "student";
  fullName: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Authentication required. Bearer token missing." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthenticatedUser;
      req.user = decoded;
    } catch {
      // ignore invalid token in optional auth
    }
  }
  next();
}

export default authMiddleware;
