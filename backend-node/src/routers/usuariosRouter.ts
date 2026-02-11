import { Router } from 'express'
import { createUsuarioService } from '../services/usuario/createUsuarioService'

export const usuarioRouter = Router();

usuarioRouter.post("/", async (req, res) => {
  await createUsuarioService(req.body);

  return res.status(201).json({ message: "Usuário criado com sucesso" });
})
