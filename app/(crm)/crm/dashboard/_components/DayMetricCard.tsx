import type { ReactNode } from 'react';

type DayMetricCardProps = {
    title: string;
    value: string;
    subtitle: string;
    icon: ReactNode;
};

export function DayMetricCard({ title, value, subtitle, icon }: DayMetricCardProps) {
    return (
        <div className="p-5">
            <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-medium text-slate-700">{title}</p>
                <span className="w-9 h-9 rounded-full inline-flex items-center justify-center bg-[#631732]/10 text-[#631732]">
                    {icon}
                </span>
            </div>
            <p className="mt-2 text-[40px] leading-none font-semibold tracking-tight text-slate-900">{value}</p>
            <p className="mt-2 text-base font-medium text-[#631732]/75">{subtitle}</p>
        </div>
    );
}
