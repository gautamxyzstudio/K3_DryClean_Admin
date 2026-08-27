import type React from "react";
import { useState, useRef, useEffect } from "react";
import dayjs, { type Dayjs } from "dayjs";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Clock,
  X,
} from "lucide-react";

interface CustomDateTimePickerProps {
  value?: string; // Format: "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" or ISO string
  onChange: (value: string) => void;
  mode?: "date" | "datetime";
  label?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  value,
  onChange,
  mode = "datetime",
  placeholder,
  minDate,
  maxDate,
  error,
  disabled = false,
  className = "",
}) => {
  const defaultPlaceholder = mode === "date" ? "Select Date" : "Select Date & Time";
  const displayPlaceholder = placeholder || defaultPlaceholder;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial or current value
  const parsedValue: Dayjs | null = value && dayjs(value).isValid() ? dayjs(value) : null;

  // View state (for month/year browsing)
  const [viewDate, setViewDate] = useState<Dayjs>(parsedValue || dayjs());

  // Selected date components
  const [selectedDay, setSelectedDay] = useState<Dayjs | null>(parsedValue);
  const [hours12, setHours12] = useState<number>(
    parsedValue ? (parsedValue.hour() % 12 === 0 ? 12 : parsedValue.hour() % 12) : 12
  );
  const [minutes, setMinutes] = useState<number>(parsedValue ? parsedValue.minute() : 0);
  const [period, setPeriod] = useState<"AM" | "PM">(
    parsedValue ? (parsedValue.hour() >= 12 ? "PM" : "AM") : "PM"
  );

  // Sync state if external value changes
  useEffect(() => {
    if (value && dayjs(value).isValid()) {
      const d = dayjs(value);
      setSelectedDay(d);
      setViewDate(d);
      setHours12(d.hour() % 12 === 0 ? 12 : d.hour() % 12);
      setMinutes(d.minute());
      setPeriod(d.hour() >= 12 ? "PM" : "AM");
    } else if (!value) {
      setSelectedDay(null);
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Emit updated value
  const emitChange = (day: Dayjs, h12: number, min: number, ampm: "AM" | "PM") => {
    if (mode === "date") {
      onChange(day.format("YYYY-MM-DD"));
      return;
    }

    let h24 = h12 % 12;
    if (ampm === "PM") h24 += 12;

    const newDateTime = day
      .hour(h24)
      .minute(min)
      .second(0)
      .millisecond(0);

    onChange(newDateTime.format("YYYY-MM-DDTHH:mm"));
  };

  // Select day handler
  const handleSelectDay = (day: Dayjs) => {
    setSelectedDay(day);
    emitChange(day, hours12, minutes, period);
    if (mode === "date") {
      setIsOpen(false);
    }
  };

  // Hour stepper
  const handleIncrementHour = () => {
    const nextHour = hours12 >= 12 ? 1 : hours12 + 1;
    setHours12(nextHour);
    const targetDay = selectedDay || dayjs();
    if (!selectedDay) setSelectedDay(targetDay);
    emitChange(targetDay, nextHour, minutes, period);
  };

  const handleDecrementHour = () => {
    const prevHour = hours12 <= 1 ? 12 : hours12 - 1;
    setHours12(prevHour);
    const targetDay = selectedDay || dayjs();
    if (!selectedDay) setSelectedDay(targetDay);
    emitChange(targetDay, prevHour, minutes, period);
  };

  // Minute stepper (5 min increments)
  const handleIncrementMinute = () => {
    const nextMin = minutes >= 55 ? 0 : Math.floor(minutes / 5) * 5 + 5;
    setMinutes(nextMin);
    const targetDay = selectedDay || dayjs();
    if (!selectedDay) setSelectedDay(targetDay);
    emitChange(targetDay, hours12, nextMin, period);
  };

  const handleDecrementMinute = () => {
    const prevMin = minutes <= 0 ? 55 : Math.ceil(minutes / 5) * 5 - 5;
    setMinutes(prevMin);
    const targetDay = selectedDay || dayjs();
    if (!selectedDay) setSelectedDay(targetDay);
    emitChange(targetDay, hours12, prevMin, period);
  };

  // AM/PM toggle
  const handleTogglePeriod = () => {
    const nextPeriod = period === "AM" ? "PM" : "AM";
    setPeriod(nextPeriod);
    const targetDay = selectedDay || dayjs();
    if (!selectedDay) setSelectedDay(targetDay);
    emitChange(targetDay, hours12, minutes, nextPeriod);
  };

  // Quick action: Set Today / Now
  const handleSetNow = () => {
    const now = dayjs();
    setSelectedDay(now);
    setViewDate(now);
    const h12 = now.hour() % 12 === 0 ? 12 : now.hour() % 12;
    const min = now.minute();
    const ampm: "AM" | "PM" = now.hour() >= 12 ? "PM" : "AM";

    setHours12(h12);
    setMinutes(min);
    setPeriod(ampm);

    emitChange(now, h12, min, ampm);
    if (mode === "date") {
      setIsOpen(false);
    }
  };

  // Clear date
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDay(null);
    onChange("");
    setIsOpen(false);
  };

  // Month navigation
  const handlePrevMonth = () => {
    setViewDate((prev) => prev.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => prev.add(1, "month"));
  };

  // Generate calendar days
  const startOfMonth = viewDate.startOf("month");
  const startDayOfWeek = startOfMonth.day(); // 0 = Sunday
  const daysInMonth = viewDate.daysInMonth();

  const prevMonth = viewDate.subtract(1, "month");
  const daysInPrevMonth = prevMonth.daysInMonth();

  // Grid cells (6 rows * 7 cols = 42)
  const calendarCells = [];

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonth.date(daysInPrevMonth - i);
    calendarCells.push({
      date,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = viewDate.date(i);
    calendarCells.push({
      date,
      isCurrentMonth: true,
    });
  }

  // Next month padding
  const remainingCells = 42 - calendarCells.length;
  const nextMonth = viewDate.add(1, "month");
  for (let i = 1; i <= remainingCells; i++) {
    const date = nextMonth.date(i);
    calendarCells.push({
      date,
      isCurrentMonth: false,
    });
  }

  const today = dayjs();
  const minDateParsed = minDate && dayjs(minDate).isValid() ? dayjs(minDate) : null;
  const maxDateParsed = maxDate && dayjs(maxDate).isValid() ? dayjs(maxDate) : null;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Input Trigger Button */}
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-surface text-xs border rounded-xl transition-all select-none cursor-pointer ${
          disabled
            ? "opacity-60 bg-surface-container/50 cursor-not-allowed border-outline-variant/40"
            : isOpen
            ? "border-primary ring-2 ring-primary/20 shadow-xs"
            : error
            ? "border-error focus:ring-error/20"
            : "border-outline-variant hover:border-outline focus-within:border-primary"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon className={`w-3.5 h-3.5 shrink-0 ${isOpen ? "text-primary" : "text-secondary"}`} />
          {parsedValue ? (
            <span className="font-bold text-on-surface text-xs whitespace-nowrap">
              {mode === "date"
                ? parsedValue.format("DD MMM YYYY")
                : parsedValue.format("DD MMM YYYY, hh:mm A")}
            </span>
          ) : (
            <span className="text-secondary/70 text-xs whitespace-nowrap">{displayPlaceholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {parsedValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear date"
              className="p-0.5 rounded-full text-secondary hover:text-on-surface hover:bg-secondary-container/50 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Popover Picker */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 z-50 w-76 bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-xl p-3 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md space-y-2.5">
          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between px-1">
            <span className="font-bold text-xs text-on-surface">
              {viewDate.format("MMMM YYYY")}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1 rounded-md text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1 rounded-md text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
              <span
                key={dayName}
                className="text-[10px] font-bold text-secondary uppercase py-0.5"
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center">
            {calendarCells.map(({ date, isCurrentMonth }, idx) => {
              const isSelected = selectedDay && date.isSame(selectedDay, "day");
              const isToday = date.isSame(today, "day");
              const isBeforeMin = minDateParsed && date.isBefore(minDateParsed, "day");
              const isAfterMax = maxDateParsed && date.isAfter(maxDateParsed, "day");
              const isDisabled = Boolean(isBeforeMin || isAfterMax);

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleSelectDay(date)}
                  className={`h-6.5 w-6.5 mx-auto rounded-md text-[11px] font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-white font-bold shadow-xs scale-105"
                      : isDisabled
                      ? "text-secondary/25 cursor-not-allowed"
                      : !isCurrentMonth
                      ? "text-secondary/35 hover:bg-surface-container/60"
                      : isToday
                      ? "border border-primary text-primary font-bold hover:bg-primary/10"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  {date.date()}
                </button>
              );
            })}
          </div>

          {/* Time Picker Section (only in datetime mode) */}
          {mode === "datetime" ? (
            <div className="pt-2 border-t border-outline-variant/50 flex items-center justify-between gap-1.5 text-xs">
              {/* Time Controls with Stepper Buttons */}
              <div className="flex items-center gap-1 bg-surface px-2 py-1 rounded-lg border border-outline-variant/70">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0 mr-0.5" />

                {/* Hour Stepper */}
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={handleDecrementHour}
                    title="Previous hour"
                    className="p-0.5 hover:bg-surface-container rounded text-secondary hover:text-on-surface cursor-pointer"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-xs w-4.5 text-center text-on-surface">
                    {String(hours12).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrementHour}
                    title="Next hour"
                    className="p-0.5 hover:bg-surface-container rounded text-secondary hover:text-on-surface cursor-pointer"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                </div>

                <span className="font-bold text-secondary text-xs">:</span>

                {/* Minute Stepper */}
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={handleDecrementMinute}
                    title="Minus 5 minutes"
                    className="p-0.5 hover:bg-surface-container rounded text-secondary hover:text-on-surface cursor-pointer"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <span className="font-mono font-bold text-xs w-4.5 text-center text-on-surface">
                    {String(minutes).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrementMinute}
                    title="Plus 5 minutes"
                    className="p-0.5 hover:bg-surface-container rounded text-secondary hover:text-on-surface cursor-pointer"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                </div>

                {/* AM/PM Toggle */}
                <button
                  type="button"
                  onClick={handleTogglePeriod}
                  title="Toggle AM/PM"
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-white hover:bg-primary-container shadow-xs transition-colors ml-1 cursor-pointer"
                >
                  {period}
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleSetNow}
                  title="Set current time"
                  className="px-2 py-1 text-[11px] font-semibold text-secondary hover:text-primary rounded-md transition-colors cursor-pointer"
                >
                  Now
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-primary hover:bg-primary-container rounded-lg transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Mode === "date" footer */
            <div className="pt-2 border-t border-outline-variant/50 flex items-center justify-between gap-1.5 text-xs">
              <button
                type="button"
                onClick={handleSetNow}
                className="px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 rounded-md transition-colors cursor-pointer"
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-xs font-bold text-white bg-primary hover:bg-primary-container rounded-lg transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDateTimePicker;
