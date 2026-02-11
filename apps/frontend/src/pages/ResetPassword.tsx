import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setError("Token inválido ou ausente.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setIsLoading(true);
        try {
            await api.post("/auth/reset-password", {
                token: token,
                new_password: password
            });
            setSuccess(true);
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err: any) {
            console.error("Reset password error:", err);
            const errorMessage = err.response?.data?.detail || "Erro ao redefinir senha.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <Card className="w-[350px]">
                    <CardHeader>
                        <CardTitle className="text-green-600">Sucesso!</CardTitle>
                        <CardDescription>Sua senha foi redefinida com sucesso.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-500">
                            Você será redirecionado para o login em instantes...
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={() => navigate("/login")}>
                            Ir para Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Redefinir Senha</CardTitle>
                    <CardDescription>Crie uma nova senha para sua conta.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Nova Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading || !token}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading || !token}
                                />
                            </div>
                            {error && <div className="text-sm text-red-500">{error}</div>}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isLoading || !token}>
                            {isLoading ? "Redefinindo..." : "Redefinir Senha"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
