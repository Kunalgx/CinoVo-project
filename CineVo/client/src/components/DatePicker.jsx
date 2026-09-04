import { useEffect, useMemo, useState } from "react";

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });
const selectedFormatter = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" });
const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function parseDate(value) {
  if (!value) return new Date();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function sameDay(left, right) {
  return dateKey(left) === dateKey(right);
}

export default function DatePicker({ value, onChange, minDate, maxDate }) {
  const selectedDate = parseDate(value);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
  );

  useEffect(() => {
    const nextDate = parseDate(value);
    setVisibleMonth(new Date(nextDate.getFullYear(), nextDate.getMonth(), 1));
  }, [value]);

  const days = useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [visibleMonth]);

  const minimum = minDate ? parseDate(minDate) : null;
  const maximum = maxDate ? parseDate(maxDate) : null;
  const today = new Date();

  const isDisabled = (day) =>
    (minimum && day < minimum) || (maximum && day > maximum);

  const selectDate = (day) => {
    if (isDisabled(day)) return;
    onChange(dateKey(day));
  };

  const changeMonth = (offset) => {
    setVisibleMonth(
      new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1),
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d131c]/90 p-4 shadow-inner shadow-black/20 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cine-gold">
            Selected date
          </p>
          <p className="mt-1 text-xl font-black tracking-tight text-white">
            {selectedFormatter.format(selectedDate)}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => changeMonth(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-lg text-slate-300 transition hover:border-cine-gold/50 hover:bg-cine-gold/10 hover:text-cine-gold"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => changeMonth(1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-lg text-slate-300 transition hover:border-cine-gold/50 hover:bg-cine-gold/10 hover:text-cine-gold"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-center text-sm font-bold text-slate-200">
        {monthFormatter.format(visibleMonth)}
      </div>
      <div className="grid grid-cols-7 gap-y-2 text-center">
        {weekdays.map((weekday) => (
          <span key={weekday} className="pb-1 text-[9px] font-black tracking-wider text-slate-500">
            {weekday}
          </span>
        ))}
        {days.map((day) => {
          const outsideMonth = day.getMonth() !== visibleMonth.getMonth();
          const disabled = isDisabled(day);
          const selected = sameDay(day, selectedDate);
          const isToday = sameDay(day, today);
          return (
            <button
              type="button"
              key={dateKey(day)}
              disabled={disabled}
              onClick={() => selectDate(day)}
              className={`relative mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition sm:h-10 sm:w-10 ${
                selected
                  ? "bg-cine-gold text-black shadow-[0_0_0_4px_rgba(245,190,66,0.12)]"
                  : disabled || outsideMonth
                    ? "text-slate-700"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              {day.getDate()}
              {isToday && !selected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-cine-accent" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3 text-[10px] text-slate-500">
        <span className="h-2 w-2 rounded-full bg-cine-accent" /> Today
        {minimum && <span className="ml-auto">Past dates unavailable</span>}
      </div>
    </div>
  );
}
