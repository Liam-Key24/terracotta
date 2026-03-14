import { HEADER_HEIGHT, TIME_COLUMN_HOURS } from '../constants';
import { formatHourAmPm } from '../utils';
import { ClockIcon } from '@phosphor-icons/react';

type TimeColumnProps = {
    hourRowHeights: Record<number, number>;
    width?: number;
    headerHeight?: number;
};

export function TimeColumn({ hourRowHeights, width = 80, headerHeight = HEADER_HEIGHT }: TimeColumnProps) {
    return (
        <div
            className="sticky left-0 z-10 flex flex-col border-r border-slate-200 bg-white shrink-0 box-border"
            style={{ width }}
        >
            <div
                className="sticky top-0 z-30 border-b border-slate-200 shrink-0 bg-slate-50/50 flex items-center justify-center box-border overflow-hidden"
                style={{ height: headerHeight, minHeight: headerHeight, maxHeight: headerHeight }}
            >
                <span
                    className="rounded-full border-2 border-slate-300 flex items-center justify-center text-slate-500"
                    style={{ width: Math.min(width - 16, 32), height: Math.min(width - 16, 32), minWidth: 24, minHeight: 24 }}
                    aria-hidden
                >
                    <ClockIcon size={width <= 56 ? 12 : 14} className="text-slate-500" />
                </span>
            </div>
            {TIME_COLUMN_HOURS.map((hour24) => (
                <div
                    key={hour24}
                    className="border-b border-slate-200 flex items-start justify-center pt-3 box-border bg-slate-50/40"
                    style={{
                        height: hourRowHeights[hour24],
                        minHeight: hourRowHeights[hour24],
                        paddingLeft: width <= 56 ? 4 : 8,
                        paddingRight: width <= 56 ? 4 : 8,
                    }}
                >
                    <span className={`font-medium text-slate-600 ${width <= 56 ? 'text-[10px]' : 'text-xs'}`}>
                        {formatHourAmPm(hour24)}
                    </span>
                </div>
            ))}
        </div>
    );
}
