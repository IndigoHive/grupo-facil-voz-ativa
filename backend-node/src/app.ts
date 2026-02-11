import express from "express";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware/authMiddleware";
import { authRouter } from './routers/authRouter'
import { usuarioRouter } from './routers/usuariosRouter'

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/usuarios", usuarioRouter)

app.get("/health", (req, res) => {
  res.json({ health: true });
});

app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Você está autenticado!", user: req.user });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
