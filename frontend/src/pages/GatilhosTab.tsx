import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2, Edit2, Save, X } from "lucide-react";

interface Gatilho {
    id: number;
    Descricao: string;
    Empresa_id: number;
    Usuario_id: number;
    Tipo: "Email" | "WhatsApp";
    Destinatario: string;
}

export function GatilhosTab() {
    const queryClient = useQueryClient();

    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Editing state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<{
        Descricao: string;
    }>({ Descricao: "" });

    const { data: gatilhos, isLoading, error } = useQuery({
        queryKey: ['gatilhos'],
        queryFn: async () => {
            const res = await api.get<Gatilho[]>("/gatilhos");
            return res.data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: typeof editForm }) => {
            await api.patch(`/gatilhos/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gatilhos'] });
            setEditingId(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/gatilhos/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gatilhos'] });
        },
        onSettled: () => {
            setDeletingId(null);
        }
    });

    const startEditing = (gatilho: Gatilho) => {
        setEditingId(gatilho.id);
        setEditForm({
            Descricao: gatilho.Descricao,
        });
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveEditing = (id: number) => {
        updateMutation.mutate({ id, data: editForm });
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (error) {
        return <div className="p-8 text-red-500">Erro ao carregar gatilhos.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Destinatário</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead className="w-[120px] text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gatilhos?.map((gatilho) => {
                            const isEditing = editingId === gatilho.id;
                            return (
                                <TableRow key={gatilho.id}>
                                    <TableCell>
                                        {isEditing ? (
                                            <Input
                                                value={editForm.Descricao}
                                                onChange={(e) => setEditForm({ ...editForm, Descricao: e.target.value })}
                                            />
                                        ) : (
                                            gatilho.Descricao
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {gatilho.Destinatario}
                                    </TableCell>
                                    <TableCell>
                                        {gatilho.Tipo}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {isEditing ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                                                        onClick={() => saveEditing(gatilho.id)}
                                                        disabled={updateMutation.isPending}
                                                    >
                                                        {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-500 hover:bg-gray-100"
                                                        onClick={cancelEditing}
                                                        disabled={updateMutation.isPending}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                                                        onClick={() => startEditing(gatilho)}
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                        onClick={() => {
                                                            if (confirm('Tem certeza que deseja excluir este gatilho?')) {
                                                                setDeletingId(gatilho.id);
                                                                deleteMutation.mutate(gatilho.id);
                                                            }
                                                        }}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        {deletingId === gatilho.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {gatilhos?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    Nenhum gatilho encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

