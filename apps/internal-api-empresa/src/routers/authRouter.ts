import { Router } from "express";
import { generateToken } from '../lib/jwt'
import { loginService } from '../services/authentication/loginService'
import { getAuthenticatedUser, authMiddleware } from '../middleware/authMiddleware'
import { resetUsuarioSenhaCommand } from '../services/authentication/resetUsuarioSenhaService'
import { selectEmpresa } from '../services/authentication/selectEmpresa'
import { getEmpresasDisponiveis } from '../services/authentication/getEmpresasDisponiveis'

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const user = await loginService(req.body)

  const token = generateToken(user);

  res.cookie("token", token, { httpOnly: true, maxAge: 86400000 });

  return res.json(user);
});

authRouter.post("/select-empresa", authMiddleware, async (req, res) => {
  const result = await selectEmpresa(req.user!, req.body);

  const token = generateToken(result);

  res.clearCookie("token");

  res.cookie("token", token, { httpOnly: true, maxAge: 86400000 });

  return res.json(result);
});

authRouter.get("/empresas", authMiddleware, async (req, res) => {
  const result = await getEmpresasDisponiveis(req.user!)

  return res.json(result)
})

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logout realizado com sucesso" });
})

authRouter.get("/me", authMiddleware, async (req, res) => {
  return res.json(req.user);
});

authRouter.post("/reset-senha", async (req, res) => {
  const result = await resetUsuarioSenhaCommand(req.body)

  return res.json(result);
});
