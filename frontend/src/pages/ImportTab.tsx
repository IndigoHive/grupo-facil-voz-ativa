import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { api } from '@/lib/api';

export function ImportTab() {
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.type !== 'audio/mpeg') {
            setStatus('error');
            setMessage('Por favor, envie apenas arquivos MP3.');
            return;
        }

        // Fetch user details to get the API Key (if not already in user context)
        // Or if user context is updated to include it effectively.
        // Assuming 'user' from context has the structure or we fetch 'me' again.
        let apiKey = '';
        try {
            // Safe to fetch fresh to guarantee having the key
            const res = await api.get('/users/me');
            apiKey = res.data.empresa?.api_key;
        } catch (e) {
            console.error("Failed to fetch user API key", e);
            setStatus('error');
            setMessage('Erro ao obter chave de API da empresa.');
            return;
        }

        if (!apiKey) {
            setStatus('error');
            setMessage('Empresa sem chave de API configurada.');
            return;
        }

        setIsLoading(true);
        setStatus('idle');
        setMessage('');

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64 = reader.result as string;
            const base64Content = base64.split(',')[1];

            try {
                // Now verify against our backend proxy which expects the header
                // Note: The previous code called the external URL directly. 
                // The new request is to use the backend proxy `/call-analysis`.
                // So we change the URL to our backend endpoint.

                // We use `api` client from lib/api which likely has baseURL set to backend.
                // We need to pass the header manually.
                await api.post('/call-analysis',
                    { base64: base64Content },
                    {
                        headers: {
                            'x-api-key': apiKey
                        }
                    }
                );

                setStatus('success');
                setMessage('Arquivo enviado com sucesso!');
            } catch (error: any) {
                console.error('Upload error:', error);
                setStatus('error');
                setMessage(error.response?.data?.detail || 'Erro ao enviar arquivo.');
            } finally {
                setIsLoading(false);
            }
        };

        reader.onerror = () => {
            console.error('File reading error');
            setStatus('error');
            setMessage('Erro ao ler o arquivo.');
            setIsLoading(false);
        };

    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/mpeg': ['.mp3']
        },
        maxFiles: 1,
        disabled: isLoading
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Importar Áudio</CardTitle>
                <CardDescription>
                    Arraste um arquivo MP3 para enviar para processamento.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div
                    {...getRootProps()}
                    className={`
                        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                        ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'}
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
                    `}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-muted rounded-full">
                            {isLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            ) : (
                                <Upload className="h-8 w-8 text-muted-foreground" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                {isDragActive ? "Solte o arquivo aqui" : "Arraste e solte o arquivo MP3 aqui"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                ou clique para selecionar
                            </p>
                        </div>
                    </div>
                </div>

                {status === 'success' && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-md">
                        <CheckCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">{message}</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-md">
                        <XCircle className="h-5 w-5" />
                        <span className="text-sm font-medium">{message}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
