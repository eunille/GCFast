// components/ui/datetime-picker.tsx
// Collapsible datetime picker with Philippine timezone support

"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface DateTimePickerProps {
  value?: string; // ISO 8601 datetime string
  onChange: (value: string | undefined) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  maxDate?: Date; // Maximum allowed date (e.g., today for no future dates)
}

/**
 * Collapsible datetime picker component
 * - Displays current value when collapsed
 * - Expands to show date and time inputs
 * - Handles Philippine Time (UTC+8) conversion
 * - Validates against future dates if maxDate is set
 */
export function DateTimePicker({
  value,
  onChange,
  label = "Payment Date & Time",
  placeholder,
  disabled = false,
  error,
  required = false,
  maxDate,
}: DateTimePickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Parse the ISO datetime into local date/time parts for the inputs
  const parseValue = (isoString?: string) => {
    if (!isoString) {
      const now = new Date();
      return {
        date: now.toISOString().slice(0, 10),
        time: now.toTimeString().slice(0, 5),
      };
    }
    
    const dt = new Date(isoString);
    return {
      date: dt.toISOString().slice(0, 10),
      time: dt.toTimeString().slice(0, 5),
    };
  };

  const { date: initialDate, time: initialTime } = parseValue(value);
  const [localDate, setLocalDate] = useState(initialDate);
  const [localTime, setLocalTime] = useState(initialTime);

  // Update internal state when external value changes
  useEffect(() => {
    if (value) {
      const { date, time } = parseValue(value);
      setLocalDate(date);
      setLocalTime(time);
    }
  }, [value]);

  // Format display string for collapsed state
  const formatDisplayString = () => {
    if (!value) {
      return "Now (click to customize)";
    }
    
    try {
      const dt = new Date(value);
      return dt.toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid date";
    }
  };

  // Combine date and time into ISO string
  const handleDateTimeChange = (newDate: string, newTime: string) => {
    setLocalDate(newDate);
    setLocalTime(newTime);
    
    if (newDate && newTime) {
      // Combine date and time, then convert to ISO string
      const combined = new Date(`${newDate}T${newTime}`);
      
      // Validate against maxDate if provided
      if (maxDate && combined > maxDate) {
        onChange(undefined); // Clear if invalid
        return;
      }
      
      onChange(combined.toISOString());
    }
  };

  const handleClearCustomTime = () => {
    onChange(undefined); // Clear to use default (now)
    setIsExpanded(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="datetime-picker" className={cn(disabled && "text-muted-foreground")}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {/* Collapsed view - shows current value */}
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsExpanded(!isExpanded)}
        disabled={disabled}
        className={cn(
          "w-full justify-between text-left font-normal",
          !value && "text-muted-foreground",
          error && "border-destructive"
        )}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm">{formatDisplayString()}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 opacity-50" />
        ) : (
          <ChevronDown className="h-4 w-4 opacity-50" />
        )}
      </Button>

      {/* Expanded view - date and time inputs */}
      {isExpanded && !disabled && (
        <div className="border rounded-md p-3 space-y-3 bg-muted/50">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date-input" className="text-xs">Date</Label>
              <Input
                id="date-input"
                type="date"
                value={localDate}
                max={maxDate?.toISOString().slice(0, 10)}
                onChange={(e) => handleDateTimeChange(e.target.value, localTime)}
                className="text-sm"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="time-input" className="text-xs">Time</Label>
              <Input
                id="time-input"
                type="time"
                value={localTime}
                onChange={(e) => handleDateTimeChange(localDate, e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearCustomTime}
              className="text-xs"
            >
              Use current time
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-xs"
            >
              Done
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Times are in Philippine Time (UTC+8)
          </p>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      
      {!error && placeholder && !value && (
        <p className="text-xs text-muted-foreground">{placeholder}</p>
      )}
    </div>
  );
}