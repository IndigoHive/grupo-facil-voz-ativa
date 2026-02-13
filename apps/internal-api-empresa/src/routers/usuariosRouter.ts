import { Router } from 'express'
import { createUsuarioService } from '../services/usuario/createUsuarioService'
import { listUsuarioService } from '../services/usuario/listUsuarioService'
import { validateEmpresaAtualMiddleware } from '../middleware/validateEmpresaAtualMiddleware'
import { revokeUsuarioService } from '../services/usuario/revokeUsuarioService'
import { updateUsuarioService } from '../services/usuario/updateUsuarioService'

export const usuarioRouter = Router();

usuarioRouter.post("/", validateEmpresaAtualMiddleware, async (req, res) => {
  await createUsuarioService(req.user!, req.body);

  return res.status(201).json({ message: "Usuário criado com sucesso" });
})

usuarioRouter.get("/", validateEmpresaAtualMiddleware, async (req, res) => {
  const usuarios = await listUsuarioService(req.user!);

  return res.status(200).json(usuarios);
});

usuarioRouter.post("/:id/revogar-acesso", validateEmpresaAtualMiddleware, async (req, res) => {
  const { id } = req.params;

  await revokeUsuarioService(req.user!, id as string)

  return res.status(200).json({ message: "Acesso revogado com sucesso" })
});

usuarioRouter.patch("/:id", validateEmpresaAtualMiddleware, async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  await updateUsuarioService(req.user!, id as string, data);

  return res.status(200).json({ message: "Usuário atualizado com sucesso" });
});
