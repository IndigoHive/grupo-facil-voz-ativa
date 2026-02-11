import { Router } from "express";
import { generateToken } from '../lib/jwt'
import { loginService } from '../services/authentication/loginService'

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const user = await loginService(req.body)

  const token = generateToken(user);

  res.cookie("token", token, { httpOnly: true, maxAge: 86400000 });

  return res.json({ message: "Login realizado com sucesso" });
});


authRouter.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ message: "Logout realizado com sucesso" });
})
