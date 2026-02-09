import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "./button";

interface SimpleModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export function SimpleModal({ isOpen, onClose, title, children }: SimpleModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            ref={overlayRef}
            onClick={handleOverlayClick}
        >
            <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-lg bg-background shadow-lg ring-1 ring-border animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="text-lg font-semibold leading-none tracking-tight">
                        {title || "Detalhes"}
                    </h3>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={onClose}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">Fechar</span>
                    </Button>
                </div>
                <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-4rem)]">
                    {children}
                </div>
            </div>
        </div>
    );
}
