import {
    CalendarBlankIcon,
    ClipboardTextIcon,
    ListBulletsIcon,
    TableIcon,
} from '@phosphor-icons/react/dist/ssr';

import type { DeveloperTabKey } from '../types';

const TAB_META = {
    reservations: { label: 'Reservations', icon: CalendarBlankIcon },
    queue: { label: 'Queue', icon: ListBulletsIcon },
    alternatives: { label: 'Alternatives', icon: ClipboardTextIcon },
    tables: { label: 'Tables', icon: TableIcon },
} as const;

const DEVELOPER_TABS: DeveloperTabKey[] = ['reservations', 'queue', 'alternatives', 'tables'];

type DeveloperDataTabsProps = {
    activeTab: DeveloperTabKey;
    onSelectTab: (tab: DeveloperTabKey) => void;
};

export function DeveloperDataTabs({ activeTab, onSelectTab }: DeveloperDataTabsProps) {
    return (
        <div className="flex gap-2 mb-4 border-b border-slate-200">
            {DEVELOPER_TABS.map((tab) => {
                const Icon = TAB_META[tab].icon;
                return (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => onSelectTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px inline-flex items-center gap-1.5 ${activeTab === tab ? 'border-[#631732] text-[#631732]' : 'border-transparent text-slate-600'
                            }`}
                    >
                        <Icon size={14} weight={activeTab === tab ? 'fill' : 'regular'} />
                        {TAB_META[tab].label}
                    </button>
                );
            })}
        </div>
    );
}
