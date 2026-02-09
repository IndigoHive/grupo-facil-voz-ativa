import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Check, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SimpleModal } from "@/components/ui/simple-modal"; // Reusing for now or using custom dialog

interface Company {
    id: number;
    Nome: string;
    Status: boolean;
}

export default function AdminCompanies() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState("");
    const [newCompanyEmail, setNewCompanyEmail] = useState("");

    const { data: companies, isLoading, error } = useQuery({
        queryKey: ['admin-companies'],
        queryFn: async () => {
            const res = await api.get<Company[]>("/admin/companies");
            return res.data;
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: boolean }) => {
            const res = await api.patch<Company>(`/admin/companies/${id}/status`, null, {
                params: { status_update: status }
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
        },
        onError: (err) => {
            console.error(err);
            alert("Erro ao atualizar status");
        }
    });

    const createCompanyMutation = useMutation({
        mutationFn: async (data: { nome: string; email: string }) => {
            const res = await api.post<Company>("/admin/companies", { Nome: data.nome, email_usuario: data.email });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-companies'] });
            setIsCreateOpen(false);
            setNewCompanyName("");
            setNewCompanyEmail("");
        },
        onError: (err: any) => {
            console.error(err);
            alert(err.response?.data?.detail || "Erro ao criar empresa");
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCompanyName.trim() || !newCompanyEmail.trim()) return;
        createCompanyMutation.mutate({ nome: newCompanyName, email: newCompanyEmail });
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (error) return <div className="flex justify-center items-center h-screen">Erro ao carregar empresas. Verifique se você é superadmin.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => navigate("/")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Administração de Empresas</h1>
                            <p className="text-muted-foreground">Gerencie o acesso das empresas ao sistema.</p>
                        </div>
                    </div>
                    <Button onClick={() => setIsCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Nova Empresa
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Empresas Cadastradas</CardTitle>
                        <CardDescription>Lista de todas as empresas e seus status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies?.map((company) => (
                                    <TableRow key={company.id}>
                                        <TableCell>{company.id}</TableCell>
                                        <TableCell className="font-medium">{company.Nome}</TableCell>
                                        <TableCell>
                                            <Badge variant={company.Status ? "default" : "destructive"}>
                                                {company.Status ? "Ativa" : "Inativa"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {company.Status ? (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => updateStatusMutation.mutate({ id: company.id, status: false })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <X className="mr-2 h-4 w-4" /> Desativar
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => updateStatusMutation.mutate({ id: company.id, status: true })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <Check className="mr-2 h-4 w-4" /> Ativar
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <SimpleModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                title="Nova Empresa"
            >
                <form onSubmit={handleCreate} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome da Empresa</label>
                        <Input
                            value={newCompanyName}
                            onChange={(e) => setNewCompanyName(e.target.value)}
                            placeholder="Digite o nome..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email do Administrador</label>
                        <Input
                            type="email"
                            value={newCompanyEmail}
                            onChange={(e) => setNewCompanyEmail(e.target.value)}
                            placeholder="admin@empresa.com"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={createCompanyMutation.isPending || !newCompanyName.trim() || !newCompanyEmail.trim()}>
                            {createCompanyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar
                        </Button>
                    </div>
                </form>
            </SimpleModal>
        </div>
    );
}
