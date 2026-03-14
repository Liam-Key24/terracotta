import { CalendarBlankIcon, PlusIcon } from '@phosphor-icons/react';

type CalendarHeaderProps = {
    headerDateLabel: string;
    onOpenAddBooking: () => void;
};

export function CalendarHeader({
    headerDateLabel,
    onOpenAddBooking,
}: CalendarHeaderProps) {
    return (
        <header className="px-4 sm:px-6 py-2.5 sm:py-3 border-b border-white/20 bg-[#631732]/70 backdrop-blur-md text-white shrink-0">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white/90 items-center gap-1.5 hidden md:inline-flex">
                    <CalendarBlankIcon size={14} weight="bold" />
                    {headerDateLabel}
                </p>
                <div className="flex justify-end w-full md:w-auto">
                    <button
                        type="button"
                        onClick={onOpenAddBooking}
                        aria-label="Book table"
                        className="p-1 md:px-3 md:py-1.5 bg-white/95 text-[#631732] rounded-full text-xs font-semibold shadow-sm hover:bg-white inline-flex items-center justify-center gap-1"
                    >
                        <PlusIcon size={14} weight="bold" aria-hidden />
                        <span className="hidden md:inline">Book table</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
