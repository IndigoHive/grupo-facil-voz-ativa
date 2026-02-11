
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectDropdownProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    label: string;
}

export function MultiSelectDropdown({ options, selected, onChange, label }: MultiSelectDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter((item) => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange([]);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-auto min-h-[2.25rem] px-3 py-2 text-sm font-normal"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex flex-wrap gap-1 items-center text-left">
                        {selected.length === 0 && <span className="text-muted-foreground">Todos</span>}
                        {selected.length > 0 && selected.length <= 2 && (
                            selected.map((item) => (
                                <Badge key={item} variant="secondary" className="px-1 py-0 text-xs font-normal">
                                    {item}
                                    <span
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            toggleOption(item);
                                        }}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </span>
                                </Badge>
                            ))
                        )}
                        {selected.length > 2 && (
                            <Badge variant="secondary" className="px-1 py-0 text-xs font-normal">
                                {selected.length} selecionados
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 opacity-50 shrink-0">
                        {selected.length > 0 && (
                            <div onClick={clearSelection} className="cursor-pointer hover:bg-muted rounded-sm p-0.5">
                                <X className="h-3 w-3" />
                            </div>
                        )}
                        <ChevronDown className="h-4 w-4" />
                    </div>
                </Button>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-[var(--radix-popover-trigger-width)] min-w-[100%] top-[calc(100%+4px)] left-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                    <div className="max-h-60 overflow-auto p-1 space-y-1">
                        {options.map((option) => {
                            const isSelected = selected.includes(option);
                            return (
                                <div
                                    key={option}
                                    className={cn(
                                        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                                        isSelected ? "bg-accent/50" : ""
                                    )}
                                    onClick={() => toggleOption(option)}
                                >
                                    <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                        <Check className={cn("h-4 w-4")} />
                                    </div>
                                    <span>{option}</span>
                                </div>
                            );
                        })}
                        {options.length === 0 && <div className="p-2 text-sm text-muted-foreground text-center">Nenhuma opção disponível</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
