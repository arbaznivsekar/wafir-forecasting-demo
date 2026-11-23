"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  /** Turns an option value into the text people see. */
  display?: (option: string) => string;
};

/** Labelled select. Radix handles keyboard use; the trigger is 44px tall for touch. */
export function SelectField({ id, label, value, options, onChange, display = (o) => o }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-11 w-full text-base sm:text-sm data-[size=default]:h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option} className="min-h-11 text-base sm:text-sm">
              {display(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
