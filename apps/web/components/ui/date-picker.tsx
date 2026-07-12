"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !isValidDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isValidDate ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
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
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
