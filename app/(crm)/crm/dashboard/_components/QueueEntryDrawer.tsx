import { CheckCircleIcon, ClockIcon, QueueIcon, XCircleIcon } from '@phosphor-icons/react/dist/ssr';

import type { QueueAction, QueueEntry, Table } from '../types';

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
        <div className="fixed inset-0 bg-black/50 flex justify-end z-20" onClick={onClose}>
            <div className="w-full max-w-md bg-white shadow-xl overflow-y-auto" onClick={(event) => event.stopPropagation()}>
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
                        <QueueIcon size={16} className="text-[#631732]" />
                        Pending request
                    </h3>
                    <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        Close
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                        <dt className="text-slate-500">Name</dt>
                        <dd className="text-slate-900">{entry.name}</dd>
                        <dt className="text-slate-500">Email</dt>
                        <dd className="text-slate-900">{entry.email}</dd>
                        <dt className="text-slate-500">Phone</dt>
                        <dd className="text-slate-900">{entry.phone}</dd>
                        <dt className="text-slate-500">Date</dt>
                        <dd className="text-slate-900">{entry.date}</dd>
                        <dt className="text-slate-500">Time</dt>
                        <dd className="text-slate-900">{entry.time}</dd>
                        <dt className="text-slate-500">Guests</dt>
                        <dd className="text-slate-900">{entry.guests}</dd>
                        {entry.notes && (
                            <>
                                <dt className="text-slate-500">Notes</dt>
                                <dd className="text-slate-900">{entry.notes}</dd>
                            </>
                        )}
                    </dl>

                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Assign table(s)</p>
                        <div className="flex flex-wrap gap-2">
                            {tables.map((table) => (
                                <button
                                    key={table.id}
                                    type="button"
                                    onClick={() => onToggleTable(table.id)}
                                    className={`px-3 py-1.5 rounded border text-sm ${selectedTableIds.includes(table.id)
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
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-700">Suggest alternative</p>
                            <input
                                type="date"
                                value={suggestDate}
                                onChange={(event) => onSetSuggestDate(event.target.value)}
                                className="w-full border rounded px-2 py-1.5 text-sm"
                            />
                            <input
                                type="time"
                                value={suggestTime}
                                onChange={(event) => onSetSuggestTime(event.target.value)}
                                className="w-full border rounded px-2 py-1.5 text-sm"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={onSuggestAlternative}
                                    disabled={actionLoading !== null || !suggestDate || !suggestTime}
                                    className="px-4 py-2 bg-[#631732] text-white rounded text-sm disabled:opacity-50"
                                >
                                    Send offer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onSetSuggestMode(false)}
                                    className="px-4 py-2 border rounded text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={onApprove}
                                disabled={actionLoading !== null}
                                className="px-4 py-2 bg-[#631732] text-white rounded text-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                                <CheckCircleIcon size={14} weight="fill" />
                                {actionLoading === 'approve' ? 'Approving…' : 'Approve'}
                            </button>
                            <button
                                type="button"
                                onClick={onReject}
                                disabled={actionLoading !== null}
                                className="px-4 py-2 border border-slate-300 rounded text-sm disabled:opacity-50 inline-flex items-center gap-1.5"
                            >
                                <XCircleIcon size={14} />
                                Reject
                            </button>
                            <button
                                type="button"
                                onClick={() => onSetSuggestMode(true)}
                                className="px-4 py-2 border border-slate-300 rounded text-sm inline-flex items-center gap-1.5"
                            >
                                <ClockIcon size={14} />
                                Suggest alternative
                            </button>
                        </div>
                    )}

                    {actionError && <p className="text-red-600 text-sm">{actionError}</p>}
                </div>
            </div>
        </div>
    );
}
