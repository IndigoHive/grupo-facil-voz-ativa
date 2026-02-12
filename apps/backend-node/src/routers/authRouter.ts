import { Router } from "express";
import { generateToken } from '../lib/jwt'
import { loginService } from '../services/authentication/loginService'
import { getAuthenticatedUser, authMiddleware } from '../middleware/authMiddleware'
import { resetUsuarioSenhaCommand } from '../services/authentication/resetUsuarioSenhaService'
import { selectEmpresa } from '../services/authentication/selectEmpresa'

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const user = await loginService(req.body)

  const token = generateToken(user);

  res.cookie("token", token, { httpOnly: true, maxAge: 86400000 });

  return res.json(user);
});

authRouter.post("/select-empresa", authMiddleware, async (req, res) => {
  const result = await selectEmpresa(req.user, req.body);

  const token = generateToken(result);

  res.cookie("token", token, { httpOnly: true, maxAge: 86400000 });

  return res.json(result);
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logout realizado com sucesso" });
})

authRouter.get("/me", async (req, res) => {
  const user = await getAuthenticatedUser(req);
  return res.json(user);
});

authRouter.post("/reset-senha", async (req, res) => {
  const result = await resetUsuarioSenhaCommand(req.body)

  return res.json(result);
});
