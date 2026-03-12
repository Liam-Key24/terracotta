type CalendarHeaderProps = {
    headerDateLabel: string;
    startDate: string;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
    onDateChange: (iso: string) => void;
    onOpenAddBooking: () => void;
};

export function CalendarHeader({
    headerDateLabel,
    startDate,
    onPrevWeek,
    onNextWeek,
    onToday,
    onDateChange,
    onOpenAddBooking,
}: CalendarHeaderProps) {
    return (
        <header className="px-6 py-3 border-b border-white/30 bg-[#631732]/90 text-white shrink-0">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="hidden md:block" />

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <div className="flex items-center rounded-full bg-white/10 border border-white/30 backdrop-blur px-1 py-0.5">
                        <button
                            type="button"
                            onClick={onPrevWeek}
                            className="p-2 text-white/90 hover:bg-white/10 rounded-full"
                            aria-label="Previous week"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="px-4 py-1.5 text-xs font-medium whitespace-nowrap">{headerDateLabel}</span>
                        <button
                            type="button"
                            onClick={onNextWeek}
                            className="p-2 text-white/90 hover:bg-white/10 rounded-full"
                            aria-label="Next week"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onToday}
                        className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white text-[#5b136e] shadow-sm hover:bg-violet-50"
                    >
                        Today
                    </button>

                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="border border-white/40 bg-white/10 text-white text-xs rounded-full px-3 py-1.5 placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/60"
                    />
                </div>

                <div className="flex justify-center md:justify-end">
                    <button
                        type="button"
                        onClick={onOpenAddBooking}
                        className="px-4 py-2 bg-white text-[#631732] rounded-full text-sm font-semibold shadow-sm hover:bg-rose-50"
                    >
                        + Book table
                    </button>
                </div>
            </div>
        </header>
    );
}
