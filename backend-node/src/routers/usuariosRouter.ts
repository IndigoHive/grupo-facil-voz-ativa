import { Router } from 'express'
import { createUsuarioService } from '../services/usuario/createUsuarioService'

export const usuarioRouter = Router();

usuarioRouter.post("/", async (req, res) => {
  const result = await createUsuarioService(req.body);

  if (result.isError) {
    return res.status(400).json({ message: result.errorMessage });
  }

  return res.status(201).json({ message: "Usuário criado com sucesso" });
})
