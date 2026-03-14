import { HEADER_HEIGHT, TIME_COLUMN_HOURS } from '../constants';
import { formatHourAmPm } from '../utils';
import { ClockIcon } from '@phosphor-icons/react';

type TimeColumnProps = {
    hourRowHeights: Record<number, number>;
};

export function TimeColumn({ hourRowHeights }: TimeColumnProps) {
    return (
        <div
            className="sticky left-0 z-10 flex flex-col border-r border-slate-200 bg-white shrink-0 box-border"
            style={{ width: 80 }}
        >
            <div
                className="sticky top-0 z-30 border-b border-slate-200 shrink-0 bg-slate-50/50 flex items-center justify-center box-border overflow-hidden"
                style={{ height: HEADER_HEIGHT, minHeight: HEADER_HEIGHT, maxHeight: HEADER_HEIGHT }}
            >
                <span className="rounded-full border-2 border-slate-300 flex items-center justify-center w-8 h-8" aria-hidden>
                    <ClockIcon size={14} className="text-slate-500" />
                </span>
            </div>
            {TIME_COLUMN_HOURS.map((hour24) => (
                <div
                    key={hour24}
                    className="border-b border-slate-200 flex items-start justify-center px-2 pt-3 box-border bg-slate-50/40"
                    style={{ height: hourRowHeights[hour24], minHeight: hourRowHeights[hour24] }}
                >
                    <span className="text-xs font-medium text-slate-600">{formatHourAmPm(hour24)}</span>
                </div>
            ))}
        </div>
    );
}
