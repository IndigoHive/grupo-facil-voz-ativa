"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "./combobox"

export interface MultiSelectOption {
  label: string
  value: string
  description?: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecione...",
  emptyText = "Nenhum resultado encontrado",
  className,
  disabled = false,
}: MultiSelectProps) {
  const anchor = useComboboxAnchor()

  const selectedOptions = options.filter((option) =>
    selected.includes(option.value)
  )

  return (
    <Combobox
      multiple
      value={selected}
      onValueChange={(newValue) => {
        if (Array.isArray(newValue)) {
          onChange(newValue)
        }
      }}
      disabled={disabled}
    >
      <ComboboxChips ref={anchor} className={className}>
        {selectedOptions.map((option) => (
          <ComboboxChip key={option.value}>
            {option.label}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput
          placeholder={selected.length === 0 ? placeholder : undefined}
        />
      </ComboboxChips>

      <ComboboxContent anchor={anchor.current}>
        <ComboboxList>
          <ComboboxEmpty>{emptyText}</ComboboxEmpty>
          {options.map((option) => (
            <ComboboxItem
              key={option.value}
              value={option.value}
            >
              {option.label}
              {option.description && (
                <span className="text-xs text-muted-foreground block">
                  {option.description}
                </span>
              )}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

