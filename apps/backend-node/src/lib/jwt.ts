import jwt from "jsonwebtoken";
import { UsuarioResult } from "./types/usuario-result";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export function generateToken(user: UsuarioResult) {
  const payload: UsuarioResult = {
    id: user.id,
    email: user.email,
    dataCriacao: user.dataCriacao,
    isSuperAdmin: user.isSuperAdmin,
    ...(user.empresa && { empresa: user.empresa })
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}
