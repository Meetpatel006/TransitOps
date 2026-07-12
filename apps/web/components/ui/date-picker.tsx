"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value?: string
  onChange?: (dateStr: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  // Try to parse the value to a Date object safely
  const date = value ? new Date(value) : undefined
  
  // Verify it's a valid date
  const isValidDate = date && !isNaN(date.getTime())

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex items-center justify-start gap-2 rounded-lg border border-border bg-transparent px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 h-8 w-full justify-start text-left font-normal",
          !isValidDate && "text-muted-foreground",
          className
        )}
      >
        <CalendarIcon className="h-4 w-4" />
        {isValidDate ? format(date, "PPP") : <span>{placeholder}</span>}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={isValidDate ? date : undefined}
          onSelect={(d) => {
            // Format to standard YYYY-MM-DD when selected
            if (d) {
              // Adjust for timezone to avoid off-by-one day issues
              const offset = d.getTimezoneOffset()
              const adjustedDate = new Date(d.getTime() - (offset*60*1000))
              onChange?.(adjustedDate.toISOString().split('T')[0])
            } else {
              onChange?.('')
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
