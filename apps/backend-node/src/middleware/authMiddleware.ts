import { Request, Response, NextFunction } from "express";
import { verifyToken } from '../lib/jwt'
import { UsuarioResult } from '../lib/types/usuario-result'

declare global {
  namespace Express {
    interface Request {
      user?: UsuarioResult;
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
    if (!user) {
      return res.status(401).json({ message: "Token inválido" });
    }
    req.user = user as UsuarioResult;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token inválido" });
  }
}

export function getAuthenticatedUser(req: Request): UsuarioResult | undefined {
  return req.user;
}
