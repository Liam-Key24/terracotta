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
        <header className="px-6 py-3 border-b border-white/30 bg-[#631732]/90 text-white shrink-0">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white/90 inline-flex items-center gap-1.5">
                    <CalendarBlankIcon size={14} weight="bold" />
                    {headerDateLabel}
                </p>
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onOpenAddBooking}
                        className="px-4 py-2 bg-white text-[#631732] rounded-full text-sm font-semibold shadow-sm hover:bg-rose-50 inline-flex items-center gap-1.5"
                    >
                        <PlusIcon size={14} weight="bold" />
                        Book table
                    </button>
                </div>
            </div>
        </header>
    );
}
