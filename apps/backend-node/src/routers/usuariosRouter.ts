import { Router } from 'express'
import { createUsuarioService } from '../services/usuario/createUsuarioService'
import { listUsuarioService } from '../services/usuario/listUsuarioService'

export const usuarioRouter = Router();

usuarioRouter.post("/", async (req, res) => {
  await createUsuarioService(req.user, req.body);

  return res.status(201).json({ message: "Usuário criado com sucesso" });
})

usuarioRouter.get("/", async (req, res) => {
  const usuarios = await listUsuarioService(req.user);

  return res.status(200).json(usuarios);
});
