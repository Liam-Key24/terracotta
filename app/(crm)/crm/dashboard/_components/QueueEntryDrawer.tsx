import {
    CalendarBlankIcon,
    CheckCircleIcon,
    ClockIcon,
    EnvelopeSimpleIcon,
    NotePencilIcon,
    PhoneIcon,
    QueueIcon,
    TableIcon,
    UserCircleIcon,
    UsersIcon,
    XCircleIcon,
    XIcon,
} from '@phosphor-icons/react/dist/ssr';

import type { QueueAction, QueueEntry, Table } from '../types';

/** 10:00–22:00 in 30-min steps (10am–10pm) as HH:mm */
const ALTERNATIVE_TIME_OPTIONS: string[] = (() => {
    const out: string[] = [];
    for (let h = 10; h <= 22; h++) {
        out.push(`${String(h).padStart(2, '0')}:00`);
        if (h < 22) out.push(`${String(h).padStart(2, '0')}:30`);
    }
    return out;
})();

function formatTimeLabel(hhmm: string): string {
    const [h, m] = hhmm.split(':').map(Number);
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const ampm = h < 12 ? 'AM' : 'PM';
    return m === 0 ? `${h12}:00 ${ampm}` : `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

type QueueEntryDrawerProps = {
    entry: QueueEntry | null;
    tables: Table[];
    selectedTableIds: string[];
    suggestMode: boolean;
    suggestDate: string;
    suggestTime: string;
    actionLoading: QueueAction;
    actionError: string;
    onToggleTable: (tableId: string) => void;
    onSetSuggestMode: (value: boolean) => void;
    onSetSuggestDate: (value: string) => void;
    onSetSuggestTime: (value: string) => void;
    onApprove: () => void;
    onReject: () => void;
    onSuggestAlternative: () => void;
    onClose: () => void;
};

export function QueueEntryDrawer({
    entry,
    tables,
    selectedTableIds,
    suggestMode,
    suggestDate,
    suggestTime,
    actionLoading,
    actionError,
    onToggleTable,
    onSetSuggestMode,
    onSetSuggestDate,
    onSetSuggestTime,
    onApprove,
    onReject,
    onSuggestAlternative,
    onClose,
}: QueueEntryDrawerProps) {
    if (!entry) return null;

    return (
        <div className="fixed inset-0 bg-black/45 flex justify-end z-[100]" onClick={onClose}>
            <aside
                className="h-full w-full max-w-[560px] bg-white shadow-2xl overflow-hidden rounded-l-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-[30px] leading-none font-semibold text-slate-800 inline-flex items-center gap-2">
                        <QueueIcon size={24} className="text-[#631732]" />
                        Pending request
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                        aria-label="Close"
                    >
                        <XIcon size={16} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-50/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-slate-200 bg-white">
                        <div className="px-6 py-5 border-b sm:border-b-0 sm:border-r border-slate-200">
                            <div className="flex flex-col items-start gap-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-500 mb-1 inline-flex items-center gap-1.5">
                                        <UserCircleIcon size={14} />
                                        Contact
                                    </p>
                                    <p className="text-[30px] leading-tight font-semibold text-slate-900 truncate">
                                        {entry.name}
                                    </p>
                                </div>
                                <div className="flex flex-col items-start gap-1.5">
                                    {entry.phone && (
                                        <p className="text-lg leading-tight text-slate-700 inline-flex items-center gap-1.5">
                                            <PhoneIcon size={16} />
                                            {entry.phone}
                                        </p>
                                    )}
                                    {entry.email && (
                                        <p className="text-lg leading-tight text-slate-700 break-all inline-flex items-center gap-1.5">
                                            <EnvelopeSimpleIcon size={16} />
                                            {entry.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-sm font-medium text-slate-500 mb-2 inline-flex items-center gap-1.5">
                                <UsersIcon size={14} />
                                Guests
                            </p>
                            <p className="text-2xl leading-tight font-semibold text-slate-900">
                                {entry.guests} guest{entry.guests === '1' ? '' : 's'}
                            </p>
                        </div>
                    </div>

                    <div className="border-b border-slate-200 bg-white px-6 py-5">
                        <p className="text-sm font-medium text-slate-500 mb-1 inline-flex items-center gap-1.5">
                            <CalendarBlankIcon size={14} />
                            Requested
                        </p>
                        <p className="text-[30px] leading-tight font-semibold text-slate-900">
                            {entry.date} · {entry.time}
                        </p>
                    </div>

                    {entry.notes && (
                        <div className="px-6 py-5 border-b border-slate-200 bg-white">
                            <p className="text-sm font-medium text-slate-500 mb-2 inline-flex items-center gap-1.5">
                                <NotePencilIcon size={14} />
                                Notes
                            </p>
                            <p className="text-xl leading-snug text-slate-900">{entry.notes}</p>
                        </div>
                    )}

                    <div className="px-6 py-5 border-b border-slate-200 bg-white">
                        <p className="text-sm font-medium text-slate-500 mb-2 inline-flex items-center gap-1.5">
                            <TableIcon size={14} />
                            Assign table(s)
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {tables.map((table) => (
                                <button
                                    key={table.id}
                                    type="button"
                                    onClick={() => onToggleTable(table.id)}
                                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                                        selectedTableIds.includes(table.id)
                                            ? 'bg-[#631732] text-white border-[#631732]'
                                            : 'border-slate-300 text-slate-700 hover:border-slate-400'
                                    }`}
                                >
                                    {table.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {suggestMode ? (
                        <div className="px-6 py-5 border-b border-slate-200 bg-white space-y-3">
                            <p className="text-sm font-medium text-slate-700">Suggest alternative</p>
                            <input
                                type="date"
                                value={suggestDate}
                                onChange={(e) => onSetSuggestDate(e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                            />
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1.5">Time</p>
                                <select
                                    value={suggestTime}
                                    onChange={(e) => onSetSuggestTime(e.target.value)}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                                >
                                    <option value="">Select time</option>
                                    {ALTERNATIVE_TIME_OPTIONS.map((t) => (
                                        <option key={t} value={t}>
                                            {formatTimeLabel(t)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={onSuggestAlternative}
                                    disabled={actionLoading !== null || !suggestDate || !suggestTime}
                                    className="px-4 py-2 bg-[#631732] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    Send offer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSetSuggestMode(false)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="px-6 py-5 border-b border-slate-200 bg-white">
                            <p className="text-sm font-medium text-slate-500 mb-3">Actions</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={onApprove}
                                    disabled={actionLoading !== null}
                                    className="px-4 py-2 bg-[#631732] text-white rounded-lg text-sm font-medium disabled:opacity-50 inline-flex items-center gap-1.5"
                                >
                                    <CheckCircleIcon size={14} weight="fill" />
                                    {actionLoading === 'approve' ? 'Approving…' : 'Approve'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onReject}
                                    disabled={actionLoading !== null}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                                >
                                    <XCircleIcon size={14} />
                                    Reject
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSetSuggestMode(true)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 inline-flex items-center gap-1.5"
                                >
                                    <ClockIcon size={14} />
                                    Suggest alternative
                                </button>
                            </div>
                        </div>
                    )}

                    {actionError && (
                        <div className="px-6 py-4 bg-white">
                            <p className="text-red-600 text-sm">{actionError}</p>
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
}
