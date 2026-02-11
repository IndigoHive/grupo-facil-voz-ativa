import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Shield, ShieldAlert, User, AlertTriangle } from "lucide-react";
import { SimpleModal } from "@/components/ui/simple-modal";
import { useState } from "react";

interface UserResponse {
    id: number;
    email: string;
    admin: boolean;
    is_superadmin: boolean;
    Create_date: string;
}

export function UsersTab() { // Removed export default to match named import style if needed, but default is fine too. Let's stick to named export for components often.
    const queryClient = useQueryClient();
    const { data: currentUser } = useQuery({ queryKey: ['user'], queryFn: () => api.get<any>("/users/me").then(res => res.data) });


    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users-list'],
        queryFn: async () => {
            const res = await api.get<UserResponse[]>("/users");
            return res.data;
        }
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    const deleteUserMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-list'] });
            setDeleteModalOpen(false);
            setUserToDelete(null);
        },
        onError: (err: any) => {
            alert(err.response?.data?.detail || "Erro ao deletar usuário");
        }
    });

    const handleDeleteClick = (id: number) => {
        setUserToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            deleteUserMutation.mutate(userToDelete);
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (error) return <div className="p-8 text-red-500">Erro ao carregar usuários.</div>;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>Visualize e gerencie os usuários da sua empresa.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Função</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users?.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell className="font-medium">{user.email}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {user.is_superadmin ? (
                                                <Badge variant="default" className="bg-purple-600"><ShieldAlert className="w-3 h-3 mr-1" /> SuperAdmin</Badge>
                                            ) : user.admin ? (
                                                <Badge variant="default" className="bg-blue-600"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>
                                            ) : (
                                                <Badge variant="secondary"><User className="w-3 h-3 mr-1" /> Usuário</Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteClick(user.id)}
                                            disabled={user.id === currentUser?.id || deleteUserMutation.isPending}
                                            title={user.id === currentUser?.id ? "Você não pode se excluir" : "Excluir usuário"}
                                        >
                                            {deleteUserMutation.isPending && deleteUserMutation.variables === user.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <SimpleModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Confirmar Exclusão"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                        <div>
                            <p className="font-semibold text-red-900">Atenção!</p>
                            <p className="text-sm text-red-800">
                                Esta ação não pode ser desfeita. O usuário será permanentemente removido.
                            </p>
                        </div>
                    </div>
                    <p>Tem certeza que deseja excluir este usuário?</p>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={deleteUserMutation.isPending}
                        >
                            {deleteUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Excluir Usuário
                        </Button>
                    </div>
                </div>
            </SimpleModal>
        </Card>
    );
}

