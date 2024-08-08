"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Define type for items
type Item = {
  id: string;
  name: string;
};

interface ComboboxDemoProps {
  items: Item[];
  placeholder: string;
  selectedValue: string;
  onChange: (value: string) => void;
}

export function ComboboxDemo({
  items,
  placeholder,
  selectedValue,
  onChange,
}: ComboboxDemoProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedValue);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setValue(selectedValue);
  }, [selectedValue]);

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setQuery("");
    }
    setOpen(isOpen);
  };

  const filteredItems = useMemo(() => {
    if (!query) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase().trim())
    );
  }, [items, query]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? items.find((item) => item.id === value)?.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder}...`}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList className="overflow-auto">
            <CommandEmpty>No {placeholder} found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    setValue(item.id);
                    onChange(item.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
