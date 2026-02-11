import express from "express";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware/authMiddleware";
import { authRouter } from './routers/authRouter'
import { usuarioRouter } from './routers/usuariosRouter'
import { errorHandler } from './lib/errorHandler';

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


// Middleware de tratamento de erros deve ser o último
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
