import { CalendarBlankIcon, ListBulletsIcon } from '@phosphor-icons/react/dist/ssr';

type FloorPlanToolbarProps = {
    selectedDate: string;
    reservationCount: number;
    isMenuOpen: boolean;
    menuDisabled?: boolean;
    onToggleMenu: () => void;
};

export function FloorPlanToolbar({
    selectedDate,
    reservationCount,
    isMenuOpen,
    menuDisabled = false,
    onToggleMenu,
}: FloorPlanToolbarProps) {
    return (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200/80">
                <CalendarBlankIcon size={14} aria-hidden />
                {selectedDate}
                <span className="text-slate-400">·</span>
                {reservationCount} reservation{reservationCount === 1 ? '' : 's'}
            </span>
            <button
                type="button"
                disabled={menuDisabled}
                onClick={onToggleMenu}
                aria-label={isMenuOpen ? 'Hide reservations' : 'Show reservations'}
                className="shrink-0 h-10 w-10 lg:w-auto lg:px-4 rounded-xl bg-[#631732] text-white text-sm font-semibold hover:bg-[#55122b] disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
            >
                <ListBulletsIcon size={18} aria-hidden />
                <span className="hidden lg:inline">{isMenuOpen ? 'Hide reservations' : 'Show reservations'}</span>
            </button>
        </div>
    );
}
