import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
} from "@tanstack/react-table";
import { api } from "@/lib/api";
import {
    Loader2,
    Lock,
    RefreshCw,
    LogOut,
    MessageSquare,
    Shield,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Search,
    Calendar,
    Clock,
    BarChart2,
    SlidersHorizontal,
    Key // Import Key icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { stringToHslColor } from "@/lib/utils";
import { SimpleModal } from "@/components/ui/simple-modal";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { GatilhosTab } from "./GatilhosTab";
import { UsersTab } from "./UsersTab"; // Import UsersTab
import { ChatTab } from "./ChatTab";

// Simple styles for column resizing
const resizerStyle = {
    position: 'absolute' as const,
    right: 0,
    top: 0,
    height: '100%',
    width: '5px',
    background: 'rgba(0,0,0,0.1)',
    cursor: 'col-resize',
    userSelect: 'none' as const,
    touchAction: 'none' as const,
};

interface CallData {
    id: number;
    Create_date: string;
    Agent_name: string;
    Customer_Name: string;
    Resolution_Status: string;
    Quality_of_service: string;
    Call_duration: number;
    Overall_customer_sentiment: string;
    IRC_Score: number;
    Resumo: string;
    unique_id: string;

    // New fields
    Dialogue: string;
    Variacao_de_sentimento_do_cliente: string;
    Protocol_Number: string;
    Customer_CPF: string;
    IRC_Score_Pilar_1: number;
    IRC_Score_Pilar_2: number;
    IRC_Score_Pilar_3: number;
    IRC_Score_Pilar_4: number;
    IRC_Classification: string;
    Pilar_1_IRC_Snippets: string;
    Pilar_2_IRC_Snippets: string;
    Pilar_3_IRC_Snippets: string;
    Pilar_4_IRC_Snippets: string;
    Pilar_1_Justificativa: string;
    Pilar_2_Justificativa: string;
    Pilar_3_Justificativa: string;
    Pilar_4_Justificativa: string;
    Call_silence: number;
    Pontos_Obtidos_RN623: number;
    Score_Conformidade_RN623: number;
    Nivel_Conformidade_RN: string;

    // Arrays
    themes: { Temas: string }[];
    initial_customer_sentiments: { Sentimento: string }[];
    end_customer_sentiments: { Sentimento: string }[];
    agent_sentiments: { Sentimento: string }[];
    criterios_rn: { Criterio: string }[];
    criterios_rn623: { Criterio: string }[];
}

interface CallResponse {
    total: number;
    data: CallData[];
}

interface FilterOptions {
    temas: string[];
    sentimento_inicial: string[];
    sentimento_final: string[];
    sentimento_agente: string[];
    criterios_rn623: string[];
    sentimento_geral: string[];
    resolucao: string[];
    qualidade_servico: string[];
    nivel_conformidade_rn: string[];
}

const columnHelper = createColumnHelper<CallData>();

export default function Dashboard() {
    const { logout } = useAuth();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'chamadas' | 'gatilhos' | 'import' | 'chat' | 'users'>('chamadas');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Calls state
    const [pageNumber, setPageNumber] = useState(1);
    const [totalSize, setTotalSize] = useState(10);
    const [search, setSearch] = useState("");

    // Sorting state
    const [sorting, setSorting] = useState<SortingState>([]);

    // Filters
    const [minDuration, setMinDuration] = useState<string>("");
    const [maxDuration, setMaxDuration] = useState<string>("");
    const [minScore, setMinScore] = useState<string>("");
    const [maxScore, setMaxScore] = useState<string>("");
    const [minSilence, setMinSilence] = useState<string>("");
    const [maxSilence, setMaxSilence] = useState<string>("");
    const [minRN623Points, setMinRN623Points] = useState<string>("");
    const [maxRN623Points, setMaxRN623Points] = useState<string>("");
    const [minRN623Score, setMinRN623Score] = useState<string>("");
    const [maxRN623Score, setMaxRN623Score] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
    const [selectedSentimentoInicial, setSelectedSentimentoInicial] = useState<string[]>([]);
    const [selectedSentimentoFinal, setSelectedSentimentoFinal] = useState<string[]>([]);
    const [selectedSentimentoAgente, setSelectedSentimentoAgente] = useState<string[]>([]);
    const [selectedCriteriosRN623, setSelectedCriteriosRN623] = useState<string[]>([]);
    const [selectedSentimentoGeral, setSelectedSentimentoGeral] = useState<string[]>([]);
    const [selectedResolucao, setSelectedResolucao] = useState<string[]>([]);
    const [selectedQualidadeServico, setSelectedQualidadeServico] = useState<string[]>([]);
    const [selectedNivelConformidadeRN, setSelectedNivelConformidadeRN] = useState<string[]>([]);

    const { data: user } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const res = await api.get<any>("/users/me");
            return res.data;
        }
    });

    const { data: filterOptions } = useQuery({
        queryKey: ['filterOptions'],
        queryFn: async () => {
            const res = await api.get<FilterOptions>("/filters");
            return res.data;
        }
    });

    const handleRefreshCache = async () => {
        setIsRefreshing(true);
        try {
            await api.post("/refresh-cache");
            queryClient.invalidateQueries({ queryKey: ['calls'] });
            queryClient.invalidateQueries({ queryKey: ['filterOptions'] });
        } catch (error) {
            console.error("Failed to refresh cache:", error);
            alert("Erro ao atualizar o cache.");
        } finally {
            setIsRefreshing(false);
        }
    };

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<any>(null);
    const [modalTitle, setModalTitle] = useState("");

    // Create User Modal State
    const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState("");
    // const [newUserPassword, setNewUserPassword] = useState(""); // Removed manual password

    const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    const handleCreateUser = async () => {
        setIsCreatingUser(true);
        try {
            await api.post("/users", {
                email: newUserEmail,
                // password: newUserPassword, // Password handled by backend
                is_admin: newUserIsAdmin
            });
            alert("Usuário criado com sucesso! Uma senha temporária foi enviada para o email.");
            setCreateUserModalOpen(false);
            setNewUserEmail("");
            // setNewUserPassword("");
            setNewUserIsAdmin(false);
            queryClient.invalidateQueries({ queryKey: ['users-list'] }); // Refresh list if on users tab
        } catch (error: any) {
            console.error("Erro ao criar usuário:", error);
            alert("Erro ao criar usuário: " + (error.response?.data?.detail || error.message));
        } finally {
            setIsCreatingUser(false);
        }
    };

    // View API Key Modal State
    const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [isFetchingApiKey, setIsFetchingApiKey] = useState(false);

    const handleViewApiKey = async () => {
        setIsFetchingApiKey(true);
        try {
            const res = await api.get<{ api_key: string }>("/companies/me/api-key");
            setApiKey(res.data.api_key);
            setApiKeyModalOpen(true);
        } catch (error: any) {
            console.error("Erro ao obter API Key:", error);
            alert("Erro ao obter API Key: " + (error.response?.data?.detail || error.message));
        } finally {
            setIsFetchingApiKey(false);
        }
    };

    // Change Password Modal State
    const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleChangePassword = async () => {
        try {
            await api.patch("/users/me/password", {
                old_password: oldPassword,
                new_password: newPassword
            });
            alert("Senha alterada com sucesso! Faça login novamente.");
            setChangePasswordModalOpen(false);
            setOldPassword("");
            setNewPassword("");
            logout();
        } catch (error: any) {
            console.error("Erro ao alterar senha:", error);
            alert("Erro ao alterar senha: " + (error.response?.data?.detail || error.message));
        }
    };

    // Drag to scroll logic
    const tableRef = useRef<HTMLTableElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);
    const isDragScrolling = useRef(false);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        // Ignore interactive elements or resizers
        if (target.closest('button') || target.closest('.resizer') || target.closest('input') || target.closest('select')) {
            return;
        }

        if (!tableRef.current) return;
        const slider = tableRef.current.parentElement;
        if (!slider) return;

        isDragging.current = true;
        isDragScrolling.current = false;
        startX.current = e.pageX - slider.offsetLeft;
        scrollLeftStart.current = slider.scrollLeft;

        slider.style.cursor = 'grabbing';
        slider.style.userSelect = 'none';
    }, []);

    const handleMouseLeave = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;
        if (tableRef.current?.parentElement) {
            const slider = tableRef.current.parentElement;
            slider.style.cursor = 'grab';
            slider.style.removeProperty('user-select');
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        if (!isDragging.current) return;
        isDragging.current = false;
        // Check if we actually dragged, if so, we might need to reset something or just let click capture handle it
        if (tableRef.current?.parentElement) {
            const slider = tableRef.current.parentElement;
            slider.style.cursor = 'grab';
            slider.style.removeProperty('user-select');
        }
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging.current) return;

        e.preventDefault();

        if (!tableRef.current) return;
        const slider = tableRef.current.parentElement;
        if (!slider) return;

        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX.current);

        if (Math.abs(walk) > 5) {
            isDragScrolling.current = true;
        }

        slider.scrollLeft = scrollLeftStart.current - walk;
    }, []);

    const handleTableClickCapture = useCallback((e: React.MouseEvent) => {
        if (isDragScrolling.current) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, []);

    useEffect(() => {
        if (tableRef.current?.parentElement) {
            tableRef.current.parentElement.style.cursor = 'grab';
        }
    }, []);

    const handleCellDoubleClick = (cell: any) => {
        const value = cell.getValue();
        const header = cell.column.columnDef.header;

        setModalTitle(typeof header === 'string' ? header : 'Detalhes');
        setModalContent(value);
        setModalOpen(true);
    };

    const renderModalContent = (content: any) => {
        if (content === null || content === undefined) return <p className="text-muted-foreground italic">Vazio</p>;

        if (Array.isArray(content)) {
            // Check if it's an array of objects we know how to render
            if (content.length > 0 && typeof content[0] === 'object') {
                return (
                    <div className="space-y-2">
                        {content.map((item: any, i: number) => (
                            <div key={i} className="p-2 border rounded bg-muted/20">
                                {Object.entries(item).map(([k, v]) => (
                                    <div key={k} className="flex flex-col">
                                        <span className="font-semibold text-xs text-muted-foreground uppercase">{k}</span>
                                        <span>{String(v)}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                );
            }
            return (
                <ul className="list-disc list-inside">
                    {content.map((item: any, i: number) => <li key={i}>{String(item)}</li>)}
                </ul>
            );
        }

        if (typeof content === 'object') {
            return <pre className="whitespace-pre-wrap bg-muted p-4 rounded text-sm overflow-auto">{JSON.stringify(content, null, 2)}</pre>;
        }

        return <div className="whitespace-pre-wrap text-base leading-relaxed">{String(content)}</div>;
    };

    const fetchCalls = async () => {
        const sortId = sorting.length > 0 ? sorting[0].id : undefined;
        const sortDesc = sorting.length > 0 ? sorting[0].desc : false;

        const params: any = {
            pageNumber,
            totalSize,
            search: search || undefined,
            sort_by: sortId,
            order: sortId ? (sortDesc ? "desc" : "asc") : undefined,
            min_duration: minDuration || undefined,
            max_duration: maxDuration || undefined,
            min_score: minScore || undefined,
            max_score: maxScore || undefined,
            min_silence: minSilence || undefined,
            max_silence: maxSilence || undefined,
            min_rn623_points: minRN623Points || undefined,
            max_rn623_points: maxRN623Points || undefined,
            min_rn623_score: minRN623Score || undefined,
            max_rn623_score: maxRN623Score || undefined,
            temas: selectedTemas.length ? selectedTemas : undefined,
            sentimento_inicial: selectedSentimentoInicial.length ? selectedSentimentoInicial : undefined,
            sentimento_final: selectedSentimentoFinal.length ? selectedSentimentoFinal : undefined,
            sentimento_agente: selectedSentimentoAgente.length ? selectedSentimentoAgente : undefined,
            criterios_rn623: selectedCriteriosRN623.length ? selectedCriteriosRN623 : undefined,
            sentimento_geral: selectedSentimentoGeral.length ? selectedSentimentoGeral : undefined,
            resolucao: selectedResolucao.length ? selectedResolucao : undefined,
            qualidade_servico: selectedQualidadeServico.length ? selectedQualidadeServico : undefined,
            nivel_conformidade_rn: selectedNivelConformidadeRN.length ? selectedNivelConformidadeRN : undefined,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        };
        const res = await api.get<CallResponse>("/calls", { params });
        return res.data;
    };

    const { data: qData, isLoading } = useQuery({
        queryKey: ['calls', pageNumber, totalSize, search, sorting, minDuration, maxDuration, minScore, maxScore, minSilence, maxSilence, minRN623Points, maxRN623Points, minRN623Score, maxRN623Score, selectedTemas, selectedSentimentoInicial, selectedSentimentoFinal, selectedSentimentoAgente, selectedCriteriosRN623, selectedSentimentoGeral, selectedResolucao, selectedQualidadeServico, selectedNivelConformidadeRN, startDate, endDate],
        queryFn: fetchCalls,
        enabled: activeTab === 'chamadas', // Only fetch if this tab is active
    });

    const totalPages = qData ? Math.ceil(qData.total / totalSize) : 0;

    const columns = useMemo(() => [

        columnHelper.accessor('Create_date', {
            header: 'Data',
            cell: info => new Date(info.getValue()).toLocaleDateString(),
            size: 100
        }),
        columnHelper.accessor('unique_id', {
            header: 'ID Único',
            size: 150,
            enableSorting: false
        }),
        columnHelper.accessor('themes', {
            header: 'Temas',
            cell: info => (
                <div className="flex flex-wrap gap-1">
                    {info.getValue()?.map((t, i) => (
                        <Badge
                            key={i}
                            variant="secondary"
                            style={{ backgroundColor: stringToHslColor(t.Temas), color: '#333' }}
                        >
                            {t.Temas}
                        </Badge>
                    ))}
                </div>
            ),
            size: 250,
            enableSorting: false
        }),
        columnHelper.accessor('initial_customer_sentiments', {
            header: 'Sentimento Inicial',
            cell: info => (
                <div className="flex flex-wrap gap-1">
                    {info.getValue()?.map((s, i) => (
                        <Badge
                            key={i}
                            variant="secondary"
                            style={{ backgroundColor: stringToHslColor(s.Sentimento, 70, 90), color: '#333' }}
                        >
                            {s.Sentimento}
                        </Badge>
                    ))}
                </div>
            ),
            size: 200,
            enableSorting: false
        }),
        columnHelper.accessor('end_customer_sentiments', {
            header: 'Sentimento Final',
            cell: info => (
                <div className="flex flex-wrap gap-1">
                    {info.getValue()?.map((s, i) => (
                        <Badge
                            key={i}
                            variant="secondary"
                            style={{ backgroundColor: stringToHslColor(s.Sentimento, 70, 90), color: '#333' }}
                        >
                            {s.Sentimento}
                        </Badge>
                    ))}
                </div>
            ),
            size: 200,
            enableSorting: false
        }),
        columnHelper.accessor('criterios_rn', {
            header: 'Critérios RN',
            cell: info => (
                <div className="flex flex-wrap gap-1">
                    {info.getValue()?.map((c, i) => (
                        <Badge
                            key={i}
                            variant="outline"
                            className="text-[10px]"
                        >
                            {c.Criterio}
                        </Badge>
                    ))}
                </div>
            ),
            size: 250,
            enableSorting: false
        }),
        columnHelper.accessor('agent_sentiments', {
            header: 'Sentimento Agente',
            cell: info => (
                <div className="flex flex-wrap gap-1">
                    {info.getValue()?.map((s, i) => (
                        <Badge
                            key={i}
                            variant="secondary"
                            style={{ backgroundColor: stringToHslColor(s.Sentimento, 60, 85), color: '#333' }}
                        >
                            {s.Sentimento}
                        </Badge>
                    ))}
                </div>
            ),
            size: 200,
            enableSorting: false
        }),
        columnHelper.accessor('criterios_rn623', {
            header: 'Critérios RN623',
            cell: info => (
                <div className="flex flex-wrap gap-1">
                    {info.getValue()?.map((c, i) => (
                        <Badge
                            key={i}
                            variant="outline"
                            className="text-[10px]"
                        >
                            {c.Criterio}
                        </Badge>
                    ))}
                </div>
            ),
            size: 250,
            enableSorting: false
        }),
        columnHelper.accessor('Dialogue', {
            header: 'Diálogo',
            size: 300,
            enableSorting: false
        }),
        columnHelper.accessor('Resumo', {
            header: 'Resumo',
            size: 300,
            enableSorting: false
        }),
        columnHelper.accessor('Variacao_de_sentimento_do_cliente', { header: 'Variação de Sentimento do Cliente', size: 200, enableSorting: false }),
        columnHelper.accessor('Agent_name', { header: 'Agente', size: 150 }),
        columnHelper.accessor('Protocol_Number', { header: 'Protocolo', size: 150, enableSorting: false }),
        columnHelper.accessor('Customer_Name', { header: 'Cliente', size: 150 }),
        columnHelper.accessor('Overall_customer_sentiment', {
            header: 'Sentimento Geral',
            cell: info => {
                const value = info.getValue();
                if (!value) return null;
                return (
                    <Badge
                        variant="outline"
                        style={{
                            backgroundColor: stringToHslColor(value, 85, 95),
                            color: stringToHslColor(value, 30, 40),
                            borderColor: stringToHslColor(value, 60, 80)
                        }}
                    >
                        {value}
                    </Badge>
                );
            },
            size: 150,
            enableSorting: false
        }),
        columnHelper.accessor('Customer_CPF', { header: 'CPF', size: 120, enableSorting: false }),
        columnHelper.accessor('Resolution_Status', {
            header: 'Resolução',
            cell: info => {
                const value = info.getValue();
                if (!value) return null;
                return (
                    <Badge
                        variant="outline"
                        style={{
                            backgroundColor: stringToHslColor(value, 85, 95),
                            color: stringToHslColor(value, 30, 40),
                            borderColor: stringToHslColor(value, 60, 80)
                        }}
                    >
                        {value}
                    </Badge>
                );
            },
            size: 120,
            enableSorting: false
        }),
        columnHelper.accessor('Quality_of_service', {
            header: 'Qualidade de Serviço',
            cell: info => {
                const value = info.getValue();
                if (!value) return null;
                return (
                    <Badge
                        variant="outline"
                        style={{
                            backgroundColor: stringToHslColor(value, 85, 95),
                            color: stringToHslColor(value, 30, 40),
                            borderColor: stringToHslColor(value, 60, 80)
                        }}
                    >
                        {value}
                    </Badge>
                );
            },
            size: 150,
            enableSorting: false
        }),
        columnHelper.accessor('IRC_Score', { header: 'Score IRC', size: 100 }),
        columnHelper.accessor('IRC_Score_Pilar_1', { header: 'IRC Score Pilar 1', size: 150 }),
        columnHelper.accessor('IRC_Score_Pilar_2', { header: 'IRC Score Pilar 2', size: 150 }),
        columnHelper.accessor('IRC_Score_Pilar_3', { header: 'IRC Score Pilar 3', size: 150 }),
        columnHelper.accessor('IRC_Score_Pilar_4', { header: 'IRC Score Pilar 4', size: 150 }),
        columnHelper.accessor('IRC_Classification', {
            header: 'Classificação IRC',
            cell: info => {
                const value = info.getValue();
                if (!value) return null;
                return (
                    <Badge
                        variant="outline"
                        style={{
                            backgroundColor: stringToHslColor(value, 85, 95),
                            color: stringToHslColor(value, 30, 40),
                            borderColor: stringToHslColor(value, 60, 80)
                        }}
                    >
                        {value}
                    </Badge>
                );
            },
            size: 150,
            enableSorting: false
        }),
        columnHelper.accessor('Pilar_1_IRC_Snippets', { header: 'IRC Snippets Pilar 1', size: 250, enableSorting: false }),
        columnHelper.accessor('Pilar_2_IRC_Snippets', { header: 'IRC Snippets Pilar 2', size: 250, enableSorting: false }),
        columnHelper.accessor('Pilar_3_IRC_Snippets', { header: 'IRC Snippets Pilar 3', size: 250, enableSorting: false }),
        columnHelper.accessor('Pilar_4_IRC_Snippets', { header: 'IRC Snippets Pilar 4', size: 250, enableSorting: false }),
        columnHelper.accessor('Pilar_1_Justificativa', { header: 'Justificativa Pilar 1', size: 250, enableSorting: false }),
        columnHelper.accessor('Pilar_2_Justificativa', { header: 'Justificativa Pilar 2', size: 250, enableSorting: false }),
        columnHelper.accessor('Pilar_3_Justificativa', { header: 'Justificativa Pilar 3', size: 250, enableSorting: false }),
        columnHelper.accessor('Pilar_4_Justificativa', { header: 'Justificativa Pilar 4', size: 250, enableSorting: false }),
        columnHelper.accessor('Call_duration', {
            header: 'Duração',
            cell: info => `${info.getValue()?.toFixed(0)}s`,
            size: 100
        }),
        columnHelper.accessor('Call_silence', {
            header: 'Silêncio',
            cell: info => `${info.getValue()?.toFixed(2)}s`,
            size: 100
        }),
        columnHelper.accessor('Pontos_Obtidos_RN623', { header: 'Pontos Obtidos RN623', size: 150 }),
        columnHelper.accessor('Score_Conformidade_RN623', { header: 'Score de Conformidade RN623', size: 180 }),
        columnHelper.accessor('Nivel_Conformidade_RN', {
            header: 'Nível de Conformidade RN',
            cell: info => {
                const value = info.getValue();
                if (!value) return null;
                return (
                    <Badge
                        variant="outline"
                        style={{
                            backgroundColor: stringToHslColor(value, 85, 95),
                            color: stringToHslColor(value, 30, 40),
                            borderColor: stringToHslColor(value, 60, 80)
                        }}
                    >
                        {value}
                    </Badge>
                );
            },
            size: 200,
            enableSorting: false
        }),
    ], []);

    const table = useReactTable({
        data: qData?.data || [],
        columns,
        state: {
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        manualSorting: true,
        columnResizeMode: 'onChange',
        defaultColumn: {
            minSize: 50,
            maxSize: 800,
        },
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="mx-auto max-w-[95%] space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Voz Ativa</h1>
                    <div className="flex gap-2">
                        {user?.is_superadmin && (
                            <Button
                                variant="default"
                                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
                                onClick={() => window.location.href = "/admin/companies"}
                            >
                                <Shield className="mr-2 h-4 w-4" /> Admin
                            </Button>
                        )}
                        {/* Admin User Creation Button */}
                        {(user?.admin || user?.is_superadmin) && (
                            <Button
                                variant="default"
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
                                onClick={() => {
                                    setCreateUserModalOpen(true);
                                }}
                            >
                                <Shield className="mr-2 h-4 w-4" /> Criar Usuário
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleRefreshCache}
                            disabled={isRefreshing}
                        >
                            {isRefreshing ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                            )}
                            Atualizar Dados
                        </Button>
                        <Button
                            variant="default"
                            className="bg-orange-500 hover:bg-orange-600 text-white shadow hover:shadow-md transition-all"
                            onClick={() => setChangePasswordModalOpen(true)}
                        >
                            <Lock className="mr-2 h-4 w-4" /> Alterar Senha
                        </Button>
                        <Button variant="outline" onClick={logout}>
                            <LogOut className="mr-2 h-4 w-4" /> Sair
                        </Button>
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex justify-end">
                    {(user?.admin || user?.is_superadmin) && (
                        <Button
                            variant="outline"
                            className="text-xs"
                            size="sm"
                            onClick={handleViewApiKey}
                            disabled={isFetchingApiKey}
                        >
                            {isFetchingApiKey ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Key className="mr-2 h-3 w-3" />}
                            Ver API Key
                        </Button>
                    )}
                </div>


                <div className="flex space-x-2 border-b">
                    <button
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'chamadas'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setActiveTab('chamadas')}
                    >
                        Chamadas
                    </button>
                    {(user?.admin || user?.is_superadmin) && (
                        <button
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'users'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => setActiveTab('users')}
                        >
                            Usuários
                        </button>
                    )}
                    <button
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'chat'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setActiveTab('chat')}
                    >
                        Gatilhos
                    </button>
                    <button
                        className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'gatilhos'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                        onClick={() => setActiveTab('gatilhos')}
                    >
                        Debug | Gatilhos
                    </button>

                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {activeTab === 'chamadas' ? 'Chamadas' :
                                activeTab === 'gatilhos' ? 'Gatilhos' :
                                    activeTab === 'users' ? 'Usuários' : 'Assistant Chat'}
                        </CardTitle>
                        <CardDescription>
                            {activeTab === 'chamadas'
                                ? 'Gerencie e analise as chamadas atendidas.'
                                : activeTab === 'gatilhos'
                                    ? 'Gerencie os gatilhos de notificação.'
                                    : activeTab === 'users'
                                        ? 'Gerencie os usuários do sistema.'
                                        : 'Assistant Chat'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeTab === 'gatilhos' ? (
                            <GatilhosTab />
                        ) : activeTab === 'chat' ? (
                            <ChatTab />
                        ) : activeTab === 'users' ? (
                            <UsersTab />
                        ) : (
                            <>
                                {/* Filters */}
                                <div className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <span className="text-sm font-medium">Busca</span>
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Buscar por nome, agente, protocolo..."
                                                    className="pl-8"
                                                    value={search}
                                                    onChange={(e) => { setSearch(e.target.value); setPageNumber(1); }}
                                                />
                                            </div>
                                        </div>

                                        {/* Premium Filter Section */}
                                        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
                                            <div className="flex items-center gap-2 text-lg font-semibold text-foreground border-b pb-4">
                                                <SlidersHorizontal className="h-5 w-5 text-primary" />
                                                Filtros Avançados
                                            </div>

                                            {/* Group 1: Temporal & Métricas */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                                    <Clock className="h-4 w-4" /> Temporal & Métricas
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-medium text-muted-foreground">Período</span>
                                                        <div className="flex gap-2 items-center">
                                                            <div className="relative w-full">
                                                                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input type="date" className="pl-8" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                                            </div>
                                                            <span className="text-muted-foreground">-</span>
                                                            <div className="relative w-full">
                                                                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                                <Input type="date" className="pl-8" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-medium text-muted-foreground">Duração (s)</span>
                                                        <div className="flex gap-2">
                                                            <Input placeholder="Min" type="number" value={minDuration} onChange={e => setMinDuration(e.target.value)} />
                                                            <Input placeholder="Max" type="number" value={maxDuration} onChange={e => setMaxDuration(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-medium text-muted-foreground">Silêncio (s)</span>
                                                        <div className="flex gap-2">
                                                            <Input placeholder="Min" type="number" value={minSilence} onChange={e => setMinSilence(e.target.value)} />
                                                            <Input placeholder="Max" type="number" value={maxSilence} onChange={e => setMaxSilence(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Group 2: Avaliação Técnica */}
                                            <div className="space-y-4 pt-4 border-t border-dashed">
                                                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                                    <BarChart2 className="h-4 w-4" /> Avaliação Técnica
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-medium text-muted-foreground">Score IRC</span>
                                                        <div className="flex gap-2">
                                                            <Input placeholder="Min" type="number" value={minScore} onChange={e => setMinScore(e.target.value)} />
                                                            <Input placeholder="Max" type="number" value={maxScore} onChange={e => setMaxScore(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-medium text-muted-foreground">Pontos RN623</span>
                                                        <div className="flex gap-2">
                                                            <Input placeholder="Min" type="number" value={minRN623Points} onChange={e => setMinRN623Points(e.target.value)} />
                                                            <Input placeholder="Max" type="number" value={maxRN623Points} onChange={e => setMaxRN623Points(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <span className="text-xs font-medium text-muted-foreground">Score Conf. RN623</span>
                                                        <div className="flex gap-2">
                                                            <Input placeholder="Min" type="number" value={minRN623Score} onChange={e => setMinRN623Score(e.target.value)} />
                                                            <Input placeholder="Max" type="number" value={maxRN623Score} onChange={e => setMaxRN623Score(e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <MultiSelectDropdown
                                                            label="Resolução"
                                                            options={filterOptions?.resolucao || []}
                                                            selected={selectedResolucao}
                                                            onChange={(val) => { setSelectedResolucao(val); setPageNumber(1); }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <MultiSelectDropdown
                                                            label="Qualidade"
                                                            options={filterOptions?.qualidade_servico || []}
                                                            selected={selectedQualidadeServico}
                                                            onChange={(val) => { setSelectedQualidadeServico(val); setPageNumber(1); }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <MultiSelectDropdown
                                                            label="Conformidade"
                                                            options={filterOptions?.nivel_conformidade_rn || []}
                                                            selected={selectedNivelConformidadeRN}
                                                            onChange={(val) => { setSelectedNivelConformidadeRN(val); setPageNumber(1); }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Group 3: Análise de Conteúdo */}
                                            <div className="space-y-4 pt-4 border-t border-dashed">
                                                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 uppercase tracking-wider">
                                                    <MessageSquare className="h-4 w-4" /> Análise de Conteúdo
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    <div className="space-y-1">
                                                        <MultiSelectDropdown
                                                            label="Temas"
                                                            options={filterOptions?.temas || []}
                                                            selected={selectedTemas}
                                                            onChange={(val) => { setSelectedTemas(val); setPageNumber(1); }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <MultiSelectDropdown
                                                            label="Critérios RN623"
                                                            options={filterOptions?.criterios_rn623 || []}
                                                            selected={selectedCriteriosRN623}
                                                            onChange={(val) => { setSelectedCriteriosRN623(val); setPageNumber(1); }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <MultiSelectDropdown
                                                            label="Sentimento Geral"
                                                            options={filterOptions?.sentimento_geral || []}
                                                            selected={selectedSentimentoGeral}
                                                            onChange={(val) => { setSelectedSentimentoGeral(val); setPageNumber(1); }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <MultiSelectDropdown
                                                            label="Sentimento Inicial"
                                                            options={filterOptions?.sentimento_inicial || []}
                                                            selected={selectedSentimentoInicial}
                                                            onChange={(val) => { setSelectedSentimentoInicial(val); setPageNumber(1); }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <MultiSelectDropdown
                                                            label="Sentimento Final"
                                                            options={filterOptions?.sentimento_final || []}
                                                            selected={selectedSentimentoFinal}
                                                            onChange={(val) => { setSelectedSentimentoFinal(val); setPageNumber(1); }}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <MultiSelectDropdown
                                                            label="Sentimento Agente"
                                                            options={filterOptions?.sentimento_agente || []}
                                                            selected={selectedSentimentoAgente}
                                                            onChange={(val) => { setSelectedSentimentoAgente(val); setPageNumber(1); }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="rounded-md border w-full">
                                    <Table
                                        ref={tableRef}
                                        style={{ width: table.getTotalSize() }}
                                        className="table-fixed"
                                        onMouseDown={handleMouseDown}
                                        onMouseLeave={handleMouseLeave}
                                        onMouseUp={handleMouseUp}
                                        onMouseMove={handleMouseMove}
                                        onClickCapture={handleTableClickCapture}
                                    >
                                        <TableHeader>
                                            {table.getHeaderGroups().map(headerGroup => (
                                                <TableRow key={headerGroup.id}>
                                                    {headerGroup.headers.map(header => (
                                                        <TableHead
                                                            key={header.id}
                                                            colSpan={header.colSpan}
                                                            style={{ width: header.getSize(), position: 'relative' }}
                                                            className="border-r last:border-r-0"
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : (
                                                                    <div
                                                                        className={header.column.getCanSort() ? "cursor-pointer select-none flex items-center" : ""}
                                                                        onClick={header.column.getToggleSortingHandler()}
                                                                    >
                                                                        {flexRender(
                                                                            header.column.columnDef.header,
                                                                            header.getContext()
                                                                        )}
                                                                        {{
                                                                            asc: <ArrowUp className="ml-2 h-4 w-4" />,
                                                                            desc: <ArrowDown className="ml-2 h-4 w-4" />,
                                                                        }[header.column.getIsSorted() as string] ?? (
                                                                                header.column.getCanSort() ? <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" /> : null
                                                                            )}
                                                                    </div>
                                                                )}
                                                            <div
                                                                {...{
                                                                    onMouseDown: header.getResizeHandler(),
                                                                    onTouchStart: header.getResizeHandler(),
                                                                    className: `resizer ${header.column.getIsResizing() ? "isResizing" : ""
                                                                        }`,
                                                                    style: {
                                                                        ...resizerStyle,
                                                                        opacity: header.column.getIsResizing() ? 1 : 0 // hide when not interacting
                                                                    }
                                                                }}
                                                            />
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={columns.length} className="h-48 text-left align-middle">
                                                        <div className="flex flex-col items-start justify-center space-y-4 pl-4">
                                                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                                            <p className="text-muted-foreground text-sm animate-pulse">Carregando dados, aguarde...</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                <>
                                                    {table.getRowModel().rows.map(row => (
                                                        <TableRow key={row.id}>
                                                            {row.getVisibleCells().map(cell => (
                                                                <TableCell
                                                                    key={cell.id}
                                                                    style={{ width: cell.column.getSize() }}
                                                                    className="overflow-hidden text-ellipsis whitespace-nowrap border-r last:border-r-0"
                                                                    onDoubleClick={() => handleCellDoubleClick(cell)}
                                                                >
                                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="flex items-center justify-end space-x-2 py-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                        disabled={pageNumber === 1}
                                    >
                                        Anterior
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Página {pageNumber} de {totalPages || 1}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                                        disabled={pageNumber >= totalPages}
                                    >
                                        Próxima
                                    </Button>
                                    <span className="text-sm text-gray-600 ml-4">
                                        Itens por página:
                                    </span>
                                    <select
                                        className="border rounded p-1 text-sm bg-background"
                                        value={totalSize}
                                        onChange={(e) => {
                                            setTotalSize(Number(e.target.value));
                                            setPageNumber(1);
                                        }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <SimpleModal
                    isOpen={changePasswordModalOpen}
                    onClose={() => setChangePasswordModalOpen(false)}
                    title="Alterar Senha"
                >
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label htmlFor="old-password" className="text-sm font-medium">Senha Atual</label>
                            <Input
                                id="old-password"
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="new-password" className="text-sm font-medium">Nova Senha</label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <Button onClick={handleChangePassword}>Alterar Senha</Button>
                    </div>
                </SimpleModal>

                <SimpleModal
                    isOpen={createUserModalOpen}
                    onClose={() => setCreateUserModalOpen(false)}
                    title="Criar Novo Usuário"
                >
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                placeholder="email@exemplo.com"
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                            />
                        </div>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        Uma senha segura será gerada automaticamente e enviada para o email do usuário.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="isAdmin"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={newUserIsAdmin}
                                onChange={(e) => setNewUserIsAdmin(e.target.checked)}
                            />
                            <label
                                htmlFor="isAdmin"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Usuário é Admin? (Pode criar outros usuários)
                            </label>
                        </div>
                        <div className="pt-4 flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setCreateUserModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleCreateUser} disabled={isCreatingUser}>
                                {isCreatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Criar Usuário
                            </Button>
                        </div>
                    </div>
                </SimpleModal>

                <SimpleModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    title={modalTitle}
                >
                    {renderModalContent(modalContent)}
                </SimpleModal>

            </div>
            {/* Modal de API Key */}
            <SimpleModal
                isOpen={apiKeyModalOpen}
                onClose={() => setApiKeyModalOpen(false)}
                title="API Key da Empresa"
            >
                <div className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                        Esta é a chave de API da sua empresa. Utilize-a para integrar via webhook ou APIs externas.
                        Mantenha-a em segurança.
                    </p>
                    <div className="flex items-center space-x-2">
                        <Input value={apiKey} readOnly />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                navigator.clipboard.writeText(apiKey);
                                alert("Copiado para a área de transferência!");
                            }}
                        >
                            <span className="sr-only">Copiar</span>
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                            >
                                <path
                                    d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00006H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006L2.5 1.00006C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50006C5 4.67163 5.67157 4.00006 6.5 4.00006H13.5C14.3284 4.00006 15 4.67163 15 5.50006V12.5001C15 13.3285 14.3284 14.0001 13.5 14.0001H6.5C5.67157 14.0001 5 13.3285 5 12.5001V5.50006ZM6 5.50006H14V12.5001H6V5.50006Z"
                                    fill="currentColor"
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </Button>
                    </div>
                </div>
            </SimpleModal>

        </div>
    );
}
