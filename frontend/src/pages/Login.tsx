import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";

import { SimpleModal } from "@/components/ui/simple-modal";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Forgot Password State
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
    const [forgotPasswordStep, setForgotPasswordStep] = useState<"input" | "success">("input");
    const [isForgotLoading, setIsForgotLoading] = useState(false);
    const [forgotPasswordError, setForgotPasswordError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleForgotPassword = async () => {
        setIsForgotLoading(true);
        setForgotPasswordError("");
        try {
            await api.post("/auth/forgot-password", { email: forgotPasswordEmail });
            setForgotPasswordStep("success");
        } catch (err: any) {
            console.error("Forgot password error:", err);
            const errorMessage = err.response?.data?.detail || "Erro ao solicitar recuperação de senha.";
            setForgotPasswordError(errorMessage);
        } finally {
            setIsForgotLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const response = await api.post("/token", {
                email: email,
                password: password
            });
            login(response.data.access_token);
            navigate("/");
        } catch (err: any) {
            console.error("Login error:", err);
            const errorMessage = err.response?.data?.detail || "Falha no login. Verifique suas credenciais.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Voz Ativa</CardTitle>
                    <CardDescription>Entre com suas credenciais.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Senha</Label>
                                <Input
                                    id="password"
                                    placeholder="******"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type="password"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                            {error && <div className="text-sm text-red-500">{error}</div>}
                            <div className="flex justify-end">
                                <Button
                                    variant="link"
                                    className="p-0 h-auto font-normal text-xs"
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                >
                                    Esqueci minha senha
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Entrando..." : "Entrar"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <SimpleModal
                isOpen={showForgotPassword}
                onClose={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                    setForgotPasswordStep("input");
                    setForgotPasswordError("");
                }}
                title="Recuperar Senha"
            >
                {forgotPasswordStep === "input" ? (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Insira seu email para receber uma senha temporária.
                        </p>
                        <div className="space-y-2">
                            <Label htmlFor="forgot-email">Email</Label>
                            <Input
                                id="forgot-email"
                                placeholder="seu@email.com"
                                value={forgotPasswordEmail}
                                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                                type="email"
                            />
                        </div>
                        {forgotPasswordError && <div className="text-sm text-red-500">{forgotPasswordError}</div>}
                        <div className="flex justify-end space-x-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowForgotPassword(false)}
                                disabled={isForgotLoading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleForgotPassword}
                                disabled={isForgotLoading || !forgotPasswordEmail}
                            >
                                {isForgotLoading ? "Enviando..." : "Enviar"}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-sm text-green-600 font-medium">
                            Email enviado com sucesso!
                        </div>
                        <p className="text-sm text-gray-500">
                            Verifique sua caixa de entrada. Um link para redefinição de senha foi enviado para <strong>{forgotPasswordEmail}</strong>.
                        </p>
                        <div className="flex justify-end pt-2">
                            <Button onClick={() => setShowForgotPassword(false)}>
                                Fechar
                            </Button>
                        </div>
                    </div>
                )}
            </SimpleModal>
        </div>
    );
}
