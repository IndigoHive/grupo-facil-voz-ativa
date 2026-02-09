import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, Bot, User } from "lucide-react";
import axios from 'axios';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    isError?: boolean;
}

export function ChatTab() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText("");
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "https://webhulk.nagaragem.com/webhook/146b9276-59ed-4f2c-8c74-deb32ecc6895",
                { message: userMessage.text },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: response.data.message || "❌ Sem resposta do servidor.",
                isUser: false,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error("Error sending message:", error);
            let errorText = "Erro ao enviar mensagem. Tente novamente.";
            if (axios.isAxiosError(error) && error.response) {
                // Try to get error message from backend
                errorText = error.response.data?.detail || error.response.data?.message || "Erro no servidor: " + error.response.status;
            } else if (error instanceof Error) {
                errorText = error.message;
            }

            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: errorText,
                isUser: false,
                timestamp: new Date(),
                isError: true,
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Card className="h-[600px] flex flex-col">
            <CardContent className="flex-1 flex flex-col p-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                            <Bot className="h-12 w-12 mb-2" />
                            <p>Envie mensagem para configurar gatilhos</p>
                        </div>
                    )}
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${msg.isUser
                                    ? 'bg-primary text-primary-foreground'
                                    : msg.isError
                                        ? 'bg-red-500 text-white'
                                        : 'bg-muted'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {msg.isUser ? <User className="h-3 w-3 alpha-50" /> : <Bot className="h-3 w-3 alpha-50" />}
                                    <span className="text-xs opacity-70">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-xs text-muted-foreground">Digitando...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t flex gap-2">
                    <Input
                        placeholder="Digite sua mensagem..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={isLoading || !inputText.trim()}>
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Enviar</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
