import { Request, Response, NextFunction } from "express";
import { verifyToken } from '../lib/jwt'

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }
  try {
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

export function getAuthenticatedUser(req: Request) {
  return req.user;
}
